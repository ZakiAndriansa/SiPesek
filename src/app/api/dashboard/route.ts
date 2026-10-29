import type { NextRequest } from "next/server";
import { muatDashboard, tahunAktif } from "@/lib/dashboard";
import type { ResponsDashboard, ResponsGalat } from "@/lib/kontrak";

export async function GET(request: NextRequest) {
  const diminta = Number(request.nextUrl.searchParams.get("tahun"));
  const tahun = Number.isInteger(diminta) && diminta > 0 ? diminta : await tahunAktif();
  if (!tahun) return Response.json({ galat: "Belum ada data SPMB." } satisfies ResponsGalat, { status: 404 });
  return Response.json((await muatDashboard(tahun)) satisfies ResponsDashboard);
}
