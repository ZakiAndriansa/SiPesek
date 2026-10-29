import type { NextRequest } from "next/server";
import { muatDashboard, tahunDiminta } from "@/lib/dashboard";
import { galat } from "@/lib/http";
import type { ResponsDashboard } from "@/lib/kontrak";

export async function GET(request: NextRequest) {
  const tahun = await tahunDiminta(request.nextUrl.searchParams.get("tahun"));
  if (!tahun) return galat("Belum ada data SPMB.", 404);
  return Response.json((await muatDashboard(tahun)) satisfies ResponsDashboard);
}
