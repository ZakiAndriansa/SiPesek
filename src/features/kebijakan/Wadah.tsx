"use client";
import type { ReactNode } from "react";
import { Alert, Button } from "@/components";
import { muatUlangDashboard, useDashboard, type Dashboard } from "./data";

/** Isi halaman dashboard: menangani memuat dan gagal, lalu memanggil `children` dengan data dashboard. */
export function DenganDashboard({ children }: { children: (d: Dashboard) => ReactNode }) {
  const { status, data } = useDashboard();
  if (status === "memuat") {
    return (
      <div className="card" aria-busy="true">
        <p className="text-secondary">Memuat data SPMB…</p>
      </div>
    );
  }
  if (!data) {
    return (
      <Alert
        kind="danger"
        title="Data dashboard belum bisa dimuat"
        action={
          <Button variant="secondary" onClick={muatUlangDashboard}>
            Coba lagi
          </Button>
        }
      >
        Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.
      </Alert>
    );
  }
  return <>{children(data)}</>;
}

/** Sumber data dashboard; wajib tampil agar angka tidak dibaca sebagai data pendaftaran tahun berjalan. */
export function CatatanSumber({ tahun }: { tahun: number }) {
  return (
    <Alert kind="info" title="Sumber data">
      Angka pendaftar, diterima, dan daya tampung berasal dari data hasil SPMB {tahun} Kota Depok, dalam bentuk agregat
      tanpa data pribadi. Minat berasal dari orang tua yang masuk ke SiPesek dan menyimpan hasil cek, dihitung satu kali per
      anak; minat dari kurang dari 10 anak disamarkan.
    </Alert>
  );
}
