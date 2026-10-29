import type { NextRequest } from "next/server";
import { z } from "zod";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ResponsGalat } from "@/lib/kontrak";
import { lupakanCacheMesin } from "@/lib/peluang/muat";

const skema = z
  .object({
    lat: z.number().min(-6.5).max(-6.3).nullable(),
    lng: z.number().min(106.7).max(106.95).nullable(),
    alamat: z.string().min(1).max(300),
    biayaRingkas: z.string().max(300).nullable(),
    biayaResmi: z.boolean().nullable(),
    biayaUrl: z.string().url().nullable(),
  })
  .partial();

// Untuk melengkapi koordinat (mis. SMKN 5) dan biaya sekolah swasta.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/sekolah/[id]">) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const id = Number((await ctx.params).id);
  const masukan = skema.safeParse(await request.json().catch(() => null));
  if (!Number.isInteger(id) || !masukan.success) {
    return Response.json({ galat: "Data sekolah tidak valid.", detail: masukan.error?.issues } satisfies ResponsGalat, {
      status: 400,
    });
  }
  const sekolah = await prisma.sekolah.update({ where: { id }, data: masukan.data });
  lupakanCacheMesin();
  return Response.json(sekolah);
}
