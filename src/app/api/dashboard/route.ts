import type { NextRequest } from "next/server";
import { bacaQueryDashboard, muatDashboard } from "@/lib/dashboard";
import { CACHE_PUBLIK } from "@/lib/http";
import type { ResponsDashboard } from "@/lib/kontrak";

export async function GET(request: NextRequest) {
  const q = await bacaQueryDashboard(request.nextUrl.searchParams);
  if ("gagal" in q) return q.gagal;
  return Response.json((await muatDashboard(q.tahun)) satisfies ResponsDashboard, { headers: CACHE_PUBLIK });
}
