export type Faq = readonly [question: string, answer: string];
export type FaqGroup = { title: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Umum",
    items: [
      [
        "Apakah hasil di sini resmi?",
        "Tidak. Hasilnya perkiraan berdasarkan data tahun-tahun sebelumnya. Keputusan resmi hanya dari panitia SPMB. Pendaftaran tetap lewat situs SPMB resmi.",
      ],
      [
        "Apakah Bapak/Ibu perlu membayar?",
        "Tidak. Aplikasi ini gratis, tanpa iklan, dan data tidak dijual.",
      ],
      [
        "Berapa lama pengisiannya?",
        "Sekitar 8 menit. Isian tersimpan otomatis. Bapak/Ibu bisa berhenti lalu melanjutkan kapan saja, termasuk dari HP lain.",
      ],
    ],
  },
  {
    title: "Data dan privasi",
    items: [
      [
        "Apa beda Cek Cepat dan masuk dengan akun?",
        "Cek Cepat tanpa akun: cukup NISN dan beberapa isian, hasilnya tampil sekali dan tidak disimpan. Dengan akun: isian tersimpan, Bapak/Ibu bisa melihat detail sekolah, cadangan, dan mengunduh dokumen.",
      ],
      [
        "Apakah NISN anak disimpan?",
        "Tidak. NISN hanya diperiksa di browser Bapak/Ibu (harus 10 angka) lalu dibuang. NISN tidak dikirim ke server, tidak masuk cookie, dan tidak dicatat.",
      ],
      [
        "Data apa saja yang diminta?",
        "Nama dan tanggal lahir anak, nilai rapor, status keluarga bila ada, prestasi, dan titik rumah. Kami tidak meminta NIK. NISN hanya diminta di Cek Cepat dan tidak disimpan.",
      ],
      [
        "Apakah lokasi rumah kami terlihat orang lain?",
        "Tidak. Lokasi disimpan terenkripsi. Dinas hanya melihat data gabungan per kecamatan, tidak pernah titik rumah per keluarga.",
      ],
      [
        "Bagaimana cara menghapus data?",
        "Buka halaman Anak Saya, lalu pilih Hapus akun. Semua data anak ikut terhapus.",
      ],
    ],
  },
  {
    title: "Membaca hasil",
    items: [
      [
        "Apa arti Peluang besar, Masih mungkin, dan Peluang kecil?",
        "Peluang besar: peluang besar berdasarkan data tahun lalu. Masih mungkin: peluang seimbang, tergantung jumlah pendaftar tahun ini. Peluang kecil: peluang masih kecil, sebaiknya bukan satu-satunya pilihan.",
      ],
      [
        "Mengapa hasilnya berupa rentang, bukan angka pasti?",
        "Karena jumlah pendaftar tahun ini belum diketahui. Rentang lebih jujur daripada satu angka yang terlihat pasti.",
      ],
      [
        "Bagaimana bila alamat di KK berbeda dengan rumah?",
        "Kami tetap menampilkan hasil, menjelaskan dampaknya pada jalur dekat rumah (Domisili), lalu menyarankan jalur lain bila perlu.",
      ],
      [
        "Bagaimana bila data tahun lalu kurang?",
        'Kami menulis "Belum cukup data untuk memperkirakan" daripada menebak.',
      ],
    ],
  },
];
