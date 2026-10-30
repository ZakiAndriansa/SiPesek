/**
 * Kontrak API antara backend (Zaki) dan tampilan (Aqil).
 * Dikunci setelah hari pertama: perubahan harus disepakati berdua.
 */

export type Jenjang = "SMA" | "SMK";
export type StatusSekolah = "NEGERI" | "SWASTA";
export type LabelPeluang = "PELUANG_BESAR" | "MASIH_MUNGKIN" | "PELUANG_KECIL" | "TIDAK_DIHITUNG";

/** 11 kecamatan Kota Depok. */
export const KECAMATAN_DEPOK = [
  "Beji",
  "Bojongsari",
  "Cilodong",
  "Cimanggis",
  "Cinere",
  "Cipayung",
  "Limo",
  "Pancoran Mas",
  "Sawangan",
  "Sukmajaya",
  "Tapos",
] as const;

/** Kecamatan di luar Depok yang masuk rayon domisili SMAN Depok (juknis 2026). */
export const KECAMATAN_IRISAN_LUAR = [
  "Bojong Gede",
  "Cibinong",
  "Gunung Putri",
  "Gunung Sindur",
  "Jatisampurna",
  "Parung",
  "Tajurhalang",
] as const;

export const KECAMATAN_LAINNYA = "Lainnya";

// ---------- GET /api/sekolah ----------

export type SekolahRingkas = {
  id: number;
  npsn: string;
  nama: string;
  jenjang: Jenjang;
  status: StatusSekolah;
  kategori: "REGULER" | "UNGGULAN_PROVINSI";
  alamat: string;
  kecamatan: string;
  lat: number | null;
  lng: number | null;
  akreditasi: string | null;
  rayonKode: string | null;
};

export type ResponsSekolah = { sekolah: SekolahRingkas[] };

// ---------- POST /api/peluang ----------

export type NilaiMapel = { bin: number; mtk: number; ipa: number; ips: number; bing: number };

export type PermintaanPeluang = {
  jenjang: Jenjang | "SEMUA";
  lokasi: { lat: number; lng: number };
  /** Kecamatan sesuai KK: salah satu KECAMATAN_DEPOK, KECAMATAN_IRISAN_LUAR, atau "Lainnya". */
  kecamatan: string;
  kondisi: {
    ketm: boolean;
    disabilitas: boolean;
    /** id sekolah tempat orang tua mengajar, atau null. */
    anakGuruSekolahId: number | null;
    pindahTugas: boolean;
  };
  nilai?: {
    /** Rata-rata rapor semua mapel semester 1 sampai 5 (0 sampai 100). */
    rataRapor?: number;
    /** Nilai TKA (0 sampai 100), hanya untuk SMA. */
    tkaBin?: number;
    tkaMtk?: number;
    /** Rata-rata 5 mapel selama 5 semester, untuk Kelas Industri SMK. */
    mapel?: NilaiMapel;
  };
};

export type PembandingStatistik = {
  tahun: number;
  pendaftar: number | null;
  diterima: number;
  min: number | null;
  median: number | null;
  maks: number | null;
};

export type HasilJalur = {
  subJalurKode: string;
  namaJalur: string;
  programKeahlian: string | null;
  label: LabelPeluang;
  satuan: "meter" | "skor";
  /** Jarak (dibulatkan 50 m) atau skor anak; null bila tidak dihitung. */
  nilaiAnak: number | null;
  pembanding: PembandingStatistik | null;
  /** Kalimat bukti untuk orang tua. */
  kalimat: string;
};

export type HasilSekolah = {
  sekolah: SekolahRingkas;
  jarakMeter: number | null;
  labelTerbaik: LabelPeluang;
  jalur: HasilJalur[];
};

export type AlternatifSwasta = {
  sekolah: SekolahRingkas;
  jarakMeter: number | null;
  /** null = tidak ada sumber biaya; tampilkan "biaya: tanyakan ke sekolah". */
  biaya: { ringkas: string; resmi: boolean; url: string } | null;
};

