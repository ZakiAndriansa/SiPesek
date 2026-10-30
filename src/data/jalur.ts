export type Jalur = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  cocok: string;
  docs: string[];
};

export const JALUR: Jalur[] = [
  {
    id: "domisili",
    icon: "map-pin",
    title: "Jalur Domisili",
    desc: "Berdasarkan dekatnya rumah dengan sekolah. Jarak dihitung dari titik rumah dan alamat di Kartu Keluarga.",
    cocok:
      "Cocok bila rumah dekat sekolah yang dituju dan nilai anak biasa saja.",
    docs: [
      "Kartu Keluarga yang terbit minimal satu tahun sebelum pendaftaran",
      "Akta kelahiran",
      "Rapor atau surat keterangan lulus",
    ],
  },
  {
    id: "afirmasi",
    icon: "shield",
    title: "Jalur Afirmasi",
    desc: "Untuk keluarga kurang mampu (disebut KETM, Keluarga Ekonomi Tidak Mampu) atau penyandang disabilitas. Kuotanya terpisah dari jalur lain.",
    cocok:
      "Cocok bila keluarga menerima bantuan sosial seperti KIP (Kartu Indonesia Pintar), PKH (Program Keluarga Harapan), atau terdaftar di DTSEN (Data Tunggal Sosial dan Ekonomi Nasional).",
    docs: [
      "Kartu Keluarga dan akta kelahiran",
      "Bukti bantuan: KIP (Kartu Indonesia Pintar), PKH (Program Keluarga Harapan), atau terdaftar di DTSEN (Data Tunggal Sosial dan Ekonomi Nasional)",
      "Surat keterangan disabilitas bila ada",
    ],
  },
  {
    id: "prestasi",
    icon: "award",
    title: "Jalur Prestasi",
    desc: "Berdasarkan nilai rapor atau prestasi lomba tingkat kecamatan sampai nasional.",
    cocok: "Cocok bila nilai rapor tinggi atau anak punya juara lomba.",
    docs: [
      "Rapor semester 1 sampai 5",
      "Sertifikat lomba yang sudah dilegalisir",
      "Kartu Keluarga dan akta kelahiran",
    ],
  },
  {
    id: "mutasi",
    icon: "briefcase",
    title: "Jalur Mutasi",
    desc: "Untuk anak yang orang tuanya pindah tugas, atau anak guru di sekolah tujuan.",
    cocok:
      "Cocok bila ada surat penugasan atau surat keterangan dari instansi.",
    docs: [
      "Surat penugasan atau surat pindah dari instansi",
      "Kartu Keluarga dan akta kelahiran",
      "Surat keterangan guru, bila anak guru",
    ],
  },
];
