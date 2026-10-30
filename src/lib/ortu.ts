import "server-only";
import type { NextRequest } from "next/server";
import { sesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AnakRingkas, ResponsPeluang, RiwayatCek } from "@/lib/kontrak";

export const BATAS_ANAK = 5;
export const BATAS_CEK_PER_HARI = 20;

/**
 * Orang tua yang sedang masuk, atau null bila belum masuk atau akunnya sudah dihapus
 * (cookie lama yang masih berlaku tidak boleh dipakai untuk akun yang tidak ada).
 */
export async function orangTuaMasuk(request: NextRequest) {
  const sesi = await sesiOrtu(request);
  if (!sesi) return null;
  return prisma.orangTua.findUnique({ where: { id: sesi.orangTuaId }, select: { id: true, nama: true, email: true } });
}

export const pilihAnak = {
  id: true,
  nama: true,
  nisnAkhir: true,
  nisnLazim: true,
  _count: { select: { cek: true } },
} as const;

type AnakTerpilih = { id: number; nama: string; nisnAkhir: string; nisnLazim: boolean; _count: { cek: number } };

export const keAnakRingkas = ({ _count, ...a }: AnakTerpilih): AnakRingkas => ({ ...a, jumlahCek: _count.cek });

/** Ringkasan satu cek untuk daftar riwayat, dari kartu hasil yang tersimpan. */
export function keRiwayat(cek: {
  token: string;
  dibuatPada: Date;
  tahunAcuan: number;
  jenjang: string;
  kecamatan: string | null;
  hasil: unknown;
}): RiwayatCek {
  const kartu = (cek.hasil as Pick<ResponsPeluang, "hasil">).hasil ?? [];
  const hitung = (label: string) => kartu.filter((h) => h.labelTerbaik === label).length;
  return {
    token: cek.token,
    dibuatPada: cek.dibuatPada.toISOString(),
    tahunAcuan: cek.tahunAcuan,
    jenjang: cek.jenjang as RiwayatCek["jenjang"],
    kecamatan: cek.kecamatan,
    ringkas: {
      jumlahSekolah: kartu.length,
      peluangBesar: hitung("PELUANG_BESAR"),
      masihMungkin: hitung("MASIH_MUNGKIN"),
      peluangKecil: hitung("PELUANG_KECIL"),
    },
  };
}
