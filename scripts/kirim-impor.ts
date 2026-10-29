/**
 * Mengimpor statistik SPMB ke server yang sudah online (mis. homeserver) tanpa
 * mengirim CSV mentah: agregasi dihitung di laptop, yang dikirim hanya angka agregat.
 *
 * Jalankan: SIPESEK_URL=https://alamat-server npm run data:kirim -- [tahun]
 * Butuh ADMIN_EMAIL dan ADMIN_PASSWORD akun admin di server itu (dari .env atau variabel).
 */
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import Papa from "papaparse";
import { agregasi, type BarisMentah } from "../src/lib/etl/agregasi";
import type { PermintaanImpor } from "../src/lib/kontrak";

async function main() {
  const url = process.env.SIPESEK_URL?.replace(/\/$/, "");
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (!url || !email || !password) throw new Error("Isi SIPESEK_URL, ADMIN_EMAIL, dan ADMIN_PASSWORD.");

  const tahun = Number(process.argv[2] ?? 2026);
  const dir = process.env.DATA_MENTAH_DIR ?? "data-mentah";
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".csv"));
  const baris = files.flatMap(
    (f) => Papa.parse<BarisMentah>(readFileSync(join(dir, f), "utf8"), { header: true, skipEmptyLines: true }).data,
  );
  const a = agregasi(baris);

  const masuk = await fetch(`${url}/api/admin/masuk`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!masuk.ok) throw new Error(`Gagal masuk sebagai admin (HTTP ${masuk.status}).`);
  const cookie = masuk.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("Server tidak mengirim cookie sesi.");

  const permintaan: PermintaanImpor = {
    tahun,
    namaFile: files.map((f) => basename(f)).join(", "),
    jumlahBaris: a.jumlahBaris,
    gantiStatistikKecamatan: true,
    statistik: a.statistik,
    kecamatan: a.kecamatan,
  };
  const res = await fetch(`${url}/api/admin/impor`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(permintaan),
  });
  console.log(`HTTP ${res.status}`, await res.text());
  if (!res.ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
