import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const executeRaw = vi.fn();
vi.mock("@/lib/db", () => ({ prisma: { $queryRaw: (...a: unknown[]) => queryRaw(...a), $executeRaw: (...a: unknown[]) => executeRaw(...a) } }));

const { cobaBatasTamu } = await import("./batas-tamu");

beforeEach(() => {
  queryRaw.mockReset();
  executeRaw.mockReset();
});

describe("cobaBatasTamu", () => {
  it("mengizinkan selama pemakaian di bawah batas", async () => {
    queryRaw.mockResolvedValue([{ n: 9, tunggu: 1200 }]);
    expect(await cobaBatasTamu("203.0.113.5", 10)).toBeNull();
  });

  it("menolak dengan lama tunggu bila batas tercapai", async () => {
    queryRaw.mockResolvedValue([{ n: 10, tunggu: 1200 }]);
    expect(await cobaBatasTamu("203.0.113.5", 10)).toBe(1200);
  });

  it("tidak menyimpan IP asli, hanya sidiknya", async () => {
    queryRaw.mockResolvedValue([{ n: 0, tunggu: null }]);
    await cobaBatasTamu("203.0.113.5", 10);
    expect(JSON.stringify(queryRaw.mock.calls)).not.toContain("203.0.113.5");
  });

  it("database bermasalah: cek tetap diizinkan", async () => {
    queryRaw.mockRejectedValue(new Error("koneksi ditolak"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await cobaBatasTamu("203.0.113.5", 10)).toBeNull();
  });
});
