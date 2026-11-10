import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Judul halaman orang tua tanpa kotak dan ilustrasi: judul, satu baris konteks, dan aksi utama (opsional) di kanan.
 * Pengganti PageHeader berilustrasi agar layar pertama langsung berisi jawaban.
 */
export function JudulOrtu({ judul, konteks, aksi }: { judul: string; konteks?: ReactNode; aksi?: ReactNode }) {
  return (
    <header className="ortu-judul">
      <div>
        <h1>{judul}</h1>
        {konteks && <p className="ortu-judul__konteks">{konteks}</p>}
      </div>
      {aksi}
    </header>
  );
}

/** Penutup halaman: satu baris catatan (disclaimer) dan satu tautan ke halaman berikutnya. Pengganti pita oranye. */
export function LanjutOrtu({ catatan, href, label }: { catatan?: ReactNode; href: string; label: string }) {
  return (
    <div className="ortu-lanjut">
      {catatan && <p className="ortu-lanjut__catatan">{catatan}</p>}
      <Link className="link ortu-lanjut__tautan" href={href}>
        {label} →
      </Link>
    </div>
  );
}

export const catatanPerkiraan = (tahun: number) => `Perkiraan dari hasil SPMB ${tahun}, bukan jaminan diterima.`;
