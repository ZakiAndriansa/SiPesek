import { describe, expect, it } from "vitest";
import { ATURAN_2026 } from "@/lib/jalur";
import type { PermintaanPeluang } from "@/lib/kontrak";
import { skemaAturan } from "@/lib/validasi";
import { jarakMeter } from "./jarak";
import { hitungPeluang, type DataMesin, type SekolahMesin, type StatistikMesin } from "./mesin";
import { hitungSkor } from "./skor";

const aturan = skemaAturan.parse(ATURAN_2026);
const METER_PER_DERAJAT_LINTANG = (6_371_000 * Math.PI) / 180;

// Koordinat SMAN 9 Depok menurut Data Referensi Kemendikdasmen.
const SMAN9 = { lat: -6.34698, lng: 106.7800317 };
const keUtara = (m: number) => ({ lat: SMAN9.lat + m / METER_PER_DERAJAT_LINTANG, lng: SMAN9.lng });

const sekolah = (o: Partial<SekolahMesin> & Pick<SekolahMesin, "id" | "nama">): SekolahMesin => ({
  npsn: String(o.id),
  jenjang: "SMA",
  status: "NEGERI",
  kategori: "REGULER",
  alamat: "",
  kecamatan: "Cinere",
  lat: SMAN9.lat,
  lng: SMAN9.lng,
  akreditasi: "A",
  rayonKode: "DEPOK-A",
  biaya: null,
  ...o,
});

const stat = (o: Partial<StatistikMesin> & Pick<StatistikMesin, "sekolahId" | "subJalurKode">): StatistikMesin => ({
  subJalurNama: "Dekat rumah",
  metrik: "JARAK_METER",
  program: null,
  pendaftar: 432,
  diterima: 101,
  min: 40,
  median: 500,
  maks: 925.22,
  ...o,
});

const data: DataMesin = {
  tahun: 2026,
  aturan,
  rayon: new Map([["DEPOK-A", new Set(["Cinere", "Limo"])]]),
  sekolah: [
    sekolah({ id: 9, nama: "SMAN 9 DEPOK" }),
    sekolah({ id: 50, nama: "SMKN 5 DEPOK", jenjang: "SMK", rayonKode: null, lat: null, lng: null }),
    ...Array.from({ length: 7 }, (_, i) =>
      sekolah({ id: 100 + i, nama: `SMAS ${i}`, status: "SWASTA", ...keUtara(200 * (7 - i)) }),
    ),
  ],
  statistik: [
    stat({ sekolahId: 9, subJalurKode: "DOMISILI" }),
    stat({ sekolahId: 9, subJalurKode: "PRESTASI_AKD_RAPOR", subJalurNama: "Nilai rapor", metrik: "SKOR", min: 300.88, median: 310, maks: 330 }),
    stat({ sekolahId: 9, subJalurKode: "AFIRMASI_MBK", subJalurNama: "Anak berkebutuhan khusus (MBK)", diterima: 3 }),
    stat({ sekolahId: 9, subJalurKode: "PRESTASI_NONAKD_KEJUARAAN", subJalurNama: "Juara lomba non akademik", metrik: "SKOR" }),
    stat({ sekolahId: 50, subJalurKode: "DOMISILI" }),
  ],
};

const minta = (o: Partial<PermintaanPeluang> = {}): PermintaanPeluang => ({
  anakId: 1,
  jenjang: "SMA",
  lokasi: keUtara(900),
  kecamatan: "Cinere",
  kondisi: { ketm: false, disabilitas: false, anakGuruSekolahId: null, pindahTugas: false },
  ...o,
});

const jalurSman9 = (p: PermintaanPeluang) => hitungPeluang(p, data).hasil.find((h) => h.sekolah.id === 9)?.jalur ?? [];

describe("jarak", () => {
  it("menghitung jarak garis lurus", () => {
    expect(jarakMeter(SMAN9, keUtara(900))).toBeCloseTo(900, 0);
  });
});

describe("mesin peluang: jalur domisili", () => {
  it("memberi Masih mungkin di antara median dan jarak terjauh", () => {
    const [domisili] = jalurSman9(minta({ lokasi: keUtara(900) }));
    expect(domisili).toMatchObject({ subJalurKode: "DOMISILI", label: "MASIH_MUNGKIN", nilaiAnak: 900 });
    expect(domisili.kalimat).toContain("925 m");
  });

  it("memberi Peluang besar dalam jarak median dan Peluang kecil di luar jarak terjauh", () => {
    expect(jalurSman9(minta({ lokasi: keUtara(400) }))[0].label).toBe("PELUANG_BESAR");
    expect(jalurSman9(minta({ lokasi: keUtara(1000) }))[0].label).toBe("PELUANG_KECIL");
  });

  it("menutup jalur domisili SMA bagi anak di luar rayon", () => {
    const jalur = jalurSman9(minta({ kecamatan: "Tapos" }));
    expect(jalur.find((j) => j.subJalurKode === "DOMISILI")).toBeUndefined();
  });

  it("tidak menghitung jarak ke sekolah tanpa koordinat", () => {
    const smkn5 = hitungPeluang(minta({ jenjang: "SMK" }), data).hasil.find((h) => h.sekolah.id === 50);
    expect(smkn5?.jalur[0].label).toBe("TIDAK_DIHITUNG");
    expect(smkn5?.jarakMeter).toBeNull();
  });
});

