import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import type { ResponsGalat, ResponsPeluang } from "@/lib/kontrak";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin } from "@/lib/peluang/muat";
import { skemaPermintaanPeluang } from "@/lib/validasi";

export async function POST(request: Request) {
  const masukan = skemaPermintaanPeluang.safeParse(await request.json().catch(() => null));
  if (!masukan.success) {
    return Response.json(
      { galat: "Isian belum lengkap atau tidak sesuai.", detail: masukan.error.issues } satisfies ResponsGalat,
      { status: 400 },
    );
  }

  const data = await muatDataMesin();
  const hasil = hitungPeluang(masukan.data, data);

  // Yang disimpan hanya ringkasan anonim: tanpa koordinat rumah, tanpa nilai persis.
  const subJalur = await prisma.subJalur.findMany({ select: { id: true, kode: true } });
  const idSubJalur = new Map(subJalur.map((s) => [s.kode, s.id]));
  const skorPertama = hasil.hasil.flatMap((h) => h.jalur).find((j) => j.satuan === "skor" && j.nilaiAnak !== null);
  const bawah = skorPertama ? Math.floor(skorPertama.nilaiAnak! / 10) * 10 : null;
  const token = nanoid(12);

  const cek = await prisma.cekPeluang.create({
    data: {
      token,
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

  return Response.json({ token, dibuatPada: cek.dibuatPada.toISOString(), ...hasil } satisfies ResponsPeluang);
}
