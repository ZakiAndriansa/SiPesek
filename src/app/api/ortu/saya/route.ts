import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import type { ResponsOrtu } from "@/lib/kontrak";
import { orangTuaMasuk } from "@/lib/ortu";

export async function GET(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();
  return Response.json({ nama: ortu.nama, email: ortu.email, foto: ortu.foto } satisfies ResponsOrtu);
}
