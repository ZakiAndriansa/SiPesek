import type { NextRequest } from "next/server";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { bacaJson } from "@/lib/http";
import { simpanImpor } from "@/lib/impor";
import type { ResponsImpor } from "@/lib/kontrak";
import { lupakanCacheMesin } from "@/lib/peluang/muat";
import { skemaPermintaanImpor } from "@/lib/validasi";

// Browser admin mengirim agregat hasil src/lib/etl/agregasi.ts, bukan CSV mentah.
export async function POST(request: NextRequest) {
  const sesi = await sesiAdmin(request);
  if (!sesi) return tolakTanpaSesi();

  const masukan = await bacaJson(request, skemaPermintaanImpor, "Format impor tidak sesuai.");
  if ("gagal" in masukan) return masukan.gagal;

  const respons = await simpanImpor(masukan.data, sesi.adminId);
  lupakanCacheMesin();
  return Response.json(respons satisfies ResponsImpor);
}
