// Reproduksi "thundering herd": banyak cek serentak saat cache data mesin kosong atau kedaluwarsa.
import { beforeEach, describe, expect, it, vi } from "vitest";

const hitung = { tahun: 0, sekolah: 0, wilayah: 0, statistik: 0, subJalur: 0 };
const lambat = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 30)); // ~1 putaran ke database

vi.mock("@/lib/db", () => ({
  prisma: {
    tahunSpmb: { findFirst: vi.fn(() => (hitung.tahun++, lambat({ tahun: 2026, aturan: ATURAN }))) },
    sekolah: { findMany: vi.fn(() => (hitung.sekolah++, lambat([]))) },
    rayonKecamatan: { findMany: vi.fn(() => (hitung.wilayah++, lambat([]))) },
    statistikSeleksi: { findMany: vi.fn(() => (hitung.statistik++, lambat([]))) },
    subJalur: { findMany: vi.fn(() => (hitung.subJalur++, lambat([{ id: 1, kode: "DOMISILI" }]))) },
  },
}));

const ATURAN = {
  sumber: "uji",
  rumusSkor: { "SMK:PRESTASI_AKD_RAPOR": { jenis: "RAPOR", skorMaks: 500 } },
  batasLabel: { jarak: "median|maks", skor: "median|min" },
  minDiterima: 5,
};

let muat: typeof import("./muat");
beforeEach(async () => {
  Object.assign(hitung, { tahun: 0, sekolah: 0, wilayah: 0, statistik: 0, subJalur: 0 });
  vi.resetModules();
  muat = await import("./muat");
});

describe("muatDataMesin", () => {
  it("20 cek serentak saat cache kosong hanya memuat data sekali", async () => {
    await Promise.all(Array.from({ length: 20 }, () => muat.muatDataMesin()));
    expect(hitung).toEqual({ tahun: 1, sekolah: 1, wilayah: 1, statistik: 1, subJalur: 1 });
  });

  it("cache yang kedaluwarsa tetap menjawab cepat sambil diperbarui di latar", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await muat.muatDataMesin();
    vi.setSystemTime(Date.now() + 10 * 60_000); // jauh lewat umur cache
    const mulai = performance.now();
    await muat.muatDataMesin();
    const lama = performance.now() - mulai;
    vi.useRealTimers();
    expect(lama).toBeLessThan(20); // tanpa menunggu 2 putaran query
    await new Promise((r) => setTimeout(r, 100)); // biarkan muatan latar selesai agar tidak bocor ke tes berikutnya
  });

  it("id sub jalur ikut di-cache, tanpa query tambahan saat menyimpan", async () => {
    await muat.muatDataMesin();
    const id = await muat.muatIdSubJalur();
    expect(id.get("DOMISILI")).toBe(1);
    expect(hitung.subJalur).toBe(1);
  });

  it("gagal memuat ulang di latar tetap memakai cache lama", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const awal = await muat.muatDataMesin();
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.tahunSpmb.findFirst).mockRejectedValueOnce(new Error("Neon tidur"));
    vi.setSystemTime(Date.now() + 5 * 60_000);
    expect(await muat.muatDataMesin()).toBe(awal);
    vi.useRealTimers();
    await new Promise((r) => setTimeout(r, 100));
  });
});
