import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NAMA_COOKIE_ORTU, tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orangTuaMasuk } from "@/lib/ortu";

// Hak hapus (UU PDP): akun, data anak, riwayat cek, dan HasilCek ikut terhapus berantai.
export async function DELETE(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  await prisma.orangTua.delete({ where: { id: ortu.id } });
  (await cookies()).delete(NAMA_COOKIE_ORTU);
  return Response.json({ ok: true });
}
