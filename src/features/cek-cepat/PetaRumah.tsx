"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import type { Map as PetaLeaflet } from "leaflet";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import { Button } from "@/components";
import { PUSAT_DEPOK, WILAYAH, type Titik } from "@/lib/quick-check";

export type SekolahPeta = { id: number; nama: string; lat: number; lng: number };

const BATAS: [[number, number], [number, number]] = [
  [WILAYAH.selatan, WILAYAH.barat],
  [WILAYAH.utara, WILAYAH.timur],
];

function KetukPeta({ onPilih }: { onPilih: (t: Titik) => void }) {
  useMapEvents({ click: (e) => onPilih({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/**
 * Peta jalan Depok (ubin OpenStreetMap). Titik rumah hanya hidup di state pemanggil; ubin peta dimuat
 * dari server OpenStreetMap tanpa membawa titik rumah. Dimuat tanpa SSR karena Leaflet butuh `window`.
 */
export default function PetaRumah({
  value,
  onChange,
  sekolah,
}: {
  value: Titik | null;
  onChange: (t: Titik) => void;
  sekolah: SekolahPeta[];
}) {
  const [peta, setPeta] = useState<PetaLeaflet | null>(null);

  // Titik dari "Gunakan lokasi saya" dibawa ke tengah peta.
  useEffect(() => {
    if (peta && value && !peta.getBounds().pad(-0.1).contains([value.lat, value.lng])) {
      peta.setView([value.lat, value.lng], Math.max(peta.getZoom(), 15));
    }
  }, [peta, value]);

  return (
    <>
      <MapContainer
        ref={setPeta}
        className="quick__map"
        center={[PUSAT_DEPOK.lat, PUSAT_DEPOK.lng]}
        zoom={12}
        minZoom={11}
        maxBounds={BATAS}
        maxBoundsViscosity={0.8}
        scrollWheelZoom={false}
        aria-label="Peta jalan Depok. Ketuk lokasi rumah untuk menaruh pin."
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <KetukPeta onPilih={onChange} />
        {sekolah.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={5}
            pathOptions={{ color: "#1f4fbf", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
            interactive
            bubblingMouseEvents
          >
            <Tooltip direction="top">{s.nama}</Tooltip>
          </CircleMarker>
        ))}
        {value && (
          <CircleMarker
            center={[value.lat, value.lng]}
            radius={10}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#e8590c", fillOpacity: 1 }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              Rumah
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
      <Button
        variant="ghost"
        sm
        iconLeft="map-pin"
        onClick={() => {
          if (!peta) return;
          const c = peta.getCenter();
          onChange({ lat: c.lat, lng: c.lng });
        }}
      >
        Tandai titik di tengah peta
      </Button>
    </>
  );
}
