import "server-only";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { sesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AnakRingkas, PermintaanPeluang, ResponsPeluang, RiwayatCek } from "@/lib/kontrak";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin } from "@/lib/peluang/muat";

export const BATAS_ANAK = 5;
export const BATAS_CEK_PER_HARI = 20;
const SEHARI_MS = 24 * 60 * 60 * 1000;

export const pesanNisnTerpakai = (milikSendiri: boolean) =>
  milikSendiri
    ? "NISN ini sudah ada di daftar anak Anda."
    : "NISN ini sudah didaftarkan akun lain. Hubungi admin SiPesek bila ini anak Anda.";

/** Pesan 429 bila akun sudah mencapai BATAS_CEK_PER_HARI cek dalam 24 jam terakhir; null bila masih boleh. */
export async function lewatBatasHarian(orangTuaId: number): Promise<string | null> {
  const cekHariIni = await prisma.cekPeluang.count({
    where: { anak: { orangTuaId }, dibuatPada: { gte: new Date(Date.now() - SEHARI_MS) } },
  });
  return cekHariIni >= BATAS_CEK_PER_HARI
    ? `Batas ${BATAS_CEK_PER_HARI} kali cek dalam 24 jam sudah tercapai. Silakan coba lagi besok.`
    : null;
}

/**
 * Hitung peluang atas nama satu anak lalu simpan ringkasannya ke riwayat. Pemilik anak dan batas harian
 * sudah diperiksa pemanggil. Yang disimpan hanya ringkasan: tanpa koordinat rumah dan tanpa nilai rapor atau
 * TKA mentah. Skor akhir disimpan tanpa rinciannya, karena rincian membuka rata-rata rapor dan nilai TKA.
 */
export async function hitungDanSimpan(
  p: PermintaanPeluang,
  anak: { id: number; nama: string; nisnLazim: boolean },
): Promise<ResponsPeluang> {
  const hasil = hitungPeluang(p, await muatDataMesin());

  const subJalur = await prisma.subJalur.findMany({ select: { id: true, kode: true } });
  const idSubJalur = new Map(subJalur.map((s) => [s.kode, s.id]));
  const skorPertama = hasil.hasil.flatMap((h) => h.jalur).find((j) => j.satuan === "skor" && j.nilaiAnak !== null);
  const bawah = skorPertama?.nilaiAnak != null ? Math.floor(skorPertama.nilaiAnak / 10) * 10 : null;
  const token = nanoid(12);

  const cek = await prisma.cekPeluang.create({
    data: {
      token,
      anakId: anak.id,
      tahunAcuan: hasil.tahunAcuan,
      kecamatan: p.kecamatan,
      jenjang: p.jenjang,
      jalurDicek: [...new Set(hasil.hasil.flatMap((h) => h.jalur.map((j) => j.subJalurKode)))],
      rentangSkor: bawah === null ? null : `${bawah}-${bawah + 9}`,
      hasil: {
        hasil: hasil.hasil,
        swasta: hasil.swasta,
        catatan: hasil.catatan,
        skorAnak: hasil.skorAnak.map((s) => ({ ...s, rincian: [] })),
      },
      detail: {
        create: hasil.hasil.flatMap((h) =>
          h.jalur.map((j) => ({ sekolahId: h.sekolah.id, subJalurId: idSubJalur.get(j.subJalurKode)!, label: j.label })),
        ),
      },
    },
  });

  return {
    token,
    anak: { id: anak.id, nama: anak.nama },
    nisnLazim: anak.nisnLazim,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...hasil,
  };
}

/**
 * Orang tua yang sedang masuk, atau null bila belum masuk atau akunnya sudah dihapus
 * (cookie lama yang masih berlaku tidak boleh dipakai untuk akun yang tidak ada).
 */
export async function orangTuaMasuk(request: NextRequest) {
  const sesi = await sesiOrtu(request);
  if (!sesi) return null;
  const ortu = await prisma.orangTua.findUnique({ where: { id: sesi.orangTuaId }, select: { id: true, nama: true, email: true } });
  return ortu && { ...ortu, foto: sesi.foto };
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
