"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { Map as PetaLeaflet } from "leaflet";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import type { LabelPeluang } from "@/lib/kontrak";
import { namaLabel, PUSAT_DEPOK } from "@/lib/quick-check";

export type TitikSekolah = { id: number; nama: string; lat: number; lng: number; label: LabelPeluang };

// Warna penanda mengikuti badge label; Leaflet butuh warna langsung, bukan variabel CSS.
const WARNA: Record<LabelPeluang, string> = {
  PELUANG_BESAR: "#15803d",
  MASIH_MUNGKIN: "#b45309",
  PELUANG_KECIL: "#b91c1c",
  TIDAK_DIHITUNG: "#64748b",
};

/**
 * Peta sekolah negeri hasil cek, diwarnai menurut label terbaik. Titik rumah tidak disimpan, jadi tidak ditampilkan.
 * Dimuat tanpa SSR karena Leaflet butuh `window`.
 */
export default function PetaHasil({ sekolah }: { sekolah: TitikSekolah[] }) {
  const [peta, setPeta] = useState<PetaLeaflet | null>(null);

  // Arahkan peta ke sekolah yang sedang tampil (ikut berubah saat filter diganti).
  useEffect(() => {
    if (!peta || sekolah.length === 0) return;
    peta.fitBounds(
      sekolah.map((s) => [s.lat, s.lng] as [number, number]),
      { padding: [32, 32], maxZoom: 14 },
    );
  }, [peta, sekolah]);

  return (
    <MapContainer
      ref={setPeta}
      className="quick__map hasil-peta"
      center={[PUSAT_DEPOK.lat, PUSAT_DEPOK.lng]}
      zoom={12}
      minZoom={10}
      scrollWheelZoom={false}
      aria-label="Peta sekolah negeri hasil cek, diwarnai menurut label peluang."
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {sekolah.map((s) => (
        <CircleMarker
          key={s.id}
          center={[s.lat, s.lng]}
          radius={8}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: WARNA[s.label], fillOpacity: 1 }}
        >
          <Tooltip direction="top">
            {s.nama}: {namaLabel(s.label)}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
