import { EMAIL_KONTAK } from "./kontak";

export type Faq = readonly [question: string, answer: string];
export type FaqGroup = { title: string; items: Faq[]; link?: { href: string; label: string } };

// Pertanyaan yang juga tampil di beranda ditulis sekali di sini agar jawabannya selalu sama.
const JAMINAN: Faq = [
  "Apakah hasil ini menjamin anak pasti diterima?",
  "Tidak. SiPesek memperkirakan peluang dari hasil SPMB 2026 (daya tampung, jarak, dan nilai pendaftar yang diterima). Ini bukan aplikasi resmi dan bukan jaminan. Keputusan tetap di panitia SPMB, dan pendaftaran dilakukan lewat portal SPMB Dinas Pendidikan.",
];
const BIAYA: Faq = ["Apakah ada biaya?", "Tidak. SiPesek gratis, tanpa iklan atau pelacak, dan data tidak dijual."];
const AKUN: Faq = [
  "Apakah harus membuat akun?",
  "Tidak harus. Cek Cepat bisa dipakai tanpa akun dan hasilnya tidak disimpan. Masuk dengan akun Google hanya perlu bila Bapak/Ibu ingin menyimpan data anak dan riwayat hasil, serta membuka detail sekolah, cadangan swasta, dan unduhan.",
];
const AMAN: Faq = [
  "Apakah data keluarga kami aman?",
  "Cek Cepat tidak menyimpan apa pun: isian hilang saat tab ditutup. Data anak yang diisi setelah masuk hanya dipakai untuk menghitung peluang dan hanya terlihat oleh akun itu.",
];

/** Empat pertanyaan di beranda, diambil dari daftar lengkap di halaman Tanya Jawab. */
export const FAQ_BERANDA: Faq[] = [JAMINAN, AMAN, AKUN, BIAYA];

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Umum",
    items: [
      JAMINAN,
      BIAYA,
      [
        "Datanya dari mana?",
        "Dari hasil SPMB 2026 Kota Depok: 20 SMA dan SMK negeri dengan daya tampung 7.104 kursi, beserta sekolah swasta terdekat sebagai cadangan.",
      ],
      [
        "Berapa lama pengisiannya?",
        "Cek Cepat hanya butuh beberapa menit. Bila masuk, data anak dan riwayat hasil tersimpan. Nilai rapor dan titik rumah hanya dipakai saat menghitung dan tidak disimpan.",
      ],
      [
        "NISN anak saya sudah didaftarkan akun lain. Bagaimana?",
        `Satu NISN hanya bisa terdaftar di satu akun. Bila Bapak/Ibu yakin itu anak sendiri, kirim email ke ${EMAIL_KONTAK} agar pengelola memeriksanya.`,
      ],
    ],
  },
  {
    title: "Akun",
    items: [
      AKUN,
      [
        "Kenapa masuk dengan Google?",
        "Agar hasil tiap anak tersimpan dan bisa dibuka lagi kapan saja, tanpa membuat kata sandi baru. SiPesek hanya menerima nama, email, dan ID akun, tanpa akses ke Gmail, Drive, atau kontak.",
      ],
      [
        "Bisakah satu akun untuk lebih dari satu anak?",
        "Bisa. Satu akun bisa menyimpan sampai 5 anak, masing-masing dengan riwayat hasilnya sendiri.",
      ],
    ],
  },
  {
    title: "Data dan privasi",
    link: { href: "/privasi", label: "Baca kebijakan privasi lengkap" },
    items: [
      AMAN,
      [
        "Apakah NISN anak disimpan?",
        "Di Cek Cepat, NISN hanya diperiksa lalu dibuang. Bila masuk, NISN disimpan sebagai sidik (kode acak satu arah) ditambah 3 angka terakhir, agar satu NISN hanya terdaftar di satu akun. NISN lengkap tidak bisa dibaca kembali.",
      ],
      [
        "Data apa saja yang diminta?",
        "Nama dan NISN anak, nilai rapor, kecamatan sesuai KK, titik rumah, kondisi keluarga bila ada, dan prestasi. SiPesek tidak meminta NIK. Titik rumah dan nilai per mata pelajaran hanya dipakai saat menghitung, tidak disimpan.",
      ],
      [
        "Apakah lokasi rumah kami terlihat orang lain?",
        "Tidak. Titik rumah hanya dipakai untuk menghitung jarak, lalu dibuang. Dashboard publik hanya menampilkan jumlah anak per sekolah dan per kecamatan, tanpa nama.",
      ],
      [
        "Bagaimana cara menghapus data?",
        "Buka halaman Anak Saya, lalu pilih Hapus Seluruh Data. Semua data anak dan riwayatnya langsung terhapus.",
      ],
    ],
  },
  {
    title: "Membaca hasil",
    items: [
      [
        "Apa arti Peluang besar, Masih mungkin, dan Peluang kecil?",
        "Peluang besar: jarak atau nilai anak sama atau lebih baik dari separuh siswa yang diterima tahun 2026, cocok sebagai pilihan aman. Masih mungkin: masih di dalam rentang siswa yang diterima, cocok untuk satu pilihan ambisius. Peluang kecil: di luar rentang itu, sebaiknya bukan satu-satunya pilihan.",
      ],
      [
        "Mengapa hasilnya berupa label, bukan angka pasti?",
        "Karena jumlah pendaftar tahun ini belum diketahui. Label beserta alasannya lebih jujur daripada satu angka yang terlihat pasti.",
      ],
      [
        "Bagaimana bila alamat di KK berbeda dengan rumah?",
        "SiPesek tetap menampilkan hasil, menjelaskan dampaknya pada Jalur Domisili, lalu menyarankan jalur lain bila perlu.",
      ],
      [
        "Bagaimana bila data tahun lalu kurang?",
        'SiPesek menulis "Belum cukup data untuk memperkirakan" daripada menebak.',
      ],
    ],
  },
];
