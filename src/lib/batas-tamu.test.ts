import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const executeRaw = vi.fn();
vi.mock("@/lib/db", () => ({ prisma: { $queryRaw: (...a: unknown[]) => queryRaw(...a), $executeRaw: (...a: unknown[]) => executeRaw(...a) } }));

const { cobaBatasTamu, idPerangkatTamu, sidikBatas } = await import("./batas-tamu");

const IP = "203.0.113.5";
const PERANGKAT = "3f2b8c1e-9d4a-4b7e-8f61-0a5c2d9e7b13";
const daftar = () => [
  { kunci: sidikBatas("perangkat", PERANGKAT), batas: 30 },
  { kunci: sidikBatas("ip", IP), batas: 150 },
];

beforeEach(() => {
  queryRaw.mockReset();
  executeRaw.mockReset();
});

describe("cobaBatasTamu", () => {
  it("mengizinkan bila tidak ada kunci yang penuh", async () => {
    queryRaw.mockResolvedValue([]);
    expect(await cobaBatasTamu(daftar())).toBeNull();
  });

  it("menolak dengan lama tunggu terlama dan kunci yang penuh", async () => {
    const [perangkat, ip] = daftar();
    queryRaw.mockResolvedValue([
      { kunci: perangkat.kunci, tunggu: 1200 },
      { kunci: ip.kunci, tunggu: 300 },
    ]);
    expect(await cobaBatasTamu(daftar())).toEqual({ tunggu: 1200, penuh: [perangkat.kunci, ip.kunci] });
  });

  it("tidak menyimpan IP atau id perangkat asli, hanya sidiknya", async () => {
    queryRaw.mockResolvedValue([]);
    await cobaBatasTamu(daftar());
    const kiriman = JSON.stringify(queryRaw.mock.calls);
    expect(kiriman).not.toContain(IP);
    expect(kiriman).not.toContain(PERANGKAT);
  });

  it("sidik perangkat dan IP berbeda walau nilainya sama", () => {
    expect(sidikBatas("perangkat", "x")).not.toBe(sidikBatas("ip", "x"));
  });

  it("tanpa batasan: langsung boleh tanpa query", async () => {
    expect(await cobaBatasTamu([])).toBeNull();
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("database bermasalah: cek tetap diizinkan", async () => {
    queryRaw.mockRejectedValue(new Error("koneksi ditolak"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await cobaBatasTamu(daftar())).toBeNull();
  });
});

describe("idPerangkatTamu", () => {
  it("memakai id dari cookie bila formatnya benar", () => {
    expect(idPerangkatTamu(PERANGKAT)).toEqual({ id: PERANGKAT, baru: false });
  });

  it("membuat id baru bila cookie tidak ada atau rusak", () => {
    for (const nilai of [undefined, "", "bukan-uuid", `${PERANGKAT}x`]) {
      const hasil = idPerangkatTamu(nilai);
      expect(hasil.baru).toBe(true);
      expect(hasil.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(hasil.id).not.toBe(PERANGKAT);
    }
  });
});
