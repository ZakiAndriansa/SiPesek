/**
 * Porsi siswa yang diterima per jalur di SMA dan SMK negeri Kota Depok, dihitung dari statistik
 * agregat SPMB (data/statistik-2026.json). Dipakai landing page dan Panduan agar angkanya selalu
 * sama dengan data, bukan kuota perkiraan. Seleksi unggulan (SMAN 1 Depok) tidak dihitung karena
 * tidak lewat empat jalur ini.
 */
import statistik from "../../data/statistik-2026.json";
import { SUB_JALUR } from "@/lib/jalur";

export const JALUR_UTAMA = ["DOMISILI", "AFIRMASI", "PRESTASI", "MUTASI"] as const;
export type JalurUtama = (typeof JALUR_UTAMA)[number];
export type PorsiJalur = Record<JalurUtama, { SMA: number; SMK: number }>;

type BarisDiterima = { namaSekolah: string; subJalur: string; diterima: number };

const jalurDari = new Map<string, string>(SUB_JALUR.map((s) => [s.namaDiData, s.jalurKode]));
const utama = (j: string | undefined): j is JalurUtama => JALUR_UTAMA.includes(j as JalurUtama);

/** Persen dibulatkan ke bilangan bulat, per jenjang. */
export function hitungPorsi(baris: BarisDiterima[]): PorsiJalur {
  const jumlah = { SMA: {} as Record<string, number>, SMK: {} as Record<string, number> };
  for (const b of baris) {
    const jalur = jalurDari.get(b.subJalur);
    if (!utama(jalur)) continue;
    const jenjang = /^SMK/i.test(b.namaSekolah) ? "SMK" : "SMA";
    jumlah[jenjang][jalur] = (jumlah[jenjang][jalur] ?? 0) + b.diterima;
  }
  const total = (j: "SMA" | "SMK") => Object.values(jumlah[j]).reduce((a, b) => a + b, 0);
  const persen = (j: "SMA" | "SMK", jalur: JalurUtama) => Math.round((100 * (jumlah[j][jalur] ?? 0)) / (total(j) || 1));
  return Object.fromEntries(
    JALUR_UTAMA.map((jalur) => [jalur, { SMA: persen("SMA", jalur), SMK: persen("SMK", jalur) }]),
  ) as PorsiJalur;
}

export const TAHUN_PORSI = statistik.tahun;
export const PORSI_JALUR = hitungPorsi(statistik.statistik);
