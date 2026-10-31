import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";
import type { ResponsPeluang } from "@/lib/kontrak";
import { orangTuaMasuk } from "@/lib/ortu";

// Hasil memuat data anak, jadi hanya orang tua pemiliknya yang bisa membuka.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/hasil/[token]">) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const { token } = await ctx.params;
  const cek = await prisma.cekPeluang.findFirst({
    where: { token, anak: { orangTuaId: ortu.id } },
    include: { anak: { select: { id: true, nama: true, nisnLazim: true } } },
  });
  if (!cek?.anak) return galat("Hasil tidak ditemukan.", 404);

  const tersimpan = cek.hasil as Pick<ResponsPeluang, "hasil" | "swasta" | "catatan" | "skorAnak">;
  return Response.json({
    token: cek.token,
    anak: { id: cek.anak.id, nama: cek.anak.nama },
    nisnLazim: cek.anak.nisnLazim,
    tahunAcuan: cek.tahunAcuan,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...tersimpan,
  } satisfies ResponsPeluang);
}

// Menghapus satu hasil dari riwayat anak; anak dan hasil lainnya tetap. Hasil milik akun lain dijawab 404.
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/hasil/[token]">) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const { token } = await ctx.params;
  const { count } = await prisma.cekPeluang.deleteMany({ where: { token, anak: { orangTuaId: ortu.id } } });
  return count ? Response.json({ ok: true }) : galat("Hasil tidak ditemukan.", 404);
}
