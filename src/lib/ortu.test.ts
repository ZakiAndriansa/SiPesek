import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const deleteMany = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: { cekPeluang: { findMany: (...a: unknown[]) => findMany(...a), deleteMany: (...a: unknown[]) => deleteMany(...a) } },
}));

const { BATAS_CEK_PER_MENIT, SIMPAN_CEK_PER_ANAK, hapusCekLama, tolakBilaTerlaluCepat } = await import("./ortu");

const SEKARANG = new Date("2026-11-08T10:00:00Z");
const detikLalu = (s: number) => ({ dibuatPada: new Date(SEKARANG.getTime() - s * 1000) });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(SEKARANG);
  findMany.mockReset();
  deleteMany.mockReset();
});
afterEach(() => vi.useRealTimers());

describe("tolakBilaTerlaluCepat", () => {
  it("boleh selama cek satu menit terakhir di bawah batas", async () => {
    findMany.mockResolvedValue([detikLalu(50), detikLalu(30), detikLalu(20), detikLalu(5)]);
    expect(BATAS_CEK_PER_MENIT).toBe(5);
    expect(await tolakBilaTerlaluCepat(7)).toBeNull();
  });

  it("menolak cek ke-6 dalam semenit dengan lama tunggu sampai cek tertua lewat semenit", async () => {
    findMany.mockResolvedValue([detikLalu(45), detikLalu(30), detikLalu(20), detikLalu(10), detikLalu(2)]);
    const r = await tolakBilaTerlaluCepat(7);
    expect(r?.status).toBe(429);
    expect(r?.headers.get("Retry-After")).toBe("15");
    expect((await r!.json()).galat).toContain("Tunggu 15 detik");
  });

  it("hanya menghitung cek akun itu dalam satu menit terakhir", async () => {
    findMany.mockResolvedValue([]);
    await tolakBilaTerlaluCepat(7);
    const { where, take } = findMany.mock.calls[0][0];
    expect(where.anak).toEqual({ orangTuaId: 7 });
    expect(where.dibuatPada.gte).toEqual(new Date(SEKARANG.getTime() - 60_000));
    expect(take).toBe(BATAS_CEK_PER_MENIT);
  });
});

describe("hapusCekLama", () => {
  it("menghapus cek anak di luar 20 terbaru", async () => {
    findMany.mockResolvedValue([{ id: 101 }, { id: 102 }]);
    await hapusCekLama(3);
    const q = findMany.mock.calls[0][0];
    expect(q.where).toEqual({ anakId: 3 });
    expect(q.orderBy).toEqual([{ dibuatPada: "desc" }, { id: "desc" }]);
    expect(q.skip).toBe(SIMPAN_CEK_PER_ANAK);
    expect(SIMPAN_CEK_PER_ANAK).toBe(20);
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: { in: [101, 102] } } });
  });

  it("tidak menghapus apa pun bila riwayat belum lebih dari 20", async () => {
    findMany.mockResolvedValue([]);
    await hapusCekLama(3);
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
