import { describe, expect, it } from "vitest";
import { hitungPorsi, PORSI_JALUR, TAHUN_PORSI } from "./porsi-jalur";

describe("porsi siswa diterima per jalur", () => {
  it("sesuai statistik SPMB 2026 Kota Depok, SMA dan SMK terpisah", () => {
    expect(TAHUN_PORSI).toBe(2026);
    expect(PORSI_JALUR).toEqual({
      DOMISILI: { SMA: 43, SMK: 17 },
      AFIRMASI: { SMA: 25, SMK: 31 },
      PRESTASI: { SMA: 28, SMK: 49 },
      MUTASI: { SMA: 4, SMK: 3 },
    });
  });

  it("mengabaikan seleksi unggulan dan sub jalur yang tidak dikenal", () => {
    const porsi = hitungPorsi([
      { namaSekolah: "SMA Negeri 9 Depok", subJalur: "Domisili", diterima: 3 },
      { namaSekolah: "SMA Negeri 9 Depok", subJalur: "KETM", diterima: 1 },
      { namaSekolah: "SMA Negeri 1 Depok", subJalur: "Kompetensi Akademik Rapor", diterima: 100 },
      { namaSekolah: "SMKN 1 Depok", subJalur: "Tidak dikenal", diterima: 50 },
    ]);
    expect(porsi.DOMISILI).toEqual({ SMA: 75, SMK: 0 });
    expect(porsi.AFIRMASI).toEqual({ SMA: 25, SMK: 0 });
  });
});
