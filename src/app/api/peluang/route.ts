import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsPeluang } from "@/lib/kontrak";
import { BATAS_CEK_PER_HARI, orangTuaMasuk } from "@/lib/ortu";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin } from "@/lib/peluang/muat";
import { skemaPermintaanPeluang } from "@/lib/validasi";

const SEHARI_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const masukan = await bacaJson(request, skemaPermintaanPeluang, "Isian belum lengkap atau tidak sesuai.");
  if ("gagal" in masukan) return masukan.gagal;

  const anak = await prisma.anak.findFirst({
    where: { id: masukan.data.anakId, orangTuaId: ortu.id },
    select: { id: true, nama: true },
  });
  if (!anak) return galat("Data anak tidak ditemukan.", 404);

  const cekHariIni = await prisma.cekPeluang.count({
    where: { anak: { orangTuaId: ortu.id }, dibuatPada: { gte: new Date(Date.now() - SEHARI_MS) } },
  });
  if (cekHariIni >= BATAS_CEK_PER_HARI) {
    return galat(`Batas ${BATAS_CEK_PER_HARI} kali cek dalam 24 jam sudah tercapai. Silakan coba lagi besok.`, 429);
  }

  const hasil = hitungPeluang(masukan.data, await muatDataMesin());

  // Yang disimpan hanya ringkasan: tanpa koordinat rumah, tanpa nilai persis.
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
      kecamatan: masukan.data.kecamatan,
      jenjang: masukan.data.jenjang,
      jalurDicek: [...new Set(hasil.hasil.flatMap((h) => h.jalur.map((j) => j.subJalurKode)))],
      rentangSkor: bawah === null ? null : `${bawah}-${bawah + 9}`,
      hasil: { hasil: hasil.hasil, swasta: hasil.swasta, catatan: hasil.catatan },
      detail: {
        create: hasil.hasil.flatMap((h) =>
          h.jalur.map((j) => ({ sekolahId: h.sekolah.id, subJalurId: idSubJalur.get(j.subJalurKode)!, label: j.label })),
        ),
      },
    },
  });

  return Response.json({ token, anak, dibuatPada: cek.dibuatPada.toISOString(), ...hasil } satisfies ResponsPeluang);
}