export type ResponsPeluang = {
  token: string;
  tahunAcuan: number;
  dibuatPada: string;
  hasil: HasilSekolah[];
  swasta: { SMA: AlternatifSwasta[]; SMK: AlternatifSwasta[] };
  catatan: string;
};

// GET /api/hasil/[token] mengembalikan ResponsPeluang yang sama.

// ---------- GET /api/dashboard?tahun= ----------

export type ResponsDashboard = {
  tahun: number;
  ringkas: {
    pendaftarUnik: number;
    diterimaUnik: number;
    persenDiterima: number;
    jumlahSekolahNegeri: number;
  };
  sekolah: Array<{
    sekolah: SekolahRingkas;
    pendaftar: number | null;
    pendaftarPilihan1: number | null;
    diterima: number;
    /** pendaftar pilihan 1 dibagi kursi terisi. */
    tekanan: number | null;
    radiusDomisiliMeter: number | null;
    /** null bila daya tampung belum diisi admin. */
    dayaTampung: number | null;
    /**
     * Daya tampung dikurangi siswa yang diterima lewat klasemen. Tampilkan sebagai "kuota belum
     * terisi lewat klasemen", bukan kursi kosong pasti: sebagian kursi bisa terisi di luar klasemen,
     * misalnya penempatan langsung anak desil 1 oleh Dinas.
     */
    kursiKosong: number | null;
  }>;
  kecamatan: Array<{
    kecamatan: string;
    cakupan: "SMA" | "SMK" | "SEMUA";
    pendaftarUnik: number;
    diterimaUnik: number;
    persenDiterima: number;
  }>;
  rayon: Array<{
    kode: string;
    nama: string;
    kecamatanUtama: string;
    irisan: string[];
    smanReguler: string[];
  }>;
  programSmk: Array<{ sekolah: string; program: string; pendaftar: number | null; diterima: number }>;
  sinyalMinat: {
    totalCek: number;
    perSekolah: Array<{ sekolahId: number; nama: string; jumlahCek: number; peluangKecil: number }>;
    perKecamatan: Array<{ kecamatan: string; jumlahCek: number }>;
  };
};

// ---------- POST /api/admin/impor ----------

/** Satu baris agregat hasil src/lib/etl/agregasi.ts. Tidak memuat data pribadi. */
export type StatistikMasuk = {
  /** NPSN seperti tertulis di CSV SPMB (bisa "USB-SMKN5DEPOK"). */
  kodeSekolah: string;
  namaSekolah: string;
  /** Persis isi kolom "Sub Jalur". */
  subJalur: string;
  program: string | null;
  bidang: string | null;
  pendaftar: number | null;
  pendaftarPilihan1: number | null;
  diterima: number;
  nilaiMin: number | null;
  nilaiMedian: number | null;
  nilaiMaks: number | null;
};

export type StatistikKecamatanMasuk = {
  kecamatan: string;
  cakupan: "SMA" | "SMK" | "SEMUA";
  pendaftarUnik: number;
  diterimaUnik: number;
};

export type PermintaanImpor = {
  tahun: number;
  namaFile: string;
  jumlahBaris: number;
  /**
   * true bila file yang diimpor memuat semua sekolah negeri sekaligus, sehingga
   * statistik per kecamatan tahun itu boleh dihitung ulang. Impor satu sekolah: false.
   */
  gantiStatistikKecamatan: boolean;
  statistik: StatistikMasuk[];
  kecamatan: StatistikKecamatanMasuk[];
};

export type ResponsImpor = {
  logImporId: number;
  jumlahStatistik: number;
  jumlahSekolah: number;
  /** Baris yang dilewati, mis. sekolah atau sub jalur yang tidak dikenal. */
  peringatan: string[];
};

// ---------- Galat ----------

export type ResponsGalat = { galat: string; detail?: unknown };
