import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";

// Menguji data/rayon.csv dan data/rayon-sekolah.csv (disalin dari lampiran juknis)
// terhadap data pendaftar domisili SPMB 2026 yang asli.
const FILE_SMAN = join(process.env.DATA_MENTAH_DIR ?? "data-mentah", "gabungan_sman_depok_2026.csv");

const csv = <T>(f: string) => Papa.parse<T>(readFileSync(f, "utf8"), { header: true, skipEmptyLines: true }).data;

// "SMAN 9 DEPOK", "SMA NEGERI 10 DEPOK", "SMAN 11 Kota Depok" → "SMAN 9", "SMAN 10", "SMAN 11"
const kunciSman = (nama: string) => {
  const m = /SMA(?:N| NEGERI)\s*(\d+)/i.exec(nama);
  return m ? `SMAN ${m[1]}` : null;
};

const wilayah = csv<{ rayon_kode: string; kecamatan: string }>("data/rayon.csv");
const rayonSekolah = csv<{ rayon_kode: string; nama_juknis: string }>("data/rayon-sekolah.csv");

const kecamatanPerSman = new Map<string, Set<string>>();
for (const r of rayonSekolah) {
  const k = kunciSman(r.nama_juknis);
  if (!k) continue;
  kecamatanPerSman.set(k, new Set(wilayah.filter((w) => w.rayon_kode === r.rayon_kode).map((w) => w.kecamatan)));
}

describe("tabel rayon", () => {
  it("memuat 15 SMAN dan 11 rayon", () => {
    expect(kecamatanPerSman.size).toBe(15);
    expect(new Set(wilayah.map((w) => w.rayon_kode)).size).toBe(11);
  });

  it.skipIf(!existsSync(FILE_SMAN))("semua pendaftar domisili yang diterima tinggal di rayon sekolahnya", () => {
    const domisili = csv<Record<string, string>>(FILE_SMAN).filter((b) => b.Jalur === "Domisili");
    const diterimaDiLuarRayon = domisili.filter((b) => {
      const kec = kecamatanPerSman.get(kunciSman(b["Nama Sekolah"]) ?? "");
      return b["Status Klasemen"] === "lulus" && !kec?.has(b.Kecamatan);
    });
    expect(domisili.length).toBe(8951);
    expect(diterimaDiLuarRayon).toHaveLength(0);
  });
});
