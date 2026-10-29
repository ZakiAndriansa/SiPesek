/**
 * Mengubah baris CSV klasemen SPMB menjadi statistik agregat.
 * Dipakai di Node (scripts/impor-klasemen.ts) dan di browser (/admin/impor),
 * jadi tidak boleh mengimpor modul Node atau database.
 *
 * NISN hanya dipakai di memori untuk menghitung pendaftar unik per kecamatan,
 * dan tidak pernah masuk ke hasil.
 */
import type { StatistikKecamatanMasuk, StatistikMasuk } from "@/lib/kontrak";
import { KECAMATAN_DEPOK } from "@/lib/kontrak";

export type BarisMentah = Record<string, string | undefined>;

/** Nama kolom dalam berbagai format file yang pernah ditemui. */
const KOLOM = {
  kodeSekolah: ["NPSN"],
  namaSekolah: ["Nama Sekolah"],
  nisn: ["NISN"],
  nilai: ["Nilai Akhir"],
  subJalur: ["Sub Jalur"],
  pilihan: ["Pilihan Ke"],
  kecamatan: ["Kecamatan"],
  status: ["Status Klasemen", "Status"],
  program: ["Program Keahlian"],
  bidang: ["Bidang Keahlian"],
} as const;

function ambil(baris: BarisMentah, kolom: readonly string[]): string {
  for (const k of kolom) {
    const v = baris[k];
    if (v !== undefined && v.trim() !== "") return v.trim();
  }
  return "";
}

const diterima = (status: string) => ["lulus", "diterima"].includes(status.toLowerCase());

function median(urut: number[]): number | null {
  if (urut.length === 0) return null;
  const t = Math.floor(urut.length / 2);
  return urut.length % 2 ? urut[t] : (urut[t - 1] + urut[t]) / 2;
}

const bulat = (n: number | null) => (n === null ? null : Math.round(n * 1000) / 1000);

export type HasilAgregasi = {
  jumlahBaris: number;
  jumlahSekolah: number;
  statistik: StatistikMasuk[];
  kecamatan: StatistikKecamatanMasuk[];
};

export function agregasi(baris: BarisMentah[]): HasilAgregasi {
  type Grup = {
    kunci: Omit<StatistikMasuk, "pendaftar" | "pendaftarPilihan1" | "diterima" | "nilaiMin" | "nilaiMedian" | "nilaiMaks">;
    pendaftar: number;
    pilihan1: number;
    nilaiDiterima: number[];
  };
  const grup = new Map<string, Grup>();
  // Sekolah yang punya baris tidak diterima. File SMA unggulan hanya memuat yang diterima,
  // sehingga jumlah pendaftarnya tidak diketahui.
  const adaYangDitolak = new Set<string>();
  const kecamatan = new Map<string, { pendaftar: Set<string>; diterima: Set<string> }>();

  for (const b of baris) {
    const kodeSekolah = ambil(b, KOLOM.kodeSekolah);
    const subJalur = ambil(b, KOLOM.subJalur);
    if (!kodeSekolah || !subJalur) continue;

    const status = ambil(b, KOLOM.status);
    const lulus = diterima(status);
    const program = ambil(b, KOLOM.program) || null;
    const jenjang = program ? "SMK" : "SMA";
    if (!lulus) adaYangDitolak.add(kodeSekolah);

    const k = `${kodeSekolah}|${subJalur}|${program ?? ""}`;
    let g = grup.get(k);
    if (!g) {
      g = {
        kunci: {
          kodeSekolah,
          namaSekolah: ambil(b, KOLOM.namaSekolah),
          subJalur,
          program,
          bidang: ambil(b, KOLOM.bidang) || null,
        },
        pendaftar: 0,
        pilihan1: 0,
        nilaiDiterima: [],
      };
      grup.set(k, g);
    }
    g.pendaftar++;
    if (ambil(b, KOLOM.pilihan) === "1") g.pilihan1++;
    const nilai = Number.parseFloat(ambil(b, KOLOM.nilai));
    if (lulus && Number.isFinite(nilai)) g.nilaiDiterima.push(nilai);

    const nisn = ambil(b, KOLOM.nisn);
    const kec = ambil(b, KOLOM.kecamatan);
    if (nisn && kec) {
      const nama = (KECAMATAN_DEPOK as readonly string[]).includes(kec) ? kec : "Luar Depok";
      for (const cakupan of [jenjang, "SEMUA"]) {
        const kk = `${cakupan}|${nama}`;
        let s = kecamatan.get(kk);
        if (!s) kecamatan.set(kk, (s = { pendaftar: new Set(), diterima: new Set() }));
        s.pendaftar.add(nisn);
        if (lulus) s.diterima.add(nisn);
      }
    }
  }

  const statistik: StatistikMasuk[] = [...grup.values()].map((g) => {
    const urut = [...g.nilaiDiterima].sort((a, b) => a - b);
    const lengkap = adaYangDitolak.has(g.kunci.kodeSekolah);
    return {
      ...g.kunci,
      pendaftar: lengkap ? g.pendaftar : null,
      pendaftarPilihan1: lengkap ? g.pilihan1 : null,
      diterima: urut.length,
      nilaiMin: urut.length ? urut[0] : null,
      nilaiMedian: bulat(median(urut)),
      nilaiMaks: urut.length ? urut[urut.length - 1] : null,
    };
  });

  const statistikKecamatan: StatistikKecamatanMasuk[] = [...kecamatan.entries()].map(([kk, s]) => {
    const [cakupan, nama] = kk.split("|") as [StatistikKecamatanMasuk["cakupan"], string];
    return { kecamatan: nama, cakupan, pendaftarUnik: s.pendaftar.size, diterimaUnik: s.diterima.size };
  });

  return {
    jumlahBaris: baris.length,
    jumlahSekolah: new Set(statistik.map((s) => s.kodeSekolah)).size,
    statistik,
    kecamatan: statistikKecamatan,
  };
}
