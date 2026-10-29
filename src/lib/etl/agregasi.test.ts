import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { agregasi, type BarisMentah } from "./agregasi";

// CSV mentah berisi data pribadi dan tidak ada di repo. Tes dilewati bila filenya tidak ada.
const DIR = process.env.DATA_MENTAH_DIR ?? "data-mentah";
const FILE = {
  sman: join(DIR, "gabungan_sman_depok_2026.csv"),
  smkn: join(DIR, "gabungan_smkn_depok_2026.csv"),
  sman1: join(DIR, "SMA_NEGERI_1_DEPOK.csv"),
};
const adaData = Object.values(FILE).every(existsSync);

const baca = (f: string) =>
  Papa.parse<BarisMentah>(readFileSync(f, "utf8"), { header: true, skipEmptyLines: true }).data;

describe.skipIf(!adaData)("agregasi CSV SPMB 2026 asli", () => {
  const sman = baca(FILE.sman);
  const smkn = baca(FILE.smkn);
  const hasil = agregasi([...sman, ...smkn, ...baca(FILE.sman1)]);
  const cari = (kode: string, subJalur: string) =>
    hasil.statistik.find((s) => s.kodeSekolah === kode && s.subJalur === subJalur && s.program === null);

  it("membaca semua baris", () => {
    expect(sman.length).toBe(24835);
    expect(smkn.length).toBe(8079);
    expect(hasil.jumlahSekolah).toBe(20);
  });

  it("menjumlah yang diterima di 14 SMAN", () => {
    const kodeSman = new Set(sman.map((b) => b.NPSN));
    const total = hasil.statistik.filter((s) => kodeSman.has(s.kodeSekolah)).reduce((n, s) => n + s.diterima, 0);
    expect(total).toBe(4607);
  });

  it("menghitung per sekolah dan per jalur", () => {
    const sman2 = hasil.statistik.filter((s) => s.kodeSekolah === "20223818").reduce((n, s) => n + s.diterima, 0);
    expect(sman2).toBe(473);
    expect(cari("20276187", "Domisili")?.nilaiMaks).toBe(925.22);
    expect(cari("20223818", "Akd - Raport")?.nilaiMin).toBe(308.765);
  });

  it("mengosongkan jumlah pendaftar untuk file yang hanya berisi yang diterima", () => {
    const sman1 = hasil.statistik.filter((s) => s.kodeSekolah === "20223819");
    expect(sman1.reduce((n, s) => n + s.diterima, 0)).toBe(320);
    expect(sman1.every((s) => s.pendaftar === null)).toBe(true);
  });

  it("menghitung pendaftar unik per kecamatan (SMA + SMK)", () => {
    const pm = hasil.kecamatan.find((k) => k.kecamatan === "Pancoran Mas" && k.cakupan === "SEMUA");
    expect(pm).toMatchObject({ pendaftarUnik: 1564, diterimaUnik: 446 });
  });

  it("tidak membawa NISN atau nama ke hasil", () => {
    const teks = JSON.stringify(hasil);
    expect(teks).not.toContain(sman[0].NISN);
    expect(teks).not.toContain(sman[0].Nama);
  });
});
