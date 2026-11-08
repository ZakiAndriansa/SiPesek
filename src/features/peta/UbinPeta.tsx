"use client";
import { useRef, useState } from "react";
import { TileLayer } from "react-leaflet";

const HAK_CIPTA_OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * Sumber gambar peta, berurutan. Keduanya data OpenStreetMap dengan tampilan serupa dan tanpa kunci API.
 * Server cadangan dipakai bila server utama gagal, misalnya saat OSM membatasi permintaan ketika ramai.
 */
export const SUMBER_UBIN = [
  { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: HAK_CIPTA_OSM },
  { url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png", attribution: `${HAK_CIPTA_OSM}, server OpenStreetMap Deutschland` },
] as const;

/** Jumlah ubin gagal berturut-turut (tanpa satu pun yang berhasil di antaranya) sebelum pindah server. */
export const BATAS_GAGAL_BERUNTUN = 4;

// Diingat selama tab terbuka: peta di halaman berikutnya langsung memakai server yang terakhir berhasil.
let sumberAktif = 0;

/** Lapisan gambar peta untuk semua peta Leaflet, dengan pindah otomatis ke server cadangan. */
export function UbinPeta() {
  const [indeks, setIndeks] = useState(sumberAktif);
  const gagalBeruntun = useRef(0);
  const sumber = SUMBER_UBIN[indeks];

  return (
    <TileLayer
      key={indeks}
      url={sumber.url}
      attribution={sumber.attribution}
      eventHandlers={{
        tileload: () => {
          gagalBeruntun.current = 0;
        },
        tileerror: () => {
          gagalBeruntun.current += 1;
          if (gagalBeruntun.current < BATAS_GAGAL_BERUNTUN || indeks >= SUMBER_UBIN.length - 1) return;
          gagalBeruntun.current = 0;
          sumberAktif = indeks + 1;
          setIndeks(sumberAktif);
        },
      }}
    />
  );
}
