import type { NextRequest } from "next/server";
import { z } from "zod";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import { lupakanCacheMesin } from "@/lib/peluang/muat";
import { skemaAturan } from "@/lib/validasi";

const skemaUbah = z.object({ aturan: skemaAturan, aktif: z.boolean().optional() });

async function tahunDariParams(ctx: RouteContext<"/api/admin/aturan/[tahun]">) {
  const tahun = Number((await ctx.params).tahun);
  return Number.isInteger(tahun) ? tahun : null;
}

export async function GET(request: NextRequest, ctx: RouteContext<"/api/admin/aturan/[tahun]">) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const tahun = await tahunDariParams(ctx);
  const data = tahun === null ? null : await prisma.tahunSpmb.findUnique({ where: { tahun } });
  if (!data) return galat("Tahun tidak ditemukan.", 404);
  return Response.json(data);
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/admin/aturan/[tahun]">) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const tahun = await tahunDariParams(ctx);
  if (tahun === null) return galat("Tahun tidak valid.", 400);

  const masukan = await bacaJson(request, skemaUbah, "Aturan tidak valid.");
  if ("gagal" in masukan) return masukan.gagal;
  const { aturan, aktif = false } = masukan.data;

  const hasil = await prisma.$transaction(async (tx) => {
    // Hanya satu tahun yang menjadi acuan mesin peluang.
    if (aktif) await tx.tahunSpmb.updateMany({ where: { tahun: { not: tahun } }, data: { aktif: false } });
    return tx.tahunSpmb.upsert({
      where: { tahun },
      update: { aturan, ...(aktif ? { aktif } : {}) },
      create: { tahun, aturan, aktif },
    });
  });
  lupakanCacheMesin();
  return Response.json(hasil);
}
