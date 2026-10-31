import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsSimpanCek } from "@/lib/kontrak";
import { periksaNisn, sidikNisn } from "@/lib/nisn";
import { BATAS_ANAK, hitungDanSimpan, lewatBatasHarian, orangTuaMasuk, pesanNisnTerpakai } from "@/lib/ortu";
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

  // Batas harian diperiksa sebelum membuat anak, agar tidak tersisa anak tanpa hasil.
  const batas = await lewatBatasHarian(ortu.id);
  if (batas) return galat(batas, 429);

  const sidik = sidikNisn(nisn.nisn);
  const pilih = { id: true, nama: true, nisnLazim: true, orangTuaId: true } as const;
  let anak = await prisma.anak.findUnique({ where: { sidikNisn: sidik }, select: pilih });
  if (anak && anak.orangTuaId !== ortu.id) return galat(pesanNisnTerpakai(false), 409);

  const anakBaru = !anak;
  if (!anak) {
    if ((await prisma.anak.count({ where: { orangTuaId: ortu.id } })) >= BATAS_ANAK) {
      return galat(`Satu akun paling banyak ${BATAS_ANAK} anak. Hapus salah satu anak di halaman Data Anak dulu.`, 422);
    }
    try {
      anak = await prisma.anak.create({
        data: { orangTuaId: ortu.id, nama, sidikNisn: sidik, nisnAkhir: nisn.nisnAkhir, nisnLazim: nisn.lazim },
        select: pilih,
      });
    } catch (e) {
      // Dua permintaan bersamaan dengan NISN yang sama: yang kalah mendapat 409.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return galat(pesanNisnTerpakai(false), 409);
      throw e;
    }
  }

  const hasil = await hitungDanSimpan(permintaan, anak);
  return Response.json({ ...hasil, anakBaru } satisfies ResponsSimpanCek, { status: anakBaru ? 201 : 200 });
}
