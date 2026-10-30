import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { ipKlien, PembatasJendela } from "@/lib/batas";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsPeluang } from "@/lib/kontrak";
import { periksaNisn } from "@/lib/nisn";
import { BATAS_CEK_PER_HARI, orangTuaMasuk } from "@/lib/ortu";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin } from "@/lib/peluang/muat";
import { skemaPermintaanPeluang } from "@/lib/validasi";

const SEHARI_MS = 24 * 60 * 60 * 1000;

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

  const cekHariIni = await prisma.cekPeluang.count({
    where: { anak: { orangTuaId }, dibuatPada: { gte: new Date(Date.now() - SEHARI_MS) } },
  });
  if (cekHariIni >= BATAS_CEK_PER_HARI) {
    return galat(`Batas ${BATAS_CEK_PER_HARI} kali cek dalam 24 jam sudah tercapai. Silakan coba lagi besok.`, 429);
  }

  const hasil = hitungPeluang(p, await muatDataMesin());

  // Yang disimpan hanya ringkasan: tanpa koordinat rumah, tanpa nilai rapor dan TKA mentah.
  const subJalur = await prisma.subJalur.findMany({ select: { id: true, kode: true } });
  const idSubJalur = new Map(subJalur.map((s) => [s.kode, s.id]));
  const skorPertama = hasil.hasil.flatMap((h) => h.jalur).find((j) => j.satuan === "skor" && j.nilaiAnak !== null);
  const bawah = skorPertama?.nilaiAnak != null ? Math.floor(skorPertama.nilaiAnak / 10) * 10 : null;
  const token = nanoid(12);

  const cek = await prisma.cekPeluang.create({
    data: {
      token,
      anakId: anak.id,
      tahunAcuan: hasil.tahunAcuan,
      kecamatan: p.kecamatan,
      jenjang: p.jenjang,
      jalurDicek: [...new Set(hasil.hasil.flatMap((h) => h.jalur.map((j) => j.subJalurKode)))],
      rentangSkor: bawah === null ? null : `${bawah}-${bawah + 9}`,
      hasil: { hasil: hasil.hasil, swasta: hasil.swasta, catatan: hasil.catatan },
      detail: {
        create: hasil.hasil.flatMap((h) =>
          h.jalur.map((j) => ({ sekolahId: h.sekolah.id, subJalurId: idSubJalur.get(j.subJalurKode)!, label: j.label })),
        ),
      },
    },
  });

  return Response.json({
    token,
    anak: { id: anak.id, nama: anak.nama },
    nisnLazim: anak.nisnLazim,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...hasil,
  } satisfies ResponsPeluang);
}
