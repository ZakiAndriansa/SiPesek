import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import type { ResponsSalinan } from "@/lib/kontrak";
import { orangTuaMasuk, salinanAkun } from "@/lib/ortu";

// Salinan semua data akun untuk "Unduh Salinan Data". Berisi data pribadi, jadi tidak boleh di-cache.
export async function GET(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();
  return Response.json((await salinanAkun(ortu)) satisfies ResponsSalinan, { headers: { "Cache-Control": "no-store" } });
}
