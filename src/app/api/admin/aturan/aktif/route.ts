import type { NextRequest } from "next/server";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";

/**
 * Aturan tahun SPMB yang sedang aktif, dengan bentuk sama seperti GET /api/admin/aturan/[tahun]. Halaman Aturan
 * SPMB cukup satu panggilan saat dibuka; dulu ia mengunduh seluruh dashboard dulu hanya untuk tahu tahunnya.
 * 404 bila belum ada tahun yang aktif.
 */
export async function GET(request: NextRequest) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();
  const data = await prisma.tahunSpmb.findFirst({ where: { aktif: true }, orderBy: { tahun: "desc" } });
  if (!data) return galat("Belum ada tahun SPMB yang aktif.", 404);
  return Response.json(data);
}
