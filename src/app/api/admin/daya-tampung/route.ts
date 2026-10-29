import type { NextRequest } from "next/server";
import { z } from "zod";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson } from "@/lib/http";

const skema = z.object({
  tahun: z.number().int().min(2020).max(2100),
  sekolahId: z.number().int(),
  programId: z.number().int().nullable(),
  kuota: z.number().int().min(0).max(5000),
  sumber: z.string().min(3).max(300),
});

// Mengganti daya tampung satu sekolah (atau satu program SMK) untuk satu tahun.
export async function PUT(request: NextRequest) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();

  const masukan = await bacaJson(request, skema, "Data daya tampung tidak valid.");
  if ("gagal" in masukan) return masukan.gagal;

  const { tahun, sekolahId, programId } = masukan.data;
  const hasil = await prisma.$transaction(async (tx) => {
    await tx.dayaTampung.deleteMany({ where: { tahun, sekolahId, programId } });
    return tx.dayaTampung.create({ data: masukan.data });
  });
  return Response.json(hasil);
}
