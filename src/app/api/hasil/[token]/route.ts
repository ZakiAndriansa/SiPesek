import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";
import type { ResponsPeluang } from "@/lib/kontrak";

export async function GET(_request: Request, ctx: RouteContext<"/api/hasil/[token]">) {
  const { token } = await ctx.params;
  const cek = await prisma.cekPeluang.findUnique({ where: { token } });
  if (!cek) return galat("Hasil tidak ditemukan.", 404);

  const tersimpan = cek.hasil as Pick<ResponsPeluang, "hasil" | "swasta" | "catatan">;
  return Response.json({
    token: cek.token,
    tahunAcuan: cek.tahunAcuan,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...tersimpan,
  } satisfies ResponsPeluang);
}
