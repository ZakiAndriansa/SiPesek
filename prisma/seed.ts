/**
 * Mengisi data referensi: jalur, sub jalur, rayon, sekolah, program keahlian,
 * aturan 2026, dan akun admin pertama. Aman dijalankan berulang (upsert).
 *
 * Jalankan: npm run db:seed
 * Statistik SPMB diisi terpisah lewat `npm run data:impor`.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import Papa from "papaparse";
import { prisma } from "../src/lib/db";
import { ATURAN_2026, JALUR, SUB_JALUR } from "../src/lib/jalur";
import { skemaAturan } from "../src/lib/validasi";

const csv = <T>(file: string) =>
  Papa.parse<T>(readFileSync(file, "utf8"), { header: true, skipEmptyLines: true }).data;

type BarisSekolah = {
  npsn: string;
  nama: string;
  jenjang: "SMA" | "SMK";
  status: "NEGERI" | "SWASTA";
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  lat: string;
  lng: string;
  akreditasi: string;
  sumber_url: string;
  diambil_pada: string;
};

// "SMAN 9 DEPOK" dan "SMA NEGERI 10 DEPOK" → "SMAN 9"; nama lain dinormalkan tanpa awalan SMA/SMAS.
function kunciNama(nama: string): string {
  const negeri = /SMA(?:N| NEGERI)\s*(\d+)/i.exec(nama);
  if (negeri) return `SMAN ${negeri[1]}`;
  return nama
    .toUpperCase()
    .replace(/^SMAS?\b/, "")
    .replace(/[^A-Z0-9]/g, "");
}

async function seedJalur() {
  for (const j of JALUR) {
    await prisma.jalur.upsert({ where: { kode: j.kode }, update: { ...j }, create: { ...j } });
  }
  for (const s of SUB_JALUR) {
    await prisma.subJalur.upsert({ where: { kode: s.kode }, update: { ...s }, create: { ...s } });
  }
  console.log(`Jalur ${JALUR.length}, sub jalur ${SUB_JALUR.length}`);
}

async function seedRayon() {
  const baris = csv<{ rayon_kode: string; rayon_nama: string; kecamatan: string; jenis: "UTAMA" | "IRISAN" }>(
    "data/rayon.csv",
  );
  for (const b of baris) {
    await prisma.rayon.upsert({
      where: { kode: b.rayon_kode },
      update: { nama: b.rayon_nama },
      create: { kode: b.rayon_kode, nama: b.rayon_nama },
    });
    await prisma.rayonKecamatan.upsert({
      where: { rayonKode_kecamatan: { rayonKode: b.rayon_kode, kecamatan: b.kecamatan } },
      update: { jenis: b.jenis },
      create: { rayonKode: b.rayon_kode, kecamatan: b.kecamatan, jenis: b.jenis },
    });
  }
  const rayonUtama = new Map(baris.filter((b) => b.jenis === "UTAMA").map((b) => [b.kecamatan, b.rayon_kode]));
  console.log(`Rayon ${rayonUtama.size}, wilayah ${baris.length}`);
  return rayonUtama;
}

async function seedSekolah(rayonUtama: Map<string, string>) {
  const sekolah = csv<BarisSekolah>("data/sekolah-depok.csv");
  const kodeSpmb = new Map(
    csv<{ npsn: string; kode_di_data: string; kategori: string }>("data/kode-spmb.csv").map((b) => [b.npsn, b]),
  );
  const biaya = new Map(
    csv<{ npsn: string; ringkasan: string; resmi: string; url: string }>("data/biaya-swasta.csv").map((b) => [b.npsn, b]),
  );
  const rayonJuknis = new Map(
    csv<{ rayon_kode: string; nama_juknis: string }>("data/rayon-sekolah.csv").map((b) => [
      kunciNama(b.nama_juknis),
      b.rayon_kode,
    ]),
  );
  const juknisTerpakai = new Set<string>();

  for (const s of sekolah) {
    let rayonKode: string | null = null;
    if (s.jenjang === "SMA") {
      const kunci = kunciNama(s.nama);
      rayonKode = rayonJuknis.get(kunci) ?? rayonUtama.get(s.kecamatan) ?? null;
      if (rayonJuknis.has(kunci)) juknisTerpakai.add(kunci);
    }
    const kode = kodeSpmb.get(s.npsn);
    const b = biaya.get(s.npsn);
    const data = {
      kodeDiData: s.status === "NEGERI" ? (kode?.kode_di_data ?? s.npsn) : null,
      nama: s.nama,
      jenjang: s.jenjang,
      status: s.status,
      kategori: (kode?.kategori ?? "REGULER") as "REGULER" | "UNGGULAN_PROVINSI",
      alamat: s.alamat,
      kelurahan: s.kelurahan || null,
      kecamatan: s.kecamatan,
      lat: s.lat ? Number(s.lat) : null,
      lng: s.lng ? Number(s.lng) : null,
      akreditasi: s.akreditasi || null,
      sumberUrl: s.sumber_url,
      diambilPada: new Date(s.diambil_pada),
      biayaRingkas: b?.ringkasan ?? null,
      biayaResmi: b ? b.resmi === "true" : null,
      biayaUrl: b?.url ?? null,
      rayonKode,
    };
    await prisma.sekolah.upsert({ where: { npsn: s.npsn }, update: data, create: { npsn: s.npsn, ...data } });
  }

  const tidakCocok = [...rayonJuknis.keys()].filter((k) => !juknisTerpakai.has(k));
  console.log(`Sekolah ${sekolah.length}; nama juknis yang tidak ketemu di data sekolah: ${tidakCocok.length}`);
  for (const k of tidakCocok) console.log(`  ${k}`);
}

async function seedProgram() {
  const baris = csv<{ npsn: string; bidang: string; program: string; kelompok_bobot: string }>(
    "data/program-keahlian.csv",
  );
  for (const b of baris) {
    const sekolah = await prisma.sekolah.findUniqueOrThrow({ where: { npsn: b.npsn } });
    await prisma.programKeahlian.upsert({
      where: { sekolahId_nama: { sekolahId: sekolah.id, nama: b.program } },
      update: { bidang: b.bidang, kelompokBobot: b.kelompok_bobot },
      create: { sekolahId: sekolah.id, bidang: b.bidang, nama: b.program, kelompokBobot: b.kelompok_bobot },
    });
  }
  console.log(`Program keahlian ${baris.length}`);
}

async function seedAturan() {
  const aturan = skemaAturan.parse(ATURAN_2026);
  await prisma.tahunSpmb.upsert({
    where: { tahun: 2026 },
    update: { aturan, aktif: true },
    create: { tahun: 2026, aturan, aktif: true, catatan: "Data klasemen SPMB Jabar 2026, Kota Depok" },
  });
  console.log("Aturan 2026 aktif");
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL atau ADMIN_PASSWORD kosong, akun admin dilewati");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, nama: "Admin SiPesek", passwordHash },
  });
  console.log(`Admin ${email}`);
}

async function main() {
  await seedJalur();
  const rayonUtama = await seedRayon();
  await seedSekolah(rayonUtama);
  await seedProgram();
  await seedAturan();
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
