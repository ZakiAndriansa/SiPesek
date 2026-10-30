import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";
import type { ResponsPeluang } from "@/lib/kontrak";
import { orangTuaMasuk } from "@/lib/ortu";

// Hasil memuat data anak, jadi hanya orang tua pemiliknya yang bisa membuka.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/hasil/[token]">) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const { token } = await ctx.params;
  const cek = await prisma.cekPeluang.findFirst({
    where: { token, anak: { orangTuaId: ortu.id } },
    include: { anak: { select: { id: true, nama: true } } },
  });
  if (!cek) return galat("Hasil tidak ditemukan.", 404);

  const tersimpan = cek.hasil as Pick<ResponsPeluang, "hasil" | "swasta" | "catatan">;
  return Response.json({
    token: cek.token,
    anak: cek.anak,
    tahunAcuan: cek.tahunAcuan,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...tersimpan,
  } satisfies ResponsPeluang);
}
