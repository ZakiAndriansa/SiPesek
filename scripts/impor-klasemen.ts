/**
 * Mengimpor CSV klasemen SPMB mentah sebagai statistik agregat.
 * Nama dan NISN hanya dibaca di memori dan tidak disimpan.
 *
 * Jalankan: npm run data:impor -- [tahun] [file.csv ...]
 * Tanpa argumen file: semua *.csv di DATA_MENTAH_DIR, dianggap impor lengkap.
 */
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import Papa from "papaparse";
import { prisma } from "../src/lib/db";
import { agregasi, type BarisMentah } from "../src/lib/etl/agregasi";
import { simpanImpor } from "../src/lib/impor";

async function main() {
  const [tahunArg, ...fileArg] = process.argv.slice(2);
  const tahun = Number(tahunArg ?? 2026);
  const dir = process.env.DATA_MENTAH_DIR ?? "data-mentah";
  const lengkap = fileArg.length === 0;
  const files = lengkap
    ? readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith(".csv"))
        .map((f) => join(dir, f))
    : fileArg;

  const baris: BarisMentah[] = [];
  for (const f of files) {
    const hasil = Papa.parse<BarisMentah>(readFileSync(f, "utf8"), { header: true, skipEmptyLines: true });
    console.log(`${basename(f)}: ${hasil.data.length} baris`);
    baris.push(...hasil.data);
  }

  const agregat = agregasi(baris);
  const respons = await simpanImpor(
    {
      tahun,
      namaFile: files.map((f) => basename(f)).join(", "),
      jumlahBaris: agregat.jumlahBaris,
      gantiStatistikKecamatan: lengkap,
      statistik: agregat.statistik,
      kecamatan: agregat.kecamatan,
    },
    null,
  );

  console.log(`Tersimpan: ${respons.jumlahStatistik} statistik dari ${respons.jumlahSekolah} sekolah (log #${respons.logImporId})`);
  if (!lengkap) console.log("Statistik kecamatan tidak diubah (impor sebagian).");
  for (const p of respons.peringatan) console.log(`  peringatan: ${p}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
