import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { AnakRingkas, ResponsAnak } from "@/lib/kontrak";
import { periksaNisn, sidikNisn } from "@/lib/nisn";
import { bacaIdAnak, COOKIE_ANAK_AKTIF } from "@/lib/anak-aktif";
import {
  BATAS_ANAK,
  denganKunciAkun,
  hasilTerakhirAnakAktif,
  keAnakRingkas,
  orangTuaMasuk,
  pesanNisnTerpakai,
  pilihAnak,
  riwayatAnak,
} from "@/lib/ortu";
import { skemaTambahAnak } from "@/lib/validasi";

export async function GET(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const anak = (
    await prisma.anak.findMany({ where: { orangTuaId: ortu.id }, select: pilihAnak, orderBy: { id: "asc" } })
  ).map(keAnakRingkas);
  // ?riwayat=1: riwayat semua anak ikut dalam satu panggilan (satu query), bukan satu panggilan per anak.
  const q = request.nextUrl.searchParams;
  if (q.get("riwayat") !== "1") return Response.json({ anak } satisfies ResponsAnak);
  const riwayat = await riwayatAnak(anak.map((a) => a.id));
  const denganRiwayat = anak.map((a) => ({ ...a, riwayat: riwayat.get(a.id) ?? [] }));
  if (q.get("hasil") !== "1") return Response.json({ anak: denganRiwayat } satisfies ResponsAnak);
  // &hasil=1: hasil terakhir anak aktif (pilihan dari cookie) ikut, sehingga halaman tahap cukup satu panggilan.
  const pilihan = bacaIdAnak(request.cookies.get(COOKIE_ANAK_AKTIF)?.value);
  const hasilTerakhir = await hasilTerakhirAnakAktif(denganRiwayat, pilihan);
  return Response.json({ anak: denganRiwayat, hasilTerakhir } satisfies ResponsAnak);
}

export async function POST(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);
  if (!ortu) return tolakTanpaSesiOrtu();

  const masukan = await bacaJson(request, skemaTambahAnak, "Isi nama anak, NISN, dan centang persetujuan.");
  if ("gagal" in masukan) return masukan.gagal;

  const nisn = periksaNisn(masukan.data.nisn);
  if (!nisn.sah) return galat(nisn.pesan, 400);

  const sidik = sidikNisn(nisn.nisn);
  try {
    // Hitung, periksa, lalu buat di bawah kunci akun, agar permintaan serentak tidak bisa melewati batas 5 anak.
    const hasil = await denganKunciAkun(ortu.id, async (tx) => {
      if ((await tx.anak.count({ where: { orangTuaId: ortu.id } })) >= BATAS_ANAK) {
        return { galat: galat(`Satu akun paling banyak ${BATAS_ANAK} anak.`, 422) };
      }
      const ada = await tx.anak.findUnique({ where: { sidikNisn: sidik }, select: { orangTuaId: true } });
      if (ada) return { galat: galat(pesanNisnTerpakai(ada.orangTuaId === ortu.id), 409) };
      const anak = await tx.anak.create({
        data: {
          orangTuaId: ortu.id,
          nama: masukan.data.nama,
          sidikNisn: sidik,
          nisnAkhir: nisn.nisnAkhir,
          nisnLazim: nisn.lazim,
        },
        select: pilihAnak,
      });
      return { anak };
    });
    if ("galat" in hasil) return hasil.galat;
    return Response.json(keAnakRingkas(hasil.anak) satisfies AnakRingkas, { status: 201 });
  } catch (e) {
    // Akun lain mendaftarkan NISN yang sama tepat bersamaan (kunci hanya berlaku per akun).
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return galat(pesanNisnTerpakai(false), 409);
    }
    throw e;
  }
}
