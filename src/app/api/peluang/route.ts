import { type NextRequest, NextResponse } from "next/server";
import { tolakTanpaSesiOrtu } from "@/lib/auth";
import { ipKlien } from "@/lib/batas";
import { type Batasan, cobaBatasTamu, idPerangkatTamu, NAMA_COOKIE_TAMU, opsiCookieTamu, sidikBatas } from "@/lib/batas-tamu";
import { prisma } from "@/lib/db";
import { bacaJson, galat } from "@/lib/http";
import type { ResponsGalat, ResponsPeluang } from "@/lib/kontrak";
import { periksaNisn } from "@/lib/nisn";
import { hitungDanSimpan, lewatBatasHarian, orangTuaMasuk } from "@/lib/ortu";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin } from "@/lib/peluang/muat";
import { skemaPermintaanPeluang } from "@/lib/validasi";

// Tamu yang belum masuk, per jam (0 = tanpa batas):
// 1. BATAS_TAMU_PER_JAM cek per perangkat (cookie anonim, bawaan 10), agar pengunjung yang berbagi satu Wi-Fi
//    atau satu IP operator seluler tidak saling menghabiskan jatah;
// 2. BATAS_TAMU_IP_PER_JAM cek per IP, rem longgar untuk bot yang membuang cookie di setiap permintaan.
const BATAS_TAMU_PER_JAM = Number(process.env.BATAS_TAMU_PER_JAM ?? 10);
const BATAS_TAMU_IP_PER_JAM = Number(process.env.BATAS_TAMU_IP_PER_JAM ?? 150);
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

  if (!ortu) {
    const perangkat = idPerangkatTamu(request.cookies.get(NAMA_COOKIE_TAMU)?.value);
    const respons = (await tolakBilaLewatBatas(request, perangkat.id)) ?? (await hitungTamu(p, nisn.lazim));
    if (perangkat.baru) respons.cookies.set(NAMA_COOKIE_TAMU, perangkat.id, opsiCookieTamu);
    return respons;
  }
  return hitungTamu(p, nisn.lazim);
}

/** Hitung peluang tanpa menyimpan apa pun (mode tamu). */
async function hitungTamu(p: typeof skemaPermintaanPeluang._output, nisnLazim: boolean) {
  const hasil = hitungPeluang(p, await muatDataMesin());
  return NextResponse.json({
    token: null,
    anak: null,
    nisnLazim,
    dibuatPada: new Date().toISOString(),
    ...hasil,
  } satisfies ResponsPeluang);
}

/** Respons 429 bila perangkat atau IP tamu sudah melewati batas per jam, atau null bila boleh. */
async function tolakBilaLewatBatas(request: NextRequest, idPerangkat: string): Promise<NextResponse | null> {
  const daftar: Batasan[] = [];
  if (BATAS_TAMU_PER_JAM > 0) daftar.push({ kunci: sidikBatas("perangkat", idPerangkat), batas: BATAS_TAMU_PER_JAM });
  const ip = ipKlien(request.headers);
  if (ip === null) {
    // Tanpa header IP semua tamu akan berbagi satu kuota IP, jadi hanya batas perangkat yang berlaku.
    if (!sudahPeringatkanTanpaIp) console.warn("Header IP pengunjung tidak ada; batas cek tamu per IP tidak diterapkan.");
    sudahPeringatkanTanpaIp = true;
  } else if (BATAS_TAMU_IP_PER_JAM > 0) {
    daftar.push({ kunci: sidikBatas("ip", ip), batas: BATAS_TAMU_IP_PER_JAM });
  }

  const tolak = await cobaBatasTamu(daftar);
  if (!tolak) return null;
  const karenaPerangkat = tolak.penuh.includes(daftar[0]?.kunci ?? "") && BATAS_TAMU_PER_JAM > 0;
  // Dicatat agar terlihat di log Vercel bila ada pengunjung sungguhan yang tertolak (tanpa IP atau id asli).
  console.info(`Cek tamu ditolak: batas per ${karenaPerangkat ? "perangkat" : "IP"} tercapai, tunggu ${tolak.tunggu} s.`);
  const respons = NextResponse.json(
    {
      galat:
        "Untuk melindungi SiPesek dari penyalahgunaan otomatis, Cek Cepat tanpa akun dibatasi " +
        (karenaPerangkat
          ? `${BATAS_TAMU_PER_JAM} kali per jam di setiap perangkat. `
          : "per jam untuk setiap jaringan, dan jaringan ini sudah mencapai batasnya. ") +
        "Masuk dengan Google untuk lanjut sekarang dan menyimpan hasilnya.",
    } satisfies ResponsGalat,
    { status: 429 },
  );
  respons.headers.set("Retry-After", String(tolak.tunggu));
  return respons;
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
