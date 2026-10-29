import type { NextRequest } from "next/server";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ResponsGalat } from "@/lib/kontrak";
import { lupakanCacheMesin } from "@/lib/peluang/muat";
import { skemaAturan } from "@/lib/validasi";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/aturan/[tahun]">) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const tahun = Number((await ctx.params).tahun);
  const data = await prisma.tahunSpmb.findUnique({ where: { tahun } });
  if (!data) return Response.json({ galat: "Tahun tidak ditemukan." } satisfies ResponsGalat, { status: 404 });
  return Response.json(data);
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/admin/aturan/[tahun]">) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const tahun = Number((await ctx.params).tahun);
  if (!Number.isInteger(tahun)) {
    return Response.json({ galat: "Tahun tidak valid." } satisfies ResponsGalat, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const aturan = skemaAturan.safeParse(body?.aturan);
  if (!aturan.success) {
    return Response.json({ galat: "Aturan tidak valid.", detail: aturan.error.issues } satisfies ResponsGalat, {
      status: 400,
    });
  }
  const aktif = body?.aktif === true;
  const hasil = await prisma.$transaction(async (tx) => {
    // Hanya satu tahun yang menjadi acuan mesin peluang.
    if (aktif) await tx.tahunSpmb.updateMany({ where: { tahun: { not: tahun } }, data: { aktif: false } });
    return tx.tahunSpmb.upsert({
      where: { tahun },
      update: { aturan: aturan.data, ...(aktif ? { aktif } : {}) },
      create: { tahun, aturan: aturan.data, aktif },
    });
  });
  lupakanCacheMesin();
  return Response.json(hasil);
}
