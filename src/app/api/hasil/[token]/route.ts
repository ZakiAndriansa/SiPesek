import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { ResponsGalat, ResponsPeluang } from "@/lib/kontrak";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/hasil/[token]">) {
  const { token } = await ctx.params;
  const cek = await prisma.cekPeluang.findUnique({ where: { token } });
  if (!cek) {
    return Response.json({ galat: "Hasil tidak ditemukan." } satisfies ResponsGalat, { status: 404 });
  }
  const tersimpan = cek.hasil as Pick<ResponsPeluang, "hasil" | "swasta" | "catatan">;
  return Response.json({
    token: cek.token,
    tahunAcuan: cek.tahunAcuan,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...tersimpan,
  } satisfies ResponsPeluang);
}
