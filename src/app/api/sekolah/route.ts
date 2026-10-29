import { prisma } from "@/lib/db";
import type { ResponsSekolah, SekolahRingkas } from "@/lib/kontrak";
import { pilihSekolahRingkas } from "@/lib/peluang/muat";

export async function GET() {
  const sekolah = await prisma.sekolah.findMany({
    select: pilihSekolahRingkas,
    orderBy: [{ status: "asc" }, { jenjang: "asc" }, { nama: "asc" }],
  });
  return Response.json({ sekolah: sekolah as SekolahRingkas[] } satisfies ResponsSekolah);
}
