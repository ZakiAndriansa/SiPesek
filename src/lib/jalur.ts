/**
 * Daftar jalur dan sub jalur SPMB Jabar 2026.
 * `namaDiData` harus sama persis dengan isi kolom "Sub Jalur" di CSV klasemen.
 */

export const JALUR = [
  { kode: "DOMISILI", namaTampilan: "Jalur dekat rumah (Domisili)", deskripsi: "Untuk anak yang KK-nya berada di rayon sekolah (SMA) atau dekat sekolah (SMK). Diurutkan dari rumah terdekat." },
  { kode: "AFIRMASI", namaTampilan: "Jalur keluarga kurang mampu dan berkebutuhan khusus (Afirmasi)", deskripsi: "Untuk keluarga terdaftar DTSEN desil 1 sampai 5 dengan kartu bantuan, anak disabilitas, dan anak cerdas istimewa. Diurutkan dari rumah terdekat." },
  { kode: "PRESTASI", namaTampilan: "Jalur nilai dan prestasi (Prestasi)", deskripsi: "Berdasarkan skor rapor (dan TKA untuk SMA), juara lomba, atau kepemimpinan organisasi." },
  { kode: "MUTASI", namaTampilan: "Jalur orang tua pindah tugas atau anak guru (Mutasi)", deskripsi: "Untuk anak yang orang tuanya pindah tugas atau mengajar di sekolah tujuan. Diurutkan dari rumah terdekat." },
  { kode: "SELEKSI_UNGGULAN", namaTampilan: "Seleksi sekolah unggulan provinsi", deskripsi: "Seleksi terpisah untuk SMAN 1 Depok." },
] as const;

export type KodeJalur = (typeof JALUR)[number]["kode"];

export const SUB_JALUR = [
  { kode: "DOMISILI", namaDiData: "Domisili", jalurKode: "DOMISILI", namaTampilan: "Dekat rumah", metrik: "JARAK_METER" },
  { kode: "AFIRMASI_KETM", namaDiData: "KETM", jalurKode: "AFIRMASI", namaTampilan: "Keluarga kurang mampu (KETM)", metrik: "JARAK_METER" },
  { kode: "AFIRMASI_MBK", namaDiData: "MBK", jalurKode: "AFIRMASI", namaTampilan: "Anak berkebutuhan khusus (MBK)", metrik: "JARAK_METER" },
  { kode: "AFIRMASI_CIBI", namaDiData: "CIBI", jalurKode: "AFIRMASI", namaTampilan: "Cerdas dan bakat istimewa (CIBI)", metrik: "JARAK_METER" },
  { kode: "MUTASI_ANAK_GURU", namaDiData: "Anak Guru", jalurKode: "MUTASI", namaTampilan: "Anak guru di sekolah itu", metrik: "JARAK_METER" },
  { kode: "MUTASI_PINDAH_TUGAS", namaDiData: "Pindah tugas orang tua", jalurKode: "MUTASI", namaTampilan: "Orang tua pindah tugas", metrik: "JARAK_METER" },
  { kode: "PRESTASI_AKD_RAPOR", namaDiData: "Akd - Raport", jalurKode: "PRESTASI", namaTampilan: "Nilai rapor", metrik: "SKOR" },
  { kode: "PRESTASI_AKD_KEJUARAAN", namaDiData: "Akd - Kejuaraan", jalurKode: "PRESTASI", namaTampilan: "Juara lomba akademik", metrik: "SKOR" },
  { kode: "PRESTASI_NONAKD_KEJUARAAN", namaDiData: "Non Akd - Kejuaraan", jalurKode: "PRESTASI", namaTampilan: "Juara lomba non akademik", metrik: "SKOR" },
  { kode: "PRESTASI_KEPEMIMPINAN", namaDiData: "Non Akd - Kepemimpinan", jalurKode: "PRESTASI", namaTampilan: "Ketua OSIS atau organisasi", metrik: "SKOR" },
  { kode: "PRESTASI_KELAS_INDUSTRI", namaDiData: "Akd - Persiapan Kelas Industri", jalurKode: "PRESTASI", namaTampilan: "Kelas industri (nilai 5 mapel)", metrik: "SKOR" },
  { kode: "UNGGULAN_RAPOR", namaDiData: "Kompetensi Akademik Rapor", jalurKode: "SELEKSI_UNGGULAN", namaTampilan: "Unggulan: nilai rapor", metrik: "SKOR" },
  { kode: "UNGGULAN_KEJUARAAN", namaDiData: "Kompetensi Akademik Kejuaraan", jalurKode: "SELEKSI_UNGGULAN", namaTampilan: "Unggulan: juara lomba akademik", metrik: "SKOR" },
  { kode: "UNGGULAN_NONAKADEMIK", namaDiData: "Kompetensi Nonakademik", jalurKode: "SELEKSI_UNGGULAN", namaTampilan: "Unggulan: prestasi non akademik", metrik: "SKOR" },
  { kode: "UNGGULAN_POTENSI", namaDiData: "Potensi Akademik", jalurKode: "SELEKSI_UNGGULAN", namaTampilan: "Unggulan: potensi akademik", metrik: "SKOR" },
] as const;

export type KodeSubJalur = (typeof SUB_JALUR)[number]["kode"];

/** Aturan SPMB 2026 (lihat bentuknya di src/lib/validasi.ts). */
export const ATURAN_2026 = {
  rumusSkor: {
    "SMA:PRESTASI_AKD_RAPOR": { jenis: "RAPOR_TKA", bobotRapor: 0.5, bobotTka: 0.5, skorMaks: 350 },
    "SMK:PRESTASI_AKD_RAPOR": { jenis: "RAPOR", skorMaks: 500 },
    "SMK:PRESTASI_KELAS_INDUSTRI": {
      jenis: "RAPOR_BOBOT_MAPEL",
      skorMaks: 1100,
      bobot: {
        TEKNOLOGI: { bin: 2, mtk: 3, ipa: 3, ips: 1, bing: 2 },
        BISNIS: { bin: 3, mtk: 2, ipa: 1, ips: 3, bing: 2 },
      },
    },
  },
  sumber:
    "Kepgub Jabar 420/Kep.207-Disdik/2026 (juknis SPMB SMA, SMK, SLB); slide sosialisasi juklak Disdik Jabar 2026; bobot program dari juklak SPMB Jabar 2025 (Kepdis 9330/PK.02.01.03/SEKRE)",
  batasLabel: { jarak: "median|maks", skor: "median|min" },
  minDiterima: 5,
} as const;
