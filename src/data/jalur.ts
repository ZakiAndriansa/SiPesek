import { JALUR as JALUR_SPMB } from "@/lib/jalur";
import type { JalurUtama } from "@/lib/porsi-jalur";

export type Jalur = {
  id: string;
  kode: JalurUtama;
  icon: string;
  title: string;
  desc: string;
  /** Ciri singkat jalur, sama di landing page dan Panduan. */
  ciri: string;
  cocok: string;
  docs: string[];
};

// Deskripsi diambil dari sumber yang sama dengan landing page agar penjelasannya tidak berbeda.
const deskripsi = (kode: JalurUtama) => JALUR_SPMB.find((j) => j.kode === kode)?.deskripsi ?? "";

export const CIRI_JALUR: Record<JalurUtama, string> = {
  DOMISILI: "Paling umum di SMA",
  AFIRMASI: "Kartu bantuan & disabilitas",
  PRESTASI: "Rapor & prestasi",
  MUTASI: "Pindah tugas & anak guru",
};

export const JALUR: Jalur[] = [
  {
    id: "domisili",
    kode: "DOMISILI",
    icon: "map-pin",
    title: "Jalur Domisili",
    desc: deskripsi("DOMISILI"),
    ciri: CIRI_JALUR.DOMISILI,
    cocok: "Cocok bila rumah dekat sekolah tujuan, berapa pun nilai rapornya.",
    docs: [
      "Kartu Keluarga yang terbit minimal satu tahun sebelum pendaftaran",
      "Akta kelahiran",
      "Rapor atau surat keterangan lulus",
    ],
  },
  {
    id: "afirmasi",
    kode: "AFIRMASI",
    icon: "shield",
    title: "Jalur Afirmasi",
    desc: deskripsi("AFIRMASI"),
    ciri: CIRI_JALUR.AFIRMASI,
    cocok:
      "Cocok bila keluarga menerima bantuan seperti PKH (Program Keluarga Harapan) atau KIP (Kartu Indonesia Pintar). Pastikan juga sudah terdaftar di DTSEN.",
    docs: [
      "Kartu Keluarga dan akta kelahiran",
      "Bukti terdaftar di DTSEN (Data Tunggal Sosial dan Ekonomi Nasional), serta kartu bantuan seperti KIP atau PKH bila ada",
      "Surat keterangan disabilitas bila ada",
    ],
  },
  {
    id: "prestasi",
    kode: "PRESTASI",
    icon: "award",
    title: "Jalur Prestasi",
    desc: deskripsi("PRESTASI"),
    ciri: CIRI_JALUR.PRESTASI,
    cocok: "Cocok bila nilai rapor tinggi atau anak punya juara lomba.",
    docs: [
      "Rapor semester 1 sampai 5",
      "Sertifikat lomba yang sudah dilegalisir",
      "Kartu Keluarga dan akta kelahiran",
    ],
  },
  {
    id: "mutasi",
    kode: "MUTASI",
    icon: "briefcase",
    title: "Jalur Mutasi",
    desc: deskripsi("MUTASI"),
    ciri: CIRI_JALUR.MUTASI,
    cocok: "Cocok bila ada surat penugasan atau surat keterangan dari instansi.",
    docs: [
      "Surat penugasan atau surat pindah dari instansi",
      "Kartu Keluarga dan akta kelahiran",
      "Surat keterangan guru, bila anak guru",
    ],
  },
];
