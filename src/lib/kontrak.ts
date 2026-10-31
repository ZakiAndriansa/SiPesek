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
  /**
   * Diisi: cek atas nama anak milik orang tua yang sedang masuk (dari GET /api/ortu/anak); hasilnya
   * disimpan ke riwayat (401 bila belum masuk, 404 bila bukan anaknya, 429 bila lewat 20 cek per hari).
   * Kosong: mode tamu; hasil dihitung lalu dikembalikan tanpa disimpan apa pun, dan `nisn` wajib.
   * Tamu yang belum masuk dibatasi 10 cek per jam per IP (429 dengan header Retry-After).
   */
  anakId?: number;
  /** Wajib di mode tamu: hanya diperiksa (10 digit, kewajaran tahun lahir), tidak disimpan. */
  nisn?: string;
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

/** Skor akhir anak untuk satu jalur skor (mis. Prestasi rapor SMA), dihitung dengan rumus juknis yang berlaku. */
export type SkorAnak = {
  jenjang: Jenjang;
  subJalurKode: string;
  namaJalur: string;
  /** Kelompok bobot program SMK (mis. TEKNOLOGI, BISNIS); null bila rumusnya tidak bergantung program. */
  kelompok: string | null;
  /** null bila nilai yang dibutuhkan belum diisi (lihat `kurang`). */
  nilai: number | null;
  maks: number;
  /** Rumus dalam kata-kata, mis. "0,5 × 5 × rata-rata rapor + 0,5 × (TKA B. Indonesia + TKA Matematika)". */
  rumus: string;
  /** Bagian penyusun skor; kosong bila `nilai` null. */
  rincian: { label: string; nilai: number; maks: number }[];
  /** Isian yang belum ada, mis. ["TKA Matematika"]; kosong bila skor terhitung. */
  kurang: string[];
  /** Skor terendah yang diterima di sekolah negeri jenjang ini: paling rendah dan paling tinggi antarsekolah. */
  terendahDiterima: { dari: number; sampai: number } | null;
};

export type ResponsPeluang = {
  /** null di mode tamu: hasil tidak disimpan, jadi tidak ada /hasil/<token>. */
  token: string | null;
  /** Anak yang dicek; null di mode tamu dan untuk cek lama sebelum ada login. */
  anak: { id: number; nama: string } | null;
  /** false: tampilkan peringatan NISN tidak lazim. null untuk cek lama. */
  nisnLazim: boolean | null;
  tahunAcuan: number;
  dibuatPada: string;
  hasil: HasilSekolah[];
  swasta: { SMA: AlternatifSwasta[]; SMK: AlternatifSwasta[] };
  catatan: string;
  /**
   * Skor akhir anak per jalur skor. Di balasan POST /api/peluang lengkap. Di hasil tersimpan
   * (GET /api/hasil/[token]) `rincian` selalu kosong, karena rinciannya membuka rata-rata rapor dan nilai TKA;
   * cek yang disimpan sebelum skor ikut disimpan tidak punya field ini.
   */
  skorAnak?: SkorAnak[];
};

// GET /api/hasil/[token] mengembalikan ResponsPeluang yang sama, hanya untuk orang tua pemiliknya
// (404 bila milik akun lain). Ambil di klien dengan fetch("/api/hasil/...") agar cookie ikut terkirim.

// ---------- Orang tua: masuk dengan Google dan data anak ----------
// Semua rute di bawah (kecuali masuk dan keluar) membalas 401 bila belum masuk.

/** POST /api/ortu/masuk: `credential` dari callback google.accounts.id. */
export type PermintaanMasukGoogle = { credential: string };

/** Balasan POST /api/ortu/masuk dan GET /api/ortu/saya. */
export type ResponsOrtu = {
  nama: string;
  email: string;
  /** Foto profil Google (https://...googleusercontent.com); null bila tidak ada. Pasang referrerPolicy="no-referrer". */
  foto: string | null;
};

export type AnakRingkas = {
  id: number;
  nama: string;
  /** 3 digit terakhir NISN; tampilkan sebagai "NISN ...123". NISN lengkap tidak disimpan. */
  nisnAkhir: string;
  /** false: tampilkan peringatan "NISN ini tidak lazim untuk calon siswa SMA atau SMK, pastikan di situs resmi". */
  nisnLazim: boolean;
  jumlahCek: number;
};

/** GET /api/ortu/anak */
export type ResponsAnak = { anak: AnakRingkas[] };

/**
 * POST /api/ortu/anak. Balasan: 201 AnakRingkas; 400 NISN bukan 10 digit; 409 NISN sudah terdaftar;
 * 422 sudah 5 anak. Sertakan tautan "Cek NISN di situs resmi": https://nisn.data.kemendikdasmen.go.id/
 */
export type PermintaanTambahAnak = {
  nama: string;
  nisn: string;
  /** Kotak centang "Saya orang tua atau wali anak ini dan setuju datanya diproses". */
  setuju: true;
};

export type RiwayatCek = {
  token: string;
  dibuatPada: string;
  tahunAcuan: number;
  jenjang: Jenjang | "SEMUA";
  kecamatan: string | null;
  /** Jumlah sekolah negeri per label terbaik. */
  ringkas: { jumlahSekolah: number; peluangBesar: number; masihMungkin: number; peluangKecil: number };
};

/**
 * POST /api/ortu/simpan-cek: simpan hasil Cek Cepat ke akun dalam satu permintaan. Isinya sama dengan
 * permintaan peluang mode tamu (NISN wajib) ditambah nama anak dan persetujuan. Bila NISN belum ada di akun,
 * anak baru dibuat (201); bila sudah ada, cek ditambahkan ke anak itu tanpa mengubah namanya (200).
 * Galat: 400 isian atau NISN tidak sah; 401 belum masuk; 409 NISN milik akun lain; 422 sudah 5 anak;
 * 429 lewat 20 cek per 24 jam. Hasil dihitung ulang di server, jadi titik rumah (`lokasi`) tetap wajib
 * walau tidak disimpan.
 */
export type PermintaanSimpanCek = Omit<PermintaanPeluang, "anakId" | "nisn"> & PermintaanTambahAnak;

/** Balasan POST /api/ortu/simpan-cek: hasil yang sudah tersimpan (ada `token` dan `anak`), termasuk `skorAnak`. */
export type ResponsSimpanCek = ResponsPeluang & { anakBaru: boolean };

/** GET /api/ortu/riwayat?anakId= (404 bila anak bukan milik akun ini). */
export type ResponsRiwayat = { anak: AnakRingkas; riwayat: RiwayatCek[] };

// DELETE /api/ortu/anak/[id]: hapus anak dan riwayatnya. DELETE /api/ortu/akun: hapus akun dan semua data anak.

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
  /**
   * Minat dari orang tua yang masuk dengan Google, dihitung per anak (NISN lazim) dan hanya dari
   * cek terakhir tiap anak, jadi satu anak yang dicek berkali-kali tetap terhitung sekali.
   */
  sinyalMinat: {
    /** Semua cek tahun ini dari anak dengan NISN lazim. */
    totalCek: number;
    anakUnik: number;
    /**
     * jumlahCek: jumlah anak yang sekolah ini muncul di hasil cek terakhirnya.
     * peluangKecil: dari anak itu, yang semua jalurnya di sekolah ini "Peluang kecil".
     */
    perSekolah: Array<{ sekolahId: number; nama: string; jumlahCek: number; peluangKecil: number }>;
    /** jumlahCek: jumlah anak per kecamatan KK di cek terakhirnya. */
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
