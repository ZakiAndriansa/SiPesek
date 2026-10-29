# Pembagian Tugas SiPesek

Batas pengumpulan: **Minggu, 1 November 2026**. Dev A: Zaki. Dev B: rekan tim.

## Status per Kamis, 29 Oktober 2026

Backend sudah selesai dan teruji dengan data SPMB 2026 asli:

1. Database (Prisma + PostgreSQL), seed, dan impor statistik SPMB 2026.
2. Data 205 SMA/SMK negeri dan swasta di Kota Depok, rayon domisili, program keahlian SMK.
3. Mesin peluang semua jalur yang bisa dihitung, termasuk aturan rayon.
4. Semua API di bawah. Bentuk request dan response ada di `src/lib/kontrak.ts`.

Yang belum ada: **semua halaman tampilan** dan deploy.

## Pembagian sisa pekerjaan

Karena backend selesai lebih cepat, Dev A ikut mengerjakan halaman yang paling banyak berurusan dengan data (dashboard dan admin). Dev B fokus pada halaman untuk orang tua, yang paling menentukan penilaian.

| Branch | Pemilik | Isi |
|---|---|---|
| `feat/b-kerangka` | B | Layout, header, footer, Beranda, gaya dasar (dari prototipe miafrontdev.vercel.app) |
| `feat/b-alur-cek` | B | `/cek` (formulir 3 langkah dengan peta) dan `/hasil/[token]` |
| `feat/b-konten` | B | `/panduan` dan `/tanya-jawab` |
| `feat/a-deploy` | A | Database Neon, Vercel, variabel lingkungan |
| `feat/a-dashboard-ui` | A | `/dashboard` |
| `feat/a-admin-ui` | A | `/admin/masuk`, `/admin`, `/admin/impor`, `/admin/sekolah`, `/admin/aturan` |
| `fix/…` | siapa saja | Perbaikan bug |

## Halaman dan API yang dipakai

### `/` Beranda (B)
Penjelasan singkat, tombol "Mulai cek peluang", tiga langkah, empat jalur. Boleh menampilkan angka ringkas dari `GET /api/dashboard` (`ringkas`).

### `/cek` Formulir 3 langkah (B)
1. **Rumah:** peta Leaflet untuk menaruh pin, tombol "Pakai lokasi saya" (geolocation browser), pilihan kecamatan sesuai KK (`KECAMATAN_DEPOK`, `KECAMATAN_IRISAN_LUAR`, `KECAMATAN_LAINNYA` dari `kontrak.ts`), dan pilihan jenjang (SMA, SMK, atau keduanya).
2. **Kondisi keluarga (ya/tidak):** terdaftar DTSEN dan punya kartu bantuan (KETM), anak berkebutuhan khusus, orang tua guru di sekolah negeri tertentu (daftar sekolah dari `GET /api/sekolah`, saring `status === "NEGERI"`), dan orang tua pindah tugas.
3. **Nilai (boleh dilewati):** rata-rata rapor semester 1 sampai 5; untuk SMA nilai TKA Bahasa Indonesia dan Matematika; untuk SMK kelas industri rata-rata 5 mapel (B. Indonesia, Matematika, IPA, IPS, B. Inggris).

Kirim `POST /api/peluang` (`PermintaanPeluang`), lalu arahkan ke `/hasil/{token}`.

Catatan teknis: Leaflet harus dimuat hanya di klien (`"use client"` dan `dynamic(..., { ssr: false })`), karena memakai `window`.

### `/hasil/[token]` (B)
Data dari `GET /api/hasil/{token}` (`ResponsPeluang`).
1. Kartu per sekolah negeri: nama, jarak, label terbaik, lalu daftar jalur dengan label dan `kalimat` (kalimat bukti sudah dibuat backend, tinggal ditampilkan).
2. Bagian "Alternatif swasta terdekat": `swasta.SMA` dan `swasta.SMK`. Biaya: kalau `biaya.resmi` tampilkan biasa; kalau tidak, beri label "menurut media, belum resmi"; kalau `biaya` null tulis "Biaya: tanyakan ke sekolah".
3. Tampilkan `catatan` (bukan jaminan, bukan aplikasi resmi).
4. Tombol salin tautan dan bagikan ke WhatsApp.

