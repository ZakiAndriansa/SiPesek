"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { Map as PetaLeaflet } from "leaflet";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { PUSAT_DEPOK } from "@/lib/quick-check";

export type TitikKebijakan = {
  id: number;
  nama: string;
  jenjang: "SMA" | "SMK";
  lat: number;
  lng: number;
  /** Radius Jalur Domisili tahun lalu (jarak siswa terjauh yang diterima), dalam meter. */
  radius: number | null;
};

// Leaflet butuh warna langsung; disamakan dengan keterangan peta di halaman.
export const WARNA_JENJANG = { SMA: "#c2410c", SMK: "#1d4ed8" } as const;

/** Sebaran sekolah negeri dan radius Jalur Domisili. Dimuat tanpa SSR karena Leaflet butuh `window`. */
export default function PetaKebijakan({ sekolah, tampilRadius }: { sekolah: TitikKebijakan[]; tampilRadius: boolean }) {
  const [peta, setPeta] = useState<PetaLeaflet | null>(null);

  useEffect(() => {
    if (!peta || sekolah.length === 0) return;
    peta.fitBounds(
      sekolah.map((s) => [s.lat, s.lng] as [number, number]),
      { padding: [32, 32], maxZoom: 13 },
    );
  }, [peta, sekolah]);

  return (
    <MapContainer
      ref={setPeta}
      className="quick__map kebijakan-peta"
      center={[PUSAT_DEPOK.lat, PUSAT_DEPOK.lng]}
      zoom={12}
      minZoom={10}
      scrollWheelZoom={false}
      aria-label="Peta sekolah negeri Kota Depok dengan radius Jalur Domisili. Rincian ada di tabel di bawah."
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {tampilRadius &&
        sekolah.map((s) =>
          s.radius ? (
            <Circle
              key={`r-${s.id}`}
              center={[s.lat, s.lng]}
              radius={s.radius}
              pathOptions={{ color: WARNA_JENJANG[s.jenjang], weight: 1, fillOpacity: 0.08 }}
            />
          ) : null,
        )}
      {sekolah.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: WARNA_JENJANG[s.jenjang], fillOpacity: 1 }}
        >
          <Tooltip direction="top">
            {s.nama}
            {s.radius ? `: radius domisili ${(s.radius / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} km` : ""}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