describe("mesin peluang: jalur skor dan aturan lain", () => {
  it("menghitung skor rapor SMA dan memberi label", () => {
    const jalur = jalurSman9(minta({ lokasi: keUtara(5000), nilai: { rataRapor: 90, tkaBin: 80, tkaMtk: 75 } }));
    const rapor = jalur.find((j) => j.subJalurKode === "PRESTASI_AKD_RAPOR");
    // 0,5 × 5 × 90 + 0,5 × (80 + 75) = 225 + 77,5 = 302,5
    expect(rapor).toMatchObject({ nilaiAnak: 302.5, label: "MASIH_MUNGKIN" });
  });

  it("menandai jalur dengan kurang dari 5 siswa diterima sebagai tidak dihitung", () => {
    const jalur = jalurSman9(minta({ kondisi: { ketm: false, disabilitas: true, anakGuruSekolahId: null, pindahTugas: false } }));
    expect(jalur.find((j) => j.subJalurKode === "AFIRMASI_MBK")).toBeUndefined();
    const hanyaMbk = jalurSman9(
      minta({ kecamatan: "Tapos", kondisi: { ketm: false, disabilitas: true, anakGuruSekolahId: null, pindahTugas: false } }),
    );
    expect(hanyaMbk.find((j) => j.subJalurKode === "AFIRMASI_MBK")?.label).toBe("TIDAK_DIHITUNG");
  });

  it("tidak menampilkan jalur kejuaraan yang butuh sertifikat", () => {
    const jalur = jalurSman9(minta({ nilai: { rataRapor: 90, tkaBin: 80, tkaMtk: 75 } }));
    expect(jalur.find((j) => j.subJalurKode === "PRESTASI_NONAKD_KEJUARAAN")).toBeUndefined();
  });

  it("menampilkan 5 sekolah swasta terdekat", () => {
    // Rumah tepat di titik acuan; SMAS i berjarak 200 × (7 − i) m.
    const { swasta } = hitungPeluang(minta({ lokasi: SMAN9 }), data);
    expect(swasta.SMA.map((s) => s.sekolah.nama)).toEqual(["SMAS 6", "SMAS 5", "SMAS 4", "SMAS 3", "SMAS 2"]);
    expect(swasta.SMK).toEqual([]);
  });
});

describe("rumus skor juknis 2026 dengan nilai sempurna", () => {
  const nilai = { rataRapor: 100, tkaBin: 100, tkaMtk: 100, mapel: { bin: 100, mtk: 100, ipa: 100, ips: 100, bing: 100 } };
  it("SMA rapor = 350, SMK rapor = 500, kelas industri = 1.100", () => {
    expect(hitungSkor(aturan.rumusSkor["SMA:PRESTASI_AKD_RAPOR"], nilai)).toBe(350);
    expect(hitungSkor(aturan.rumusSkor["SMK:PRESTASI_AKD_RAPOR"], nilai)).toBe(500);
    expect(hitungSkor(aturan.rumusSkor["SMK:PRESTASI_KELAS_INDUSTRI"], nilai, "TEKNOLOGI")).toBe(1100);
    expect(hitungSkor(aturan.rumusSkor["SMK:PRESTASI_KELAS_INDUSTRI"], nilai, "BISNIS")).toBe(1100);
  });

  it("memakai bobot kelompok yang benar", () => {
    const mapel = { bin: 80, mtk: 90, ipa: 70, ips: 60, bing: 85 };
    // Teknologi 2,3,3,1,2: 160 + 270 + 210 + 60 + 170 = 870
    expect(hitungSkor(aturan.rumusSkor["SMK:PRESTASI_KELAS_INDUSTRI"], { mapel }, "TEKNOLOGI")).toBe(870);
    // Bisnis 3,2,1,3,2: 240 + 180 + 70 + 180 + 170 = 840
    expect(hitungSkor(aturan.rumusSkor["SMK:PRESTASI_KELAS_INDUSTRI"], { mapel }, "BISNIS")).toBe(840);
  });
});
