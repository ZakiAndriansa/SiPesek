import type { NextRequest } from "next/server";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { tahunAktif } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import type { ResponsAdminSekolah, SekolahRingkas } from "@/lib/kontrak";
import { pilihSekolahRingkas } from "@/lib/peluang/muat";

// Daftar lengkap untuk admin: GET /api/sekolah tidak memuat biaya dan daya tampung.
export async function GET(request: NextRequest) {
  if (!(await sesiAdmin(request))) return tolakTanpaSesi();

  const tahun = await tahunAktif();
  const [sekolah, dayaTampung] = await Promise.all([
    prisma.sekolah.findMany({
      select: { ...pilihSekolahRingkas, biayaRingkas: true, biayaResmi: true, biayaUrl: true },
      orderBy: [{ status: "asc" }, { jenjang: "asc" }, { nama: "asc" }],
    }),
    tahun === null
      ? Promise.resolve([])
      : prisma.dayaTampung.groupBy({ by: ["sekolahId"], where: { tahun }, _sum: { kuota: true } }),
  ]);
  const kuota = new Map(dayaTampung.map((d) => [d.sekolahId, d._sum.kuota]));

  return Response.json({
    tahun,
    sekolah: sekolah.map((s) => ({ ...(s as SekolahRingkas & typeof s), dayaTampung: kuota.get(s.id) ?? null })),
  } satisfies ResponsAdminSekolah);
}
