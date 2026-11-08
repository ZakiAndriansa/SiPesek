import { prisma } from "@/lib/db";
import { CACHE_PUBLIK } from "@/lib/http";
import type { ResponsSekolah, SekolahRingkas } from "@/lib/kontrak";
import { pilihSekolahRingkas } from "@/lib/peluang/muat";

export async function GET() {
  const sekolah = await prisma.sekolah.findMany({
    select: pilihSekolahRingkas,
    orderBy: [{ status: "asc" }, { jenjang: "asc" }, { nama: "asc" }],
  });
  return Response.json({ sekolah: sekolah as SekolahRingkas[] } satisfies ResponsSekolah, { headers: CACHE_PUBLIK });
}
