import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ prisma: { tahunSpmb: { findMany: (...a: unknown[]) => findMany(...a) } } }));

const { bacaQueryDashboard, lupakanCacheTahun } = await import("./dashboard");
const q = (s: string) => new URLSearchParams(s);
const JENIS = { jenis: ["sekolah", "kecamatan"] } as const;

beforeEach(() => {
  lupakanCacheTahun();
  findMany.mockReset();
  findMany.mockResolvedValue([
    { tahun: 2026, aktif: true },
    { tahun: 2025, aktif: false },
  ]);
});

describe("bacaQueryDashboard", () => {
  it("tanpa query: tahun aktif", async () => {
    expect(await bacaQueryDashboard(q(""))).toEqual({ tahun: 2026 });
  });

  it("tahun yang ada di data", async () => {
    expect(await bacaQueryDashboard(q("tahun=2025"))).toEqual({ tahun: 2025 });
  });

  it("parameter asing ditolak 400 tanpa query ke database (tidak bisa dipakai melewati cache CDN)", async () => {
    const r = await bacaQueryDashboard(q("x=1"));
    expect("gagal" in r && r.gagal.status).toBe(400);
    expect(findMany).not.toHaveBeenCalled();
  });

  it("tahun bukan 4 angka ditolak 400 tanpa query; tahun yang tidak ada 404", async () => {
    for (const t of ["abc", "20266", "1e3"]) {
      const r = await bacaQueryDashboard(q(`tahun=${t}`));
      expect("gagal" in r && r.gagal.status).toBe(400);
    }
    expect(findMany).not.toHaveBeenCalled();
    const r = await bacaQueryDashboard(q("tahun=9999"));
    expect("gagal" in r && r.gagal.status).toBe(404);
  });

  it("daftar tahun di-cache: banyak permintaan hanya satu query", async () => {
    for (const t of ["2026", "2025", "9999", "2024"]) await bacaQueryDashboard(q(`tahun=${t}`));
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it("ekspor: jenis harus sekolah atau kecamatan", async () => {
    expect(await bacaQueryDashboard(q("jenis=kecamatan&tahun=2026"), JENIS)).toEqual({ tahun: 2026 });
    const r = await bacaQueryDashboard(q("jenis=semua"), JENIS);
    expect("gagal" in r && r.gagal.status).toBe(400);
  });
});
