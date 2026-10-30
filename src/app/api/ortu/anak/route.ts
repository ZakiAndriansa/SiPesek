import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { AnakRingkas, ResponsAnak } from "@/lib/kontrak";
import { periksaNisn, sidikNisn } from "@/lib/nisn";
import { BATAS_ANAK, keAnakRingkas, orangTuaMasuk, pilihAnak } from "@/lib/ortu";
import { skemaTambahAnak } from "@/lib/validasi";

export async function GET(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const anak = await prisma.anak.findMany({ where: { orangTuaId: ortu.id }, select: pilihAnak, orderBy: { id: "asc" } });
  return Response.json({ anak: anak.map(keAnakRingkas) } satisfies ResponsAnak);
}

export async function POST(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const masukan = await bacaJson(request, skemaTambahAnak, "Isi nama anak, NISN, dan centang persetujuan.");
  if ("gagal" in masukan) return masukan.gagal;

  const nisn = periksaNisn(masukan.data.nisn);
  if (!nisn.sah) return galat(nisn.pesan, 400);

  if ((await prisma.anak.count({ where: { orangTuaId: ortu.id } })) >= BATAS_ANAK) {
    return galat(`Satu akun paling banyak ${BATAS_ANAK} anak.`, 422);
  }

  const sidik = sidikNisn(nisn.nisn);
  const ada = await prisma.anak.findUnique({ where: { sidikNisn: sidik }, select: { orangTuaId: true } });
  if (ada) return galat(pesanNisnTerpakai(ada.orangTuaId === ortu.id), 409);

  try {
    const anak = await prisma.anak.create({
      data: {
        orangTuaId: ortu.id,
        nama: masukan.data.nama,
        sidikNisn: sidik,
        nisnAkhir: nisn.nisnAkhir,
        nisnLazim: nisn.lazim,
      },
      select: pilihAnak,
    });
    return Response.json(keAnakRingkas(anak) satisfies AnakRingkas, { status: 201 });
  } catch (e) {
    // Dua permintaan bersamaan dengan NISN yang sama: yang kalah mendapat pesan yang sama.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return galat(pesanNisnTerpakai(false), 409);
    }
    throw e;
  }
}

const pesanNisnTerpakai = (milikSendiri: boolean) =>
  milikSendiri
    ? "NISN ini sudah ada di daftar anak Anda."
    : "NISN ini sudah didaftarkan akun lain. Hubungi admin SiPesek bila ini anak Anda.";
