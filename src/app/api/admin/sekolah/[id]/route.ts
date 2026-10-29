import type { NextRequest } from "next/server";
import { z } from "zod";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import { lupakanCacheMesin } from "@/lib/peluang/muat";

const skema = z
  .object({
    lat: z.number().min(-6.5).max(-6.3).nullable(),
    lng: z.number().min(106.7).max(106.95).nullable(),
    alamat: z.string().min(1).max(300),
    biayaRingkas: z.string().max(300).nullable(),
    biayaResmi: z.boolean().nullable(),
    biayaUrl: z.url().nullable(),
  })
  .partial();

// Untuk melengkapi koordinat (mis. SMKN 5) dan biaya sekolah swasta.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/sekolah/[id]">) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return galat("Id sekolah tidak valid.", 400);

  const masukan = await bacaJson(request, skema, "Data sekolah tidak valid.");
  if ("gagal" in masukan) return masukan.gagal;

  const sekolah = await prisma.sekolah.update({ where: { id }, data: masukan.data });
  lupakanCacheMesin();
  return Response.json(sekolah);
}
