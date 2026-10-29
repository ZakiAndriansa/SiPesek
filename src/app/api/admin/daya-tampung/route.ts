import type { NextRequest } from "next/server";
import { z } from "zod";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ResponsGalat } from "@/lib/kontrak";

const skema = z.object({
  tahun: z.number().int().min(2020).max(2100),
  sekolahId: z.number().int(),
  programId: z.number().int().nullable(),
  kuota: z.number().int().min(0).max(5000),
  sumber: z.string().min(3).max(300),
});

// Mengganti daya tampung satu sekolah (atau satu program SMK) untuk satu tahun.
export async function PUT(request: NextRequest) {
  const sesi = await sesiAdmin(request);
  if (!sesi) return tolakTanpaSesi();
  const masukan = skema.safeParse(await request.json().catch(() => null));
  if (!masukan.success) {
    return Response.json({ galat: "Data daya tampung tidak valid.", detail: masukan.error.issues } satisfies ResponsGalat, {
      status: 400,
    });
  }
  const { tahun, sekolahId, programId } = masukan.data;
  const hasil = await prisma.$transaction(async (tx) => {
    await tx.dayaTampung.deleteMany({ where: { tahun, sekolahId, programId } });
    return tx.dayaTampung.create({ data: masukan.data });
  });
  return Response.json(hasil);
}
