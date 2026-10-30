/**
 * Validasi NISN tanpa API. Pencarian NISN resmi (nisn.data.kemendikdasmen.go.id) dilindungi
 * reCAPTCHA dan tidak punya API publik, jadi server hanya memeriksa format dan kewajaran.
 *
 * Pola NISN: 10 digit, digit pertama 0, 2, atau 3, lalu dua digit tahun lahir. Di CSV SPMB 2026,
 * 99,7% pendaftar berawalan 0 atau 3 dengan tahun lahir 2008 sampai 2012. Sisanya tetap anak
 * sungguhan, jadi NISN yang tidak lazim hanya ditandai, tidak ditolak.
 */
import { createHmac } from "node:crypto";

export type HasilPeriksaNisn = { sah: false; pesan: string } | { sah: true; nisn: string; lazim: boolean; nisnAkhir: string };

/** Rentang umur calon siswa SMA/SMK yang masih dianggap lazim (kelas 7 sampai lulusan yang terlambat). */
const UMUR_TERTUA = 18;
const UMUR_TERMUDA = 12;

export function periksaNisn(masukan: string, tahunSekarang = new Date().getFullYear()): HasilPeriksaNisn {
  const nisn = masukan.replace(/\s/g, "");
  if (!/^\d{10}$/.test(nisn)) return { sah: false, pesan: "NISN harus 10 digit angka." };

  const tahunLahir = 2000 + Number(nisn.slice(1, 3));
  const lazim =
    ["0", "2", "3"].includes(nisn[0]) &&
    tahunLahir >= tahunSekarang - UMUR_TERTUA &&
    tahunLahir <= tahunSekarang - UMUR_TERMUDA;
  return { sah: true, nisn, lazim, nisnAkhir: nisn.slice(-3) };
}

/** Sidik NISN untuk mengecek keunikan tanpa menyimpan NISN asli. NISN_PEPPER tidak boleh diganti. */
export function sidikNisn(nisn: string, pepper = process.env.NISN_PEPPER): string {
  if (!pepper || pepper.length < 32) throw new Error("NISN_PEPPER belum diisi (minimal 32 karakter).");
  return createHmac("sha256", pepper).update(nisn).digest("hex");
}
