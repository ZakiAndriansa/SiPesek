import { beforeEach, describe, expect, it, vi } from "vitest";

// Database tiruan: pembacaan di luar transaksi, semua penulisan dicatat lewat `tx` di dalam transaksi.
const tulis: string[] = [];
const tx = {
  programKeahlian: {
    createManyAndReturn: vi.fn(async ({ data }: { data: Array<{ sekolahId: number; nama: string }> }) => {
      tulis.push(`program x${data.length}`);
      return data.map((d, i) => ({ id: 900 + i, sekolahId: d.sekolahId, nama: d.nama }));
    }),
  },
  statistikSeleksi: {
    deleteMany: vi.fn(async () => tulis.push("hapus statistik")),
    createMany: vi.fn<(isi: { data: Array<{ programId: number | null }> }) => Promise<number>>(async () => tulis.push("buat statistik")),
  },
  statistikKecamatan: { deleteMany: vi.fn(), createMany: vi.fn() },
  logImpor: { create: vi.fn(async () => (tulis.push("log"), { id: 7 })) },
};
const transaksi = vi.fn<(f: (t: typeof tx) => unknown, opsi?: unknown) => Promise<unknown>>(async (f) => f(tx));
const programCreate = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    sekolah: { findMany: async () => [{ id: 1, kodeDiData: "S1" }, { id: 2, kodeDiData: "S2" }] },
    subJalur: { findMany: async () => [{ id: 10, namaDiData: "Domisili" }] },
    programKeahlian: { findMany: async () => [{ id: 50, sekolahId: 2, nama: "Akuntansi" }], create: (...a: unknown[]) => programCreate(...a) },
    $transaction: (f: (t: typeof tx) => unknown, opsi: unknown) => transaksi(f, opsi),
  },
}));

const { simpanImpor } = await import("./impor");

const baris = (kodeSekolah: string, program: string | null, subJalur = "Domisili") => ({
  kodeSekolah,
  namaSekolah: `Sekolah ${kodeSekolah}`,
  subJalur,
  program,
  bidang: program ? "Bisnis" : null,
  pendaftar: 10,
  pendaftarPilihan1: 5,
  diterima: 3,
  nilaiMin: 1,
  nilaiMedian: 2,
  nilaiMaks: 3,
});

beforeEach(() => {
  tulis.length = 0;
  vi.clearAllMocks();
});

describe("simpanImpor", () => {
  it("program baru dibuat sekali dengan satu query di dalam transaksi, dan statistik memakai id-nya", async () => {
    const r = await simpanImpor(
      {
        tahun: 2026,
        namaFile: "uji.csv",
        jumlahBaris: 5,
        gantiStatistikKecamatan: false,
        kecamatan: [],
        statistik: [
          baris("S2", "Akuntansi"), // program sudah ada
          baris("S2", "Perhotelan"), // program baru
          baris("S2", "Perhotelan"), // program baru yang sama: tetap dibuat sekali
          baris("S1", null),
          baris("S9", null), // sekolah tidak dikenal: dilewati
        ],
      } as never,
      3,
    );

    expect(programCreate).not.toHaveBeenCalled(); // tidak ada penulisan di luar transaksi
    expect(transaksi).toHaveBeenCalledTimes(1);
    expect(tulis).toEqual(["program x1", "hapus statistik", "buat statistik", "log"]);
    const dibuat = tx.statistikSeleksi.createMany.mock.calls[0][0];
    expect(dibuat.data.map((b) => b.programId)).toEqual([50, 900, 900, null]);
    expect(r).toMatchObject({ logImporId: 7, jumlahStatistik: 4, jumlahSekolah: 2 });
    expect(r.peringatan).toEqual(
      expect.arrayContaining([expect.stringContaining("Perhotelan"), expect.stringContaining("Sekolah tidak dikenal: S9")]),
    );
  });

  it("tanpa program baru: tidak ada query pembuatan program", async () => {
    await simpanImpor(
      { tahun: 2026, namaFile: "uji.csv", jumlahBaris: 1, gantiStatistikKecamatan: false, kecamatan: [], statistik: [baris("S1", null)] } as never,
      null,
    );
    expect(tx.programKeahlian.createManyAndReturn).not.toHaveBeenCalled();
    expect(tulis).toEqual(["hapus statistik", "buat statistik", "log"]);
  });

  it("transaksi gagal di tengah: tidak ada program yang dibuat di luar transaksi", async () => {
    tx.statistikSeleksi.createMany.mockRejectedValueOnce(new Error("koneksi putus"));
    await expect(
      simpanImpor(
        { tahun: 2026, namaFile: "uji.csv", jumlahBaris: 1, gantiStatistikKecamatan: false, kecamatan: [], statistik: [baris("S2", "Tata Boga")] } as never,
        null,
      ),
    ).rejects.toThrow("koneksi putus");
    expect(programCreate).not.toHaveBeenCalled();
  });
});
