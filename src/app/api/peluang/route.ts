import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { ipKlien, PembatasJendela } from "@/lib/batas";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsPeluang } from "@/lib/kontrak";
import { periksaNisn } from "@/lib/nisn";
import { hitungDanSimpan, lewatBatasHarian, orangTuaMasuk } from "@/lib/ortu";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin } from "@/lib/peluang/muat";
import { skemaPermintaanPeluang } from "@/lib/validasi";

// Tamu yang belum masuk: paling banyak BATAS_TAMU_PER_JAM cek per jam per IP (0 = tanpa batas).
const BATAS_TAMU_PER_JAM = Number(process.env.BATAS_TAMU_PER_JAM ?? 10);
const pembatasTamu = new PembatasJendela(BATAS_TAMU_PER_JAM, 60 * 60 * 1000);
let sudahPeringatkanTanpaIp = false;

export async function POST(request: NextRequest) {
  const ortu = await orangTuaMasuk(request);

  const masukan = await bacaJson(request, skemaPermintaanPeluang, "Isian belum lengkap atau tidak sesuai.");
  if ("gagal" in masukan) return masukan.gagal;
  const p = masukan.data;

  if (p.anakId !== undefined) {
    if (!ortu) return tolakTanpaSesiOrtu();
    return cekTersimpan(p, p.anakId, ortu.id);
  }

  // Mode tamu: NISN hanya diperiksa, dan tidak ada yang disimpan.
  const nisn = periksaNisn(p.nisn ?? "");
  if (!nisn.sah) return galat(nisn.pesan, 400);

  if (!ortu && BATAS_TAMU_PER_JAM > 0) {
    const ip = ipKlien(request.headers);
    if (ip === null) {
      // Tanpa header IP semua tamu akan berbagi satu kuota, jadi batas dilewati agar demo tidak terkunci.
      if (!sudahPeringatkanTanpaIp) console.warn("Header IP pengunjung tidak ada; batas cek tamu tidak diterapkan.");
      sudahPeringatkanTanpaIp = true;
    } else {
      const tunggu = pembatasTamu.coba(ip);
      if (tunggu !== null) {
        const respons = galat(
          `Batas ${BATAS_TAMU_PER_JAM} kali cek per jam untuk tamu sudah tercapai. ` +
            "Masuk dengan Google untuk cek tanpa batas per jam dan menyimpan riwayat.",
          429,
        );
        respons.headers.set("Retry-After", String(tunggu));
        return respons;
      }
    }
  }

  const hasil = hitungPeluang(p, await muatDataMesin());
  return Response.json({
    token: null,
    anak: null,
    nisnLazim: nisn.lazim,
    dibuatPada: new Date().toISOString(),
    ...hasil,
  } satisfies ResponsPeluang);
}

async function cekTersimpan(p: typeof skemaPermintaanPeluang._output, anakId: number, orangTuaId: number) {
  const anak = await prisma.anak.findFirst({
    where: { id: anakId, orangTuaId },
    select: { id: true, nama: true, nisnLazim: true },
  });
  if (!anak) return galat("Data anak tidak ditemukan.", 404);

  const batas = await lewatBatasHarian(orangTuaId);
  if (batas) return galat(batas, 429);

  return Response.json((await hitungDanSimpan(p, anak)) satisfies ResponsPeluang);
}
