import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";
import { orangTuaMasuk } from "@/lib/ortu";

// Menghapus anak beserta riwayat ceknya. Anak milik akun lain dijawab 404, bukan 403,
// agar keberadaannya tidak bocor.
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/ortu/anak/[id]">) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const id = Number((await ctx.params).id);
  const { count } = Number.isInteger(id)
    ? await prisma.anak.deleteMany({ where: { id, orangTuaId: ortu.id } })
    : { count: 0 };
  return count ? Response.json({ ok: true }) : galat("Data anak tidak ditemukan.", 404);
}
