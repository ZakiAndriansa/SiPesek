"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button, Icon } from "@/components";
import type { ResponsSekolah } from "@/lib/kontrak";
import { formatJarak, jarakMeter } from "@/lib/peluang/jarak";
import { diWilayah, type Titik } from "@/lib/quick-check";
import type { SekolahPeta } from "./PetaRumah";

const PetaRumah = dynamic(() => import("./PetaRumah"), {
  ssr: false,
  loading: () => <div className="quick__map quick__map--memuat">Memuat peta…</div>,
});

/**
 * Penanda titik rumah. Titik hanya disimpan di state (memori tab) dan dikirim ke server SiPesek saat
 * menghitung, lalu dibuang. Peta memakai ubin OpenStreetMap; titik rumah tidak pernah dikirim ke sana.
 */
export function HomePicker({ value, onChange }: { value: Titik | null; onChange: (p: Titik | null) => void }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sekolah, setSekolah] = useState<SekolahPeta[]>([]);

  // Titik sekolah negeri sebagai patokan di peta. Gagal dimuat tidak menghalangi isian.
  useEffect(() => {
    let batal = false;
    fetch("/api/sekolah")
      .then((r) => (r.ok ? (r.json() as Promise<ResponsSekolah>) : null))
      .then((d) => {
        if (batal || !d) return;
        setSekolah(
          d.sekolah
            .filter((s) => s.status === "NEGERI" && s.lat !== null && s.lng !== null)
            .map((s) => ({ id: s.id, nama: s.nama, lat: s.lat!, lng: s.lng! })),
        );
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, []);

  function pilih(t: Titik) {
    if (!diWilayah(t)) return setMessage("Titik itu di luar Depok dan sekitarnya. Tandai rumah di dalam wilayah peta.");
    setMessage("");
    onChange(t);
  }

  function locate() {
    if (!("geolocation" in navigator)) return setMessage("Browser ini tidak bisa membaca lokasi. Tandai rumah di peta.");
    setBusy(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        const t = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!diWilayah(t)) {
          return setMessage("Lokasi Bapak/Ibu saat ini di luar Depok dan sekitarnya. Tandai rumah langsung di peta.");
        }
        onChange(t);
      },
      (err) => {
        setBusy(false);
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Tidak apa-apa: tandai rumah langsung di peta."
            : "Lokasi belum terbaca. Coba lagi, atau tandai rumah di peta.",
        );
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
    );
  }

  const terdekat = value
    ? sekolah
        .map((s) => ({ nama: s.nama, jarak: jarakMeter(value, s) }))
        .sort((a, b) => a.jarak - b.jarak)[0]
    : undefined;

  return (
    <div className="stack quick__picker">
      <div className="quick__picker-head">
        <h3 className="field__label">Titik rumah</h3>
        <p className="field__hint" id="peta-hint">
          Ketuk lokasi rumah di peta, atau pakai lokasi HP saat berada di rumah. Dengan keyboard: fokuskan peta, geser dengan
          tombol panah, lalu tekan &quot;Tandai titik di tengah peta&quot;. Titik rumah hanya dipakai untuk menghitung jarak dan
          tidak disimpan.
        </p>
      </div>
      <Button variant="secondary" block iconLeft="map-pin" onClick={locate}>
        {busy ? "Membaca lokasi…" : "Gunakan lokasi saya"}
      </Button>
      <PetaRumah value={value} onChange={pilih} sekolah={sekolah} />
      <p className="quick__picker-status" role="status" aria-live="polite">
        {value
          ? terdekat
            ? `Titik rumah sudah ditandai. Sekolah negeri terdekat: ${terdekat.nama}, sekitar ${formatJarak(terdekat.jarak)}.`
            : "Titik rumah sudah ditandai."
          : "Titik rumah belum ditandai."}
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
