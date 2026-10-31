"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { Alert, Button, ButtonGroup } from "@/components";
import { CEK_LAGI_HREF, lanjutIsiHref } from "./isian";
import type { ResponsPeluang, RiwayatCek } from "@/lib/kontrak";
import { lupakanSesi } from "@/lib/session-actions";
import { useHasilAktif, type AnakOrtu } from "./store";

export type DataTahap = { aktif: AnakOrtu; terakhir: RiwayatCek; hasil: ResponsPeluang };

export const tanggalCek = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export function Memuat({ teks }: { teks: string }) {
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
  const { status, anak, aktif, terakhir, hasil } = useHasilAktif();

  if (status === "memuat") return <Memuat teks="Memuat data anak…" />;
  if (status === "belum-masuk") return <SesiBerakhir />;
  if (status === "galat") return <GagalMuat />;
  if (!aktif || !terakhir) {
    const nama = aktif?.nama;
    return (
      <div className="card empty-state">
        <h2 className="card__title">{nama ? `Belum ada hasil untuk ${nama}` : "Belum ada hasil tersimpan"}</h2>
        <p className="card__text">
          Hasil sekolah, strategi, dan dokumen disusun dari hasil cek yang tersimpan. Lengkapi data anak, atau coba Cek
          Cepat lalu tekan Simpan di akhir hasil.
        </p>
        <ButtonGroup>
          <Button variant="primary" lg href={aktif ? lanjutIsiHref(aktif.id) : "/isi-data/1?baru=1"} icon="arrow-right">
            {aktif ? "Lanjutkan isi data" : "Isi data anak"}
          </Button>
          {anak.length === 0 && (
            <Button variant="secondary" lg href="/cek-cepat">
              Coba Cek Cepat
            </Button>
          )}
        </ButtonGroup>
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
      <Link className="link" href={CEK_LAGI_HREF}>
        Perbarui data dan cek lagi
      </Link>
      ; halaman ini memakai hasil terbaru.
    </p>
  );
}

/** Sesi Google habis: hapus sesi lama lalu kembali ke halaman ini setelah masuk. */
export function SesiBerakhir() {
  const router = useRouter();
  const pathname = usePathname();
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
      Masuk lagi untuk melanjutkan. Data anak yang tersimpan tidak hilang.
    </Alert>
  );
}

export function GagalMuat() {
  return (
    <Alert kind="danger" title="Data belum bisa dimuat">
      Tidak tersambung ke server SiPesek. Periksa internet, lalu muat ulang halaman ini.
    </Alert>
  );
}
