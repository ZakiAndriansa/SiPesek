"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { Alert, Button } from "@/components";
import type { ResponsPeluang, RiwayatCek } from "@/lib/kontrak";
import { lupakanSesi } from "@/lib/session-actions";
import { useHasilAktif, type AnakOrtu } from "./store";

export type DataTahap = { aktif: AnakOrtu; terakhir: RiwayatCek; hasil: ResponsPeluang };

export const tanggalCek = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

function Memuat({ teks }: { teks: string }) {
  return (
    <div className="card" aria-busy="true">
      <p className="text-secondary">{teks}</p>
    </div>
  );
}

/**
 * Isi halaman tahap (Hasil Sekolah, Strategi, Dokumen, Cadangan, Detail) untuk akun Google.
 * Menangani semua keadaan sebelum ada hasil, lalu memanggil `children` dengan hasil cek terakhir anak aktif.
 */
export function DenganHasil({ children }: { children: (data: DataTahap) => ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, anak, aktif, terakhir, hasil } = useHasilAktif();

  if (status === "memuat") return <Memuat teks="Memuat data anak…" />;
  if (status === "belum-masuk") {
    return (
      <Alert
        kind="info"
        title="Sesi masuk sudah berakhir"
        action={
          <Button
            variant="secondary"
            onClick={async () => {
              await lupakanSesi();
              router.push(`/masuk?next=${encodeURIComponent(pathname)}`);
            }}
          >
            Masuk lagi dengan Google
          </Button>
        }
      >
        Masuk lagi untuk melihat hasil anak yang tersimpan.
      </Alert>
    );
  }
  if (status === "galat") {
    return (
      <Alert kind="danger" title="Data belum bisa dimuat">
        Tidak tersambung ke server SiPesek. Periksa internet, lalu muat ulang halaman ini.
      </Alert>
    );
  }
  if (!aktif || !terakhir) {
    const nama = aktif?.nama;
    return (
      <div className="card empty-state">
        <h2 className="card__title">{nama ? `Belum ada hasil untuk ${nama}` : "Belum ada hasil tersimpan"}</h2>
        <p className="card__text">
          Hasil sekolah, strategi, dan dokumen disusun dari hasil cek yang tersimpan. Cek peluang lewat Cek Cepat, lalu tekan
          Simpan di akhir hasil.
        </p>
        <Button variant="primary" lg href="/cek-cepat" icon="arrow-right">
          {anak.length > 0 ? "Cek lagi" : "Mulai Cek Cepat"}
        </Button>
      </div>
    );
  }
  if (hasil === undefined) return <Memuat teks="Memuat hasil…" />;
  if (hasil === null) {
    return (
      <Alert kind="danger" title="Hasil belum bisa dimuat">
        Tidak tersambung ke server SiPesek. Periksa internet, lalu muat ulang halaman ini.
      </Alert>
    );
  }
  // Kunci per anak dan hasil: ganti anak mengosongkan filter dan isian tak terkendali (misal centang berkas).
  return <Fragment key={`${aktif.id}-${terakhir.token}`}>{children({ aktif, terakhir, hasil })}</Fragment>;
}

/** Keterangan sumber data di bawah judul: hasil cek mana yang dipakai, dan cara memperbaruinya. */
export function SumberHasil({ terakhir, hasil }: { terakhir: RiwayatCek; hasil: ResponsPeluang }) {
  return (
    <p className="text-secondary sumber-hasil">
      Dari cek {tanggalCek(terakhir.dibuatPada)} (acuan SPMB {hasil.tahunAcuan}). Data anak berubah?{" "}
      <Link className="link" href="/cek-cepat">
        Cek lagi
      </Link>{" "}
      lalu simpan; halaman ini memakai hasil terbaru.
    </p>
  );
}
