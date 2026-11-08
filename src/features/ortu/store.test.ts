// Reproduksi race condition dan kegagalan muat di store data orang tua (halaman Hasil Sekolah dkk).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Jawab = { status: number; body?: unknown };
const json = ({ status, body }: Jawab) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

/** fetch tiruan: tiap URL punya antrean jawaban; jawaban bisa ditahan sampai `lepas()` dipanggil. */
function pasangFetch() {
  const antre = new Map<string, Array<() => Promise<Response>>>();
  const panggilan: string[] = [];
  const fetchTiruan = vi.fn(async (url: string) => {
    panggilan.push(url);
    const f = antre.get(url)?.shift();
    if (!f) throw new Error(`fetch tak terduga: ${url}`);
    return f();
  });
  vi.stubGlobal("fetch", fetchTiruan);
  return {
    panggilan,
    jawab(url: string, j: Jawab) {
      antre.set(url, [...(antre.get(url) ?? []), async () => json(j)]);
    },
    tahan(url: string, j: Jawab) {
      let lepas!: () => void;
      const siap = new Promise<void>((r) => (lepas = r));
      antre.set(url, [...(antre.get(url) ?? []), async () => (await siap, json(j))]);
      return () => lepas();
    },
    gagalJaringan(url: string) {
      antre.set(url, [...(antre.get(url) ?? []), async () => Promise.reject(new TypeError("Failed to fetch"))]);
    },
  };
}

const anak = (id: number, nama: string) => ({ id, nama, nisnAkhir: "567", nisnLazim: true, jumlahCek: 1 });
const cek = (token: string) => ({ token, dibuatPada: "2026-11-01T00:00:00.000Z", tahunAcuan: 2026, jenjang: "SMA", kecamatan: "Beji", ringkas: { jumlahSekolah: 15, peluangBesar: 1, masihMungkin: 2, peluangKecil: 12 } });
const ANAK = "/api/ortu/anak?riwayat=1&hasil=1";

let store: typeof import("./store");
beforeEach(async () => {
  vi.resetModules();
  store = await import("./store");
});
afterEach(() => vi.unstubAllGlobals());

