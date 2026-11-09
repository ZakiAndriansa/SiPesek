import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsSimpanCek } from "@/lib/kontrak";
import { periksaNisn, sidikNisn } from "@/lib/nisn";
import {
  BATAS_ANAK,
  denganKunciAkun,
  hitungDanSimpan,
  orangTuaMasuk,
  pesanNisnTerpakai,
  tolakBilaTerlaluCepat,
} from "@/lib/ortu";
import { skemaSimpanCek } from "@/lib/validasi";

// Simpan hasil Cek Cepat ke akun: cari atau buat anak dari NISN, lalu hitung ulang dan simpan ke riwayat.
// Satu permintaan agar orang tua tidak perlu mengetik NISN lagi dan tidak ada anak tanpa hasil bila gagal di tengah.
export async function POST(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const masukan = await bacaJson(request, skemaSimpanCek, "Isi nama anak, centang persetujuan, dan lengkapi isian cek.");
  if ("gagal" in masukan) return masukan.gagal;
  // `setuju` sudah dipastikan true oleh skema; sisanya adalah permintaan peluang biasa.
  const { nama, nisn: nisnMentah, setuju, ...permintaan } = masukan.data;
  void setuju;

  const nisn = periksaNisn(nisnMentah);
  if (!nisn.sah) return galat(nisn.pesan, 400);

  // Batas per menit diperiksa sebelum membuat anak, agar tidak tersisa anak tanpa hasil.
  const terlaluCepat = await tolakBilaTerlaluCepat(ortu.id);
  if (terlaluCepat) return terlaluCepat;

  const sidik = sidikNisn(nisn.nisn);
  const pilih = { id: true, nama: true, nisnLazim: true, orangTuaId: true } as const;
  // Cari atau buat anak di bawah kunci akun: dua tab yang menyimpan NISN yang sama bersamaan tidak lagi saling
  // menolak. Yang kedua menunggu, lalu menemukan anak yang baru dibuat dan menyimpan hasilnya ke anak itu.
  let pilihanAnak;
  try {
    pilihanAnak = await denganKunciAkun(ortu.id, async (tx) => {
      const ada = await tx.anak.findUnique({ where: { sidikNisn: sidik }, select: pilih });
      if (ada && ada.orangTuaId !== ortu.id) return { galat: galat(pesanNisnTerpakai(false), 409) };
      if (ada) return { anak: ada, anakBaru: false };
      if ((await tx.anak.count({ where: { orangTuaId: ortu.id } })) >= BATAS_ANAK) {
        return { galat: galat(`Satu akun paling banyak ${BATAS_ANAK} anak. Hapus salah satu anak di halaman Data Anak dulu.`, 422) };
      }
      const anak = await tx.anak.create({
        data: { orangTuaId: ortu.id, nama, sidikNisn: sidik, nisnAkhir: nisn.nisnAkhir, nisnLazim: nisn.lazim },
        select: pilih,
      });
      return { anak, anakBaru: true };
    });
  } catch (e) {
    // Akun lain mendaftarkan NISN yang sama tepat bersamaan (kunci hanya berlaku per akun).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return galat(pesanNisnTerpakai(false), 409);
    throw e;
  }
  if ("galat" in pilihanAnak) return pilihanAnak.galat;
  const { anak, anakBaru } = pilihanAnak;

  const hasil = await hitungDanSimpan(permintaan, anak);
  return Response.json({ ...hasil, anakBaru } satisfies ResponsSimpanCek, { status: anakBaru ? 201 : 200 });
}
