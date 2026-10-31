import { describe, expect, it } from "vitest";
import type { HasilJalur, HasilSekolah, LabelPeluang } from "./kontrak";
import { diWilayah, ringkasan, ringkasJalur, strategi, toRequest, validateInput, type QuickCheckInput } from "./quick-check";

const RUMAH = { lat: -6.3831, lng: 106.8191 };
const ISIAN: QuickCheckInput = {
  jenjang: "sma",
  nilai: [85, 86, null, 88, 90],
  tkaBin: 75,
  tkaMtk: null,
  mapel: { bin: 80, mtk: 80, ipa: 80, ips: 80, bing: null },
  ketm: "ragu",
  disabilitas: false,
  pindahTugas: true,
  kecamatan: "Beji",
  lokasi: RUMAH,
};

const jalur = (subJalurKode: string, label: LabelPeluang): HasilJalur => ({
  subJalurKode,
  namaJalur: subJalurKode,
  programKeahlian: null,
  label,
  satuan: "meter",
  nilaiAnak: 500,
  pembanding: null,
  kalimat: `kalimat ${subJalurKode}`,
});
const sekolah = (id: number, labelTerbaik: LabelPeluang, ...j: HasilJalur[]): HasilSekolah => ({
  sekolah: { id, npsn: String(id), nama: `Sekolah ${id}`, jenjang: "SMA", status: "NEGERI", kategori: "REGULER", alamat: "", kecamatan: "Beji", lat: 0, lng: 0, akreditasi: null, rayonKode: null },
  jarakMeter: 500,
  labelTerbaik,
  jalur: j,
});

describe("Cek Cepat", () => {
  it("wilayah layanan mencakup Depok, bukan Bandung", () => {
    expect(diWilayah(RUMAH)).toBe(true);
    expect(diWilayah({ lat: -6.9175, lng: 107.6191 })).toBe(false);
  });

  it("menolak kecamatan di luar daftar KK dan nilai di atas 100", () => {
    expect(validateInput(ISIAN)).toBeNull();
    expect(validateInput({ ...ISIAN, kecamatan: "Harapan Jaya" })).toMatch(/Kartu Keluarga/);
    expect(validateInput({ ...ISIAN, nilai: [101, null, null, null, null] })).toMatch(/0 sampai 100/);
  });

  it("menyusun permintaan mode tamu sesuai kontrak", () => {
    const p = toRequest(ISIAN, "0101234567", RUMAH);
    expect(p).toMatchObject({
      nisn: "0101234567",
      jenjang: "SMA",
      lokasi: RUMAH,
      kecamatan: "Beji",
      kondisi: { ketm: false, disabilitas: false, anakGuruSekolahId: null, pindahTugas: true },
    });
    // Rata-rata dari 4 semester yang diisi; TKA Matematika kosong tidak dikirim; mapel SMK tidak ikut untuk SMA.
    expect(p.nilai).toEqual({ rataRapor: 87.25, tkaBin: 75 });
    expect(toRequest({ ...ISIAN, jenjang: "belum", mapel: { ...ISIAN.mapel, bing: 82 } }, "x", RUMAH).nilai?.mapel).toEqual({
      bin: 80, mtk: 80, ipa: 80, ips: 80, bing: 82,
    });
  });

  it("meringkas jalur dari label terbaik tiap sekolah", () => {
    const hasil = [
      sekolah(1, "PELUANG_BESAR", jalur("DOMISILI", "PELUANG_BESAR"), jalur("PRESTASI_AKD_RAPOR", "TIDAK_DIHITUNG")),
      sekolah(2, "MASIH_MUNGKIN", jalur("DOMISILI", "MASIH_MUNGKIN")),
    ];
    const r = Object.fromEntries(ringkasJalur(hasil, ISIAN).map((x) => [x.kode, x]));
    expect(r.DOMISILI.teks).toBe("Peluang besar di 1 sekolah, Masih mungkin di 1 sekolah.");
    expect(r.PRESTASI).toMatchObject({ terhitung: false, teks: "kalimat PRESTASI_AKD_RAPOR" });
    expect(r.AFIRMASI.teks).toMatch(/DTSEN/);
  });

  it("strategi: satu ambisius lalu dua aman", () => {
    const hasil = [
      sekolah(1, "PELUANG_BESAR", jalur("DOMISILI", "PELUANG_BESAR")),
      sekolah(2, "PELUANG_BESAR", jalur("DOMISILI", "PELUANG_BESAR")),
      sekolah(3, "MASIH_MUNGKIN", jalur("DOMISILI", "MASIH_MUNGKIN")),
      sekolah(4, "PELUANG_KECIL", jalur("DOMISILI", "PELUANG_KECIL")),
    ];
    expect(strategi(hasil).map((s) => [s.name, s.role])).toEqual([
      ["Sekolah 3", "Pilihan ambisius"],
      ["Sekolah 1", "Pilihan aman"],
      ["Sekolah 2", "Pilihan aman"],
    ]);
  });
  it("ringkasan menjawab lebih dulu, sesuai label terbaik", () => {
    const besar = sekolah(1, "PELUANG_BESAR", jalur("DOMISILI", "PELUANG_BESAR"));
    const mungkin = sekolah(2, "MASIH_MUNGKIN", jalur("DOMISILI", "MASIH_MUNGKIN"));
    const kecil = sekolah(3, "PELUANG_KECIL", jalur("DOMISILI", "PELUANG_KECIL"));
    expect(ringkasan([besar, mungkin, kecil])).toEqual({
      judul: "Anak punya Peluang besar di 1 sekolah negeri.",
      jumlah: [
        { label: "PELUANG_BESAR", n: 1 },
        { label: "MASIH_MUNGKIN", n: 1 },
        { label: "PELUANG_KECIL", n: 1 },
      ],
    });
    expect(ringkasan([mungkin, kecil]).judul).toBe("Belum ada Peluang besar, tapi masih mungkin di 1 sekolah negeri.");
    expect(ringkasan([kecil]).judul).toMatch(/swasta terdekat/);
  });
});
