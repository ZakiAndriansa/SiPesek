/**
 * Menulis statistik agregat SPMB ke data/statistik-{tahun}.json agar ikut di-commit dan
 * diisi oleh seed. Server (mis. homeserver) jadi tidak butuh CSV mentah maupun impor manual.
 * Isinya sama dengan yang dikirim `npm run data:kirim`: tanpa nama, NISN, atau baris per anak.
 *
 * Jalankan: npm run data:ekspor -- [tahun]
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { agregasi, type BarisMentah } from "../src/lib/etl/agregasi";
import type { PermintaanImpor } from "../src/lib/kontrak";

const tahun = Number(process.argv[2] ?? 2026);
const dir = process.env.DATA_MENTAH_DIR ?? "data-mentah";
const files = readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith(".csv"))
  .sort();
const baris = files.flatMap(
  (f) => Papa.parse<BarisMentah>(readFileSync(join(dir, f), "utf8"), { header: true, skipEmptyLines: true }).data,
);
const a = agregasi(baris);

const hasil: PermintaanImpor = {
  tahun,
  namaFile: files.join(", "),
  jumlahBaris: a.jumlahBaris,
  gantiStatistikKecamatan: true,
  statistik: a.statistik,
  kecamatan: a.kecamatan,
};
const tujuan = `data/statistik-${tahun}.json`;
writeFileSync(tujuan, `${JSON.stringify(hasil, null, 2)}\n`);
console.log(
  `${tujuan}: ${a.statistik.length} statistik dari ${a.jumlahSekolah} sekolah, ${a.kecamatan.length} baris kecamatan (${a.jumlahBaris} baris mentah)`,
);
