import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const deleteMany = vi.fn();
const anakFindMany = vi.fn();
const queryRaw = vi.fn();
const findUnique = vi.fn();
const cobaBatas = vi.fn();
const executeRaw = vi.fn();
vi.mock("@/lib/batas-tamu", () => ({
  cobaBatasTamu: (...a: unknown[]) => cobaBatas(...a),
  sidikBatas: (jenis: string, nilai: string) => `${jenis}:${nilai}`,
}));
vi.mock("@/lib/db", () => ({
  prisma: {
    cekPeluang: {
      findMany: (...a: unknown[]) => findMany(...a),
      deleteMany: (...a: unknown[]) => deleteMany(...a),
      findUnique: (...a: unknown[]) => findUnique(...a),
    },
    anak: { findMany: (...a: unknown[]) => anakFindMany(...a) },
    $queryRaw: (...a: unknown[]) => queryRaw(...a),
    $transaction: (f: (t: unknown) => unknown) => f({ $executeRaw: (...a: unknown[]) => executeRaw(...a), dariTransaksi: true }),
  },
}));

const {
  BATAS_CEK_PER_MENIT,
  SIMPAN_CEK_PER_ANAK,
  denganKunciAkun,
  hapusCekLama,
  hasilTerakhirAnakAktif,
  salinanAkun,
  tolakBilaTerlaluCepat,
} = await import("./ortu");

const SEKARANG = new Date("2026-11-08T10:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(SEKARANG);
  findMany.mockReset();
  deleteMany.mockReset();
  anakFindMany.mockReset();
  queryRaw.mockReset();
  findUnique.mockReset();
  cobaBatas.mockReset();
  executeRaw.mockReset();
});
afterEach(() => vi.useRealTimers());

describe("tolakBilaTerlaluCepat", () => {
  it("boleh selama pembatas akun belum penuh", async () => {
    cobaBatas.mockResolvedValue(null);
    expect(BATAS_CEK_PER_MENIT).toBe(5);
    expect(await tolakBilaTerlaluCepat(7)).toBeNull();
  });

  it("memakai pembatas bersama yang antre per akun: kunci akun, batas 5, jendela 60 detik", async () => {
    cobaBatas.mockResolvedValue(null);
    await tolakBilaTerlaluCepat(7);
    expect(cobaBatas).toHaveBeenCalledWith([{ kunci: "akun:7", batas: BATAS_CEK_PER_MENIT }], 60);
  });

  it("menolak dengan lama tunggu dari pembatas", async () => {
    cobaBatas.mockResolvedValue({ tunggu: 15, penuh: ["akun:7"] });
    const r = await tolakBilaTerlaluCepat(7);
    expect(r?.status).toBe(429);
    expect(r?.headers.get("Retry-After")).toBe("15");
    expect((await r!.json()).galat).toContain("Tunggu 15 detik");
  });
});

describe("denganKunciAkun", () => {
  it("mengunci akun di dalam transaksi sebelum menjalankan isinya", async () => {
    const urutan: string[] = [];
    executeRaw.mockImplementation(async () => urutan.push("kunci"));
    const hasil = await denganKunciAkun(7, async (t) => {
      urutan.push("isi");
      return (t as unknown as { dariTransaksi: boolean }).dariTransaksi;
    });
    expect(urutan).toEqual(["kunci", "isi"]);
    expect(hasil).toBe(true); // isi memakai klien transaksi, bukan klien biasa
    expect(JSON.stringify(executeRaw.mock.calls[0])).toContain("anak:7");
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

describe("salinanAkun", () => {
  const ORTU = { id: 7, nama: "Orang Tua Uji", email: "uji@example.com" };
  const barisAnak = (id: number) => ({ id, nama: `Anak ${id}`, nisnAkhir: "567", nisnLazim: true, _count: { cek: 20 } });
  const barisRiwayat = (anakId: number, i: number) => ({
    anakId,
    token: `t${anakId}-${i}`,
    dibuatPada: new Date("2026-11-01T00:00:00Z"),
    tahunAcuan: 2026,
    jenjang: "SMA",
    kecamatan: "Beji",
    jumlahSekolah: 15,
    peluangBesar: 1,
    masihMungkin: 2,
    peluangKecil: 12,
  });

  it("5 anak x 20 cek tetap 3 query, dan setiap cek membawa isi hasilnya", async () => {
    const ids = [1, 2, 3, 4, 5];
    anakFindMany.mockResolvedValue(ids.map(barisAnak));
    const riwayat = ids.flatMap((a) => Array.from({ length: 20 }, (_, i) => barisRiwayat(a, i)));
    queryRaw.mockResolvedValue(riwayat);
    findMany.mockResolvedValue(riwayat.map((r) => ({ token: r.token, hasil: { hasil: [], catatan: [r.token] } })));

    const s = await salinanAkun(ORTU);

    expect(anakFindMany).toHaveBeenCalledTimes(1);
    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany.mock.calls[0][0].where).toEqual({ anakId: { in: ids } });
    expect(s.akun).toEqual({ nama: ORTU.nama, email: ORTU.email });
    expect(s.anak).toHaveLength(5);
    expect(s.anak[2].riwayat).toHaveLength(20);
    expect(s.anak[2].riwayat[4]).toMatchObject({ token: "t3-4", hasil: { catatan: ["t3-4"] }, ringkas: { peluangKecil: 12 } });
  });

  it("akun tanpa anak tidak menjalankan query riwayat dan hasil", async () => {
    anakFindMany.mockResolvedValue([]);
    const s = await salinanAkun(ORTU);
    expect(s.anak).toEqual([]);
    expect(queryRaw).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});

describe("hasilTerakhirAnakAktif", () => {
  const ringkas = { jumlahSekolah: 1, peluangBesar: 1, masihMungkin: 0, peluangKecil: 0 };
  const rw = (token: string) => ({ token, dibuatPada: "2026-11-01T00:00:00.000Z", tahunAcuan: 2026, jenjang: "SMA" as const, kecamatan: null, ringkas });
  const anakA = (id: number, tokens: string[]) => ({ id, nama: `Anak ${id}`, nisnAkhir: "567", nisnLazim: true, jumlahCek: tokens.length, riwayat: tokens.map(rw) });

  it("mengambil hasil terbaru anak pilihan, dengan bentuk sama seperti GET /api/hasil/[token]", async () => {
    findUnique.mockResolvedValue({ token: "B1", tahunAcuan: 2026, dibuatPada: new Date("2026-11-02T00:00:00Z"), hasil: { hasil: [], catatan: ["x"] } });
    const h = await hasilTerakhirAnakAktif([anakA(1, ["A1"]), anakA(2, ["B1", "B0"])], 2);
    expect(findUnique.mock.calls[0][0].where).toEqual({ token: "B1" });
    expect(h).toEqual({
      token: "B1",
      anak: { id: 2, nama: "Anak 2" },
      nisnLazim: true,
      tahunAcuan: 2026,
      dibuatPada: "2026-11-02T00:00:00.000Z",
      hasil: [],
      catatan: ["x"],
    });
  });

  it("anak aktif tanpa hasil, atau akun tanpa anak: null tanpa query", async () => {
    expect(await hasilTerakhirAnakAktif([anakA(1, ["A1"]), anakA(2, [])], 2)).toBeNull();
    expect(await hasilTerakhirAnakAktif([], null)).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });
});
