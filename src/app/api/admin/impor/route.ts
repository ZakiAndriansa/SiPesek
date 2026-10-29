import type { NextRequest } from "next/server";
import { sesiAdmin, tolakTanpaSesi } from "@/lib/auth";
import { simpanImpor } from "@/lib/impor";
import type { ResponsGalat, ResponsImpor } from "@/lib/kontrak";
import { lupakanCacheMesin } from "@/lib/peluang/muat";
import { skemaPermintaanImpor } from "@/lib/validasi";

// Browser admin mengirim agregat hasil src/lib/etl/agregasi.ts, bukan CSV mentah.
export async function POST(request: NextRequest) {
  const sesi = await sesiAdmin(request);
  if (!sesi) return tolakTanpaSesi();

  const masukan = skemaPermintaanImpor.safeParse(await request.json().catch(() => null));
  if (!masukan.success) {
    return Response.json(
      { galat: "Format impor tidak sesuai.", detail: masukan.error.issues } satisfies ResponsGalat,
      { status: 400 },
    );
  }
  const respons = await simpanImpor(masukan.data, sesi.adminId);
  lupakanCacheMesin();
  return Response.json(respons satisfies ResponsImpor);
}
