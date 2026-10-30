import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { skemaPermintaanImpor } from "@/lib/validasi";
import { agregasi, type BarisMentah } from "./agregasi";

// data/statistik-2026.json di-commit dan diisi seed, jadi tes ini jalan tanpa CSV mentah.
const statistik = skemaPermintaanImpor.parse(JSON.parse(readFileSync("data/statistik-2026.json", "utf8")));

const csv = <T>(file: string) =>
  Papa.parse<T>(readFileSync(file, "utf8"), { header: true, skipEmptyLines: true }).data;

describe("data/statistik-2026.json", () => {
  it("cocok dengan angka verifikasi", () => {
    const totalDiterima = statistik.statistik.reduce((n, s) => n + s.diterima, 0);
    expect(totalDiterima).toBe(6315);
    const sman2 = statistik.statistik
      .filter((s) => s.kodeSekolah === "20223818")
      .reduce((n, s) => n + s.diterima, 0);
    expect(sman2).toBe(473);
    expect(statistik.kecamatan).toContainEqual({
      kecamatan: "Pancoran Mas",
      cakupan: "SEMUA",
      pendaftarUnik: 1564,
      diterimaUnik: 446,
    });
  });

  it("semua kode sekolah dikenal seed", () => {
    const kode = new Set([
      ...csv<{ npsn: string; status: string }>("data/sekolah-depok.csv")
        .filter((s) => s.status === "NEGERI")
        .map((s) => s.npsn),
      ...csv<{ kode_di_data: string }>("data/kode-spmb.csv").map((k) => k.kode_di_data),
    ]);
    const asing = statistik.statistik.map((s) => s.kodeSekolah).filter((k) => !kode.has(k));
    expect(asing).toEqual([]);
  });

  it("tidak memuat kolom selain agregat", () => {
    const mentah = readFileSync("data/statistik-2026.json", "utf8");
    expect(mentah).not.toMatch(/"(nama|nisn|NISN|Nama)"\s*:/);
  });
});

const DIR = process.env.DATA_MENTAH_DIR ?? "data-mentah";
const adaMentah = existsSync(DIR) && readdirSync(DIR).some((f) => f.toLowerCase().endsWith(".csv"));

// Mencegah file JSON tertinggal dari CSV mentah: jalankan `npm run data:ekspor` bila gagal.
describe.skipIf(!adaMentah)("statistik-2026.json sama dengan agregasi CSV mentah", () => {
  it("identik", () => {
    const baris = readdirSync(DIR)
      .filter((f) => f.toLowerCase().endsWith(".csv"))
      .flatMap((f) => csv<BarisMentah>(join(DIR, f)));
    const a = agregasi(baris);
    // Urutan baris mengikuti urutan file, yang bisa berbeda antarsistem operasi.
    const urut = <T>(xs: T[]) => xs.map((x) => JSON.stringify(x)).sort();
    expect(urut(statistik.statistik)).toEqual(urut(a.statistik));
    expect(urut(statistik.kecamatan)).toEqual(urut(a.kecamatan));
  });
});