describe("store ortu", () => {
  it("keluar saat data akun lama masih dimuat tidak membuat anak akun lama muncul lagi", async () => {
    const f = pasangFetch();
    const lepas = f.tahan(ANAK, { status: 200, body: { anak: [{ ...anak(1, "Anak Akun Lama"), riwayat: [cek("A")] }] } });

    const muat = store.segarkanOrtu();
    store.lupakanDataOrtu({ perangkat: true }); // pengguna keluar / ganti akun di tab yang sama
    lepas();
    await muat;

    expect(store.bacaKeadaanOrtu().anak).toEqual([]);
  });

  it("dua penyegaran beruntun: jawaban lama yang datang belakangan tidak menimpa data terbaru", async () => {
    const f = pasangFetch();
    const lepasLama = f.tahan(ANAK, { status: 200, body: { anak: [{ ...anak(1, "Sebelum disimpan"), riwayat: [cek("LAMA")] }] } });
    f.jawab(ANAK, { status: 200, body: { anak: [{ ...anak(1, "Sesudah disimpan"), riwayat: [cek("BARU")] }] } });

    const lama = store.segarkanOrtu();
    await store.segarkanOrtu(); // misal setelah menyimpan hasil baru
    lepasLama();
    await lama;

    expect(store.bacaKeadaanOrtu().anak[0]?.nama).toBe("Sesudah disimpan");
  });

  it("riwayat gagal dimuat tidak boleh tampil sebagai 'belum ada hasil'", async () => {
    const f = pasangFetch();
    f.jawab(ANAK, { status: 500, body: { galat: "timeout" } });
    f.jawab(ANAK, { status: 500, body: { galat: "timeout" } }); // percobaan ulang otomatis juga gagal

    await store.segarkanOrtu();
    const k = store.bacaKeadaanOrtu();

    expect(k.status === "galat" || (k.anak[0]?.riwayat.length ?? 0) > 0).toBe(true);
  });

  it("penyegaran yang gagal tidak menghapus data yang sudah tampil", async () => {
    const f = pasangFetch();
    f.jawab(ANAK, { status: 200, body: { anak: [{ ...anak(1, "Anak"), riwayat: [cek("A")] }] } });
    await store.segarkanOrtu();
    f.gagalJaringan(ANAK);
    f.gagalJaringan(ANAK);
    await store.segarkanOrtu();
    expect(store.bacaKeadaanOrtu()).toMatchObject({ status: "ada", anak: [{ riwayat: [{ token: "A" }] }] });
  });

  it("hasil yang gagal (cold start) bisa dimuat lagi tanpa memuat ulang tab", async () => {
    const f = pasangFetch();
    f.gagalJaringan("/api/hasil/A");
    f.gagalJaringan("/api/hasil/A"); // percobaan ulang otomatis juga gagal
    f.jawab("/api/hasil/A", { status: 200, body: { token: "A", hasil: [] } });

    await store.pastikanHasil("A");
    expect(store.bacaKeadaanOrtu().hasil.A).toBeNull(); // halaman menampilkan "Coba lagi"
    await store.pastikanHasil("A"); // tombol Coba lagi, atau halaman dibuka lagi

    expect(store.bacaKeadaanOrtu().hasil.A).toMatchObject({ token: "A" });
  });

  it("hasil yang terlambat datang setelah keluar tidak masuk ke akun berikutnya", async () => {
    const f = pasangFetch();
    const lepas = f.tahan("/api/hasil/A", { status: 200, body: { token: "A", hasil: [] } });
    const muat = store.pastikanHasil("A");
    store.lupakanDataOrtu();
    lepas();
    await muat;
    expect(store.bacaKeadaanOrtu().hasil.A).toBeUndefined();
  });

  it("hasil yang baru dihitung tidak diunduh lagi saat halaman tahap dibuka", async () => {
    const f = pasangFetch(); // tanpa jawaban apa pun: fetch ke /api/hasil/BARU akan melempar galat
    const skor = { jenjang: "SMA", nilai: 88, rincian: [{ label: "Rapor", nilai: 88 }] };
    store.simpanHasilBaru({ token: "BARU", anakBaru: true, hasil: [], skorAnak: [skor] } as never);

    await store.pastikanHasil("BARU");

    expect(f.panggilan).toEqual([]);
    const tersimpan = store.bacaKeadaanOrtu().hasil.BARU as unknown as Record<string, unknown>;
    // Sama dengan bentuk GET /api/hasil/[token]: rincian skor dan penanda anakBaru tidak ikut.
    expect(tersimpan.skorAnak).toEqual([{ ...skor, rincian: [] }]);
    expect(tersimpan).not.toHaveProperty("anakBaru");
  });

  it("hasil terakhir yang ikut daftar anak langsung dipakai, tanpa panggilan kedua", async () => {
    const f = pasangFetch();
    f.jawab(ANAK, {
      status: 200,
      body: { anak: [{ ...anak(1, "Anak"), riwayat: [cek("T1")] }], hasilTerakhir: { token: "T1", hasil: [] } },
    });

    await store.segarkanOrtu();
    await store.pastikanHasil("T1"); // yang dipanggil halaman tahap saat dibuka

    expect(f.panggilan).toEqual([ANAK]);
    expect(store.bacaKeadaanOrtu()).toMatchObject({ status: "ada", aktifId: 1, hasil: { T1: { token: "T1" } } });
  });

  it("memilih anak menyalin pilihannya ke cookie untuk server", () => {
    const doc = { cookie: "" };
    vi.stubGlobal("document", doc);
    store.pilihAnakAktif(3);
    expect(doc.cookie).toMatch(/^sipesek_anak_aktif=3; Path=\/;/);
    store.lupakanDataOrtu();
    expect(doc.cookie).toMatch(/^sipesek_anak_aktif=; Path=\/; Max-Age=0/);
  });

  it("hasil yang baru dihitung dilupakan saat keluar", () => {
    store.simpanHasilBaru({ token: "BARU", hasil: [] } as never);
    store.lupakanDataOrtu({ perangkat: true });
    expect(store.bacaKeadaanOrtu().hasil.BARU).toBeUndefined();
  });
});
