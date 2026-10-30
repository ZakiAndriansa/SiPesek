import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";
import type { ResponsRiwayat } from "@/lib/kontrak";
import { keAnakRingkas, keRiwayat, orangTuaMasuk, pilihAnak } from "@/lib/ortu";

export async function GET(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const anakId = Number(request.nextUrl.searchParams.get("anakId"));
  const anak = Number.isInteger(anakId)
    ? await prisma.anak.findFirst({ where: { id: anakId, orangTuaId: ortu.id }, select: pilihAnak })
    : null;
  if (!anak) return galat("Data anak tidak ditemukan.", 404);

  const cek = await prisma.cekPeluang.findMany({
    where: { anakId: anak.id },
    select: { token: true, dibuatPada: true, tahunAcuan: true, jenjang: true, kecamatan: true, hasil: true },
    orderBy: { dibuatPada: "desc" },
  });
  return Response.json({ anak: keAnakRingkas(anak), riwayat: cek.map(keRiwayat) } satisfies ResponsRiwayat);
}
