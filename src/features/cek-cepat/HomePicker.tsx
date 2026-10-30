"use client";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { Button, Icon } from "@/components";
import { Roads } from "@/components/map/Map";
import { SCHOOLS } from "@/data/schools";
import {
  BOUNDS,
  fromPercent,
  inBounds,
  MAP_ASPECT,
  nearestKecamatan,
  SCHOOL_POINT,
  toPercent,
  type GeoPoint,
} from "@/data/geo";

const STEP_KM = 0.25;
const shortName = (name: string) => name.replace("SMA Negeri ", "SMAN ").split(" ").slice(0, 2).join(" ");

/**
 * Penanda titik rumah. Titik hanya disimpan di state komponen (memori tab) dan dipakai untuk menghitung jarak
 * di browser. Tidak ada permintaan jaringan: peta ini skematis, tanpa ubin dari server peta pihak ketiga.
 */
export function HomePicker({ value, onChange }: { value: GeoPoint | null; onChange: (p: GeoPoint | null) => void }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const pin = value ? toPercent(value) : null;

  function place(e: MouseEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const point = fromPercent(((e.clientX - box.left) / box.width) * 100, ((e.clientY - box.top) / box.height) * 100);
    setMessage("");
    onChange(point);
  }

  function nudge(e: KeyboardEvent<HTMLDivElement>) {
    const dx = e.key === "ArrowRight" ? STEP_KM : e.key === "ArrowLeft" ? -STEP_KM : 0;
    const dy = e.key === "ArrowUp" ? STEP_KM : e.key === "ArrowDown" ? -STEP_KM : 0;
    if (!dx && !dy && e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const base = value ?? fromPercent(50, 50);
    const p = toPercent(base);
    const kmW = BOUNDS.east - BOUNDS.west;
    const kmH = BOUNDS.north - BOUNDS.south;
    const next = fromPercent(
      Math.min(100, Math.max(0, p.x + (dx / kmW) * 100)),
      Math.min(100, Math.max(0, p.y - (dy / kmH) * 100)),
    );
    setMessage("");
    onChange(next);
  }

  function locate() {
    if (!("geolocation" in navigator)) return setMessage("Browser ini tidak bisa membaca lokasi. Tandai rumah di peta atau pilih kecamatan.");
    setBusy(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (!inBounds(point)) {
          return setMessage("Lokasi Bapak/Ibu di luar wilayah layanan SiPesek. Tandai rumah di peta atau pilih kecamatan.");
        }
        onChange(point);
      },
      (err) => {
        setBusy(false);
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Tidak apa-apa: tandai rumah di peta atau pilih kecamatan."
            : "Lokasi belum terbaca. Coba lagi, atau tandai rumah di peta.",
        );
      },
      { timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <div className="stack quick__picker">
      <div className="quick__picker-head">
        <h3 className="field__label">Titik rumah</h3>
        <p className="field__hint" id="peta-hint">
          Ketuk peta untuk menaruh pin rumah. Dengan keyboard: fokuskan peta, lalu tekan tombol panah. Lokasi tidak dikirim ke mana pun dan hilang saat tab ditutup.
        </p>
      </div>
      <Button variant="secondary" block iconLeft="map-pin" onClick={locate}>
        {busy ? "Membaca lokasi…" : "Gunakan lokasi saya"}
      </Button>
      <div
        className="map quick__map"
        style={{ aspectRatio: MAP_ASPECT }}
        role="application"
        tabIndex={0}
        aria-label="Peta wilayah layanan. Tandai titik rumah."
        aria-describedby="peta-hint"
        onClick={place}
        onKeyDown={nudge}
      >
        <Roads />
        {SCHOOLS.filter((s) => SCHOOL_POINT[s.id]).map((s) => {
          const at = toPercent(SCHOOL_POINT[s.id]);
          return (
            <span key={s.id} className="quick__school" style={{ left: `${at.x}%`, top: `${at.y}%` }}>
              <Icon name="school" className="icon icon--sm" />
              <span className="quick__school-name">{shortName(s.name)}</span>
            </span>
          );
        })}
        {pin && (
          <span className="map__home" style={{ ["--x" as string]: `${pin.x}%`, ["--y" as string]: `${pin.y}%` }}>
            <Icon name="home" className="icon icon--sm" />
            Rumah
          </span>
        )}
      </div>
      <p className="quick__picker-status" role="status" aria-live="polite">
        {value ? `Titik rumah ditandai di Kecamatan ${nearestKecamatan(value)}.` : "Titik rumah belum ditandai."}
      </p>
      {message && (
        <p className="field__error" role="alert">
          <Icon name="alert" />
          <span>{message}</span>
        </p>
      )}
      {value && (
        <Button variant="ghost" sm onClick={() => onChange(null)}>
          Hapus titik rumah
        </Button>
      )}
    </div>
  );
}