### `/dashboard` (A)
Data dari `GET /api/dashboard`. Peta sekolah dengan lingkaran radius domisili, tekanan per sekolah, persentase diterima per kecamatan (bisa dipilih SMA, SMK, semua), tabel rayon (rayon F Pancoran Mas tanpa SMAN reguler disorot), program SMK, kursi kosong bila daya tampung sudah diisi, sinyal minat, dan tombol ekspor `GET /api/dashboard/ekspor?jenis=sekolah|kecamatan`.

### `/admin/*` (A)
`POST /api/admin/masuk`, `/keluar`; impor CSV diparse di browser dengan `agregasi()` dari `src/lib/etl/agregasi.ts` lalu dikirim ke `POST /api/admin/impor`; `PATCH /api/admin/sekolah/[id]`; `PUT /api/admin/daya-tampung`; `GET`/`PUT /api/admin/aturan/[tahun]`.

## Teks yang sudah disepakati

Label peluang (selalu dengan warna **dan** ikon, supaya tetap terbaca oleh yang sulit membedakan warna):

| Nilai API | Teks | Warna dan ikon |
|---|---|---|
| `PELUANG_BESAR` | Peluang besar | hijau, centang |
| `MASIH_MUNGKIN` | Masih mungkin | kuning, timbangan |
| `PELUANG_KECIL` | Peluang kecil | merah, segitiga peringatan |
| `TIDAK_DIHITUNG` | Belum bisa dihitung | abu-abu, tanda tanya |

Nama jalur memakai bahasa sehari-hari dengan istilah resmi di dalam kurung: "Jalur dekat rumah (Domisili)", "Jalur keluarga kurang mampu dan berkebutuhan khusus (Afirmasi)", "Jalur nilai dan prestasi (Prestasi)", "Jalur orang tua pindah tugas atau anak guru (Mutasi)". Teks lengkapnya ada di `src/lib/jalur.ts`.

Masukan dari uji coba prototipe yang harus diterapkan:
1. Teks jangan kecil dan pucat; utamakan keterbacaan untuk orang tua yang jarang memakai HP.
2. Tautan "Dashboard kebijakan" boleh ada di footer, tetapi "Panel admin" jangan ditampilkan ke orang tua.
3. Hapus tulisan "Data contoh untuk prototipe": data sekarang sudah asli.
4. Tidak ada login untuk orang tua; halaman `/masuk` dengan kode WhatsApp di prototipe tidak dipakai.

## Jadwal sisa

| Hari | Dev A | Dev B |
|---|---|---|
| Kamis 29 (sisa) | Database Neon dan deploy pertama | Siapkan proyek, mulai `feat/b-kerangka` |
| Jumat 30 | `feat/a-dashboard-ui` | `feat/b-alur-cek` (cek dan hasil) |
| Sabtu 31 | `feat/a-admin-ui`, lengkapi koordinat sekolah yang kosong; malam: uji ujung ke ujung di HP | `feat/b-konten`, rapikan tampilan HP; malam: uji bersama |
| Minggu 1 | Pagi: kode dibekukan, hanya perbaikan bug. Siang: berkas lomba dan pengumpulan | sama |

Kalau waktu habis, yang dipotong berurutan: `/admin/aturan`, sinyal minat di dashboard, kursi kosong, `/admin/impor` (impor tetap bisa lewat `npm run data:impor`).

## Aturan kerja

1. Jangan commit langsung ke `main`. Buat branch dari `main` terbaru, lalu buka PR. PR digabung setelah dicek orang lain dan preview Vercel-nya jalan.
2. Gabungkan ke `main` minimal dua kali sehari agar tidak menumpuk konflik.
3. Hanya Dev A yang mengubah `prisma/schema.prisma` dan migrasi.
4. `src/lib/kontrak.ts` hanya diubah setelah disepakati berdua.
5. Jangan pernah commit `.env` atau isi `data-mentah/` (berisi nama dan NISN anak).

## Menyiapkan proyek (Dev B)

Tidak perlu Docker. Dev A memberikan `DATABASE_URL` database Neon bersama lewat pesan pribadi (jangan ditaruh di repo atau grup).

```bash
git clone https://github.com/ZakiAndriansa/SiPesek.git
cd SiPesek
npm install
cp .env.example .env      # isi DATABASE_URL dari Dev A dan JWT_SECRET (32 karakter acak)
npm run dev               # http://localhost:3000, API sudah berisi data asli
git checkout -b feat/b-kerangka
```

Database bersama sudah berisi data, jadi Dev B **tidak** perlu menjalankan migrate, seed, atau impor.
