# Pembagian Tugas SiPesek

Batas pengumpulan: **Minggu, 1 November 2026**. Tim: **Zaki** (backend, dashboard, admin) dan **Aqil** (halaman untuk orang tua).

## Status per Kamis, 29 Oktober 2026

Backend sudah selesai dan teruji dengan data SPMB 2026 asli:

1. Database (Prisma + PostgreSQL), seed, dan impor statistik SPMB 2026.
2. Data 205 SMA/SMK negeri dan swasta di Kota Depok, rayon domisili, program keahlian SMK.
3. Mesin peluang semua jalur yang bisa dihitung, termasuk aturan rayon.
4. Semua API di bawah. Bentuk request dan response ada di `src/lib/kontrak.ts`.

Yang belum ada: **semua halaman tampilan** dan deploy.

## Pembagian sisa pekerjaan

Karena backend selesai lebih cepat, Zaki ikut mengerjakan halaman yang paling banyak berurusan dengan data (dashboard dan admin). Aqil fokus pada halaman untuk orang tua, yang paling menentukan penilaian. Aturan dan alur kerja setiap branch ada di [PANDUAN-BRANCH.md](PANDUAN-BRANCH.md).

| Branch | Pemilik | Isi |
|---|---|---|
| `backend/statistik-seed` | Zaki | Statistik agregat 2026 masuk seed, agar aplikasi bisa jalan tanpa CSV mentah |
| `backend/perbaikan-data` | Zaki | Koordinat sekolah yang kosong dan biaya sekolah swasta |
| `backend/deploy` | Zaki | Homeserver (API + database) dan Vercel (halaman), lihat bagian Deploy |
| `frontend/kerangka` | Aqil | Layout, header, footer, Beranda, gaya dasar (dari prototipe miafrontdev.vercel.app) |
| `frontend/alur-cek` | Aqil | `/cek` (formulir 3 langkah dengan peta) dan `/hasil/[token]` |
| `frontend/konten` | Aqil | `/panduan` dan `/tanya-jawab` |
| `frontend/dashboard` | Zaki | `/dashboard` |
| `frontend/admin` | Zaki | `/admin/masuk`, `/admin`, `/admin/impor`, `/admin/sekolah`, `/admin/aturan` |
| `fix/…` | siapa saja | Perbaikan bug |

## Halaman dan API yang dipakai

**Aturan penting untuk semua halaman:** ambil data hanya lewat `/api/...`. Jangan mengimpor `src/lib/db.ts`, `src/lib/dashboard.ts`, `src/lib/peluang/muat.ts`, atau Prisma dari halaman dan komponen. Halaman di-deploy di Vercel yang tidak punya database; hanya `/api` yang diteruskan ke homeserver. Di komponen klien pakai `fetch("/api/...")`; di server component pakai `fetch(urlApi("/api/..."))` dari `src/lib/api.ts`.

### `/` Beranda (Aqil)
Penjelasan singkat, tombol "Mulai cek peluang", tiga langkah, empat jalur. Boleh menampilkan angka ringkas dari `GET /api/dashboard` (`ringkas`).

### `/cek` Formulir 3 langkah (Aqil)
1. **Rumah:** peta Leaflet untuk menaruh pin, tombol "Pakai lokasi saya" (geolocation browser), pilihan kecamatan sesuai KK (`KECAMATAN_DEPOK`, `KECAMATAN_IRISAN_LUAR`, `KECAMATAN_LAINNYA` dari `kontrak.ts`), dan pilihan jenjang (SMA, SMK, atau keduanya).
2. **Kondisi keluarga (ya/tidak):** terdaftar DTSEN dan punya kartu bantuan (KETM), anak berkebutuhan khusus, orang tua guru di sekolah negeri tertentu (daftar sekolah dari `GET /api/sekolah`, saring `status === "NEGERI"`), dan orang tua pindah tugas.
3. **Nilai (boleh dilewati):** rata-rata rapor semester 1 sampai 5; untuk SMA nilai TKA Bahasa Indonesia dan Matematika; untuk SMK kelas industri rata-rata 5 mapel (B. Indonesia, Matematika, IPA, IPS, B. Inggris).

`/cek` terbuka tanpa masuk. Ada dua mode:
1. **Tamu** (tanpa `?anak=`): tambahkan isian NISN di langkah pertama dan tampilkan keterangan "Mode tamu: hasil tidak disimpan". Kirim `POST /api/peluang` tanpa `anakId` dan dengan `nisn`. Balasannya punya `token: null`, jadi tampilkan hasil langsung di halaman yang sama (komponen kartu hasil yang sama dengan `/hasil/[token]`), lalu tombol "Simpan hasil ini" yang menuju `/masuk?lanjut=/anak`. Simpan isian formulir di `sessionStorage` agar tidak perlu diketik ulang setelah masuk. Balasan 400 berarti NISN bukan 10 digit. Balasan 429 berarti batas 10 cek per jam tercapai; tampilkan pesan `galat` dan ajakan masuk dengan Google.
2. **Sudah masuk** (`/cek?anak={id}`): tampilkan nama anak di atas formulir, tanpa isian NISN. Kirim dengan `anakId`, lalu arahkan ke `/hasil/{token}`. Balasan 429 berarti batas 20 cek per 24 jam tercapai.

Pada kedua mode, bila `nisnLazim` bernilai false, tampilkan peringatan NISN tidak lazim dan tautan ke `https://nisn.data.kemendikdasmen.go.id/`.

Catatan teknis: Leaflet harus dimuat hanya di klien (`"use client"` dan `dynamic(..., { ssr: false })`), karena memakai `window`.

### `/hasil/[token]` (Aqil)
Data dari `GET /api/hasil/{token}` (`ResponsPeluang`), diambil **di komponen klien** dengan `fetch("/api/hasil/...")` agar cookie ikut terkirim. Server component di Vercel tidak meneruskan cookie ke homeserver. Hasil hanya bisa dibuka pemiliknya (selain itu 404).
1. Kartu per sekolah negeri: nama, jarak, label terbaik, lalu daftar jalur dengan label dan `kalimat` (kalimat bukti sudah dibuat backend, tinggal ditampilkan).
2. Bagian "Alternatif swasta terdekat": `swasta.SMA` dan `swasta.SMK`. Biaya: kalau `biaya.resmi` tampilkan biasa; kalau tidak, beri label "menurut media, belum resmi"; kalau `biaya` null tulis "Biaya: tanyakan ke sekolah".
3. Tampilkan `catatan` (bukan jaminan, bukan aplikasi resmi).
4. Tombol bagikan ke WhatsApp dihapus, karena hasil hanya bisa dibuka orang tua pemiliknya. Ganti dengan tautan ke `/riwayat/{anakId}`.

### Masuk dengan Google dan data anak (Aqil)
Semua bentuk data ada di bagian "Orang tua" di `src/lib/kontrak.ts`. Nama halaman di bawah mengikuti rancangan awal; sesuaikan dengan halaman prototipe (misalnya `/anak` menjadi `/anak-saya`, `/cek` tamu menjadi `/cek-cepat`). `src/proxy.ts` masih memakai sesi tiruan prototipe (`src/lib/accounts.ts`); saat disambungkan, ganti dengan `verifikasiTokenOrtu` atas cookie `sipesek_ortu` dan arahkan pengunjung yang belum masuk ke `/masuk`. Halaman cek untuk tamu tetap terbuka. Semua respons 401 dari API juga diarahkan ke `/masuk`.

1. **`/masuk`:** muat `https://accounts.google.com/gsi/client` dengan `next/script` (`strategy="afterInteractive"`), lalu `google.accounts.id.initialize({ client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, callback })` dan `google.accounts.id.renderButton(...)`. Callback mengirim `POST /api/ortu/masuk` dengan `{ credential: respons.credential }`, lalu `router.replace(lanjut)` atau `/anak`. Terima `lanjut` hanya bila diawali `/` dan bukan `//`, agar tidak bisa dipakai untuk mengalihkan ke situs lain. **Form nomor HP dan kode OTP dihapus.**
2. **`/anak`:** daftar dari `GET /api/ortu/anak`, dengan tombol "Cek peluang" (`/cek?anak={id}`), "Riwayat" (`/riwayat/{id}`), dan "Hapus" (`DELETE /api/ortu/anak/{id}`). Form "Tambah anak" (`POST /api/ortu/anak`):
   a. Isian nama anak dan NISN.
   b. Kotak centang wajib: "Saya orang tua atau wali anak ini dan setuju datanya diproses".
   c. Tautan "Cek NISN di situs resmi" ke `https://nisn.data.kemendikdasmen.go.id/`.
   d. Pesan galat dari `galat` di balasan 400 (format NISN), 409 (NISN sudah terdaftar), dan 422 (sudah 5 anak).
   e. Peringatan bila `nisnLazim` false. NISN ditampilkan sebagai "NISN ...{nisnAkhir}".
3. **`/riwayat/[anakId]`:** `GET /api/ortu/riwayat?anakId=`, berisi daftar cek dengan tanggal, jenjang, dan ringkasan label; setiap baris menuju `/hasil/{token}`.
4. **Header:** nama dari `GET /api/ortu/saya`, tombol Keluar (`POST /api/ortu/keluar`), dan menu "Hapus akun dan semua data" (`DELETE /api/ortu/akun`, dengan konfirmasi).
5. **Kebijakan privasi:** yang disimpan adalah ID Google, email, dan nama orang tua; nama anak; dan NISN dalam bentuk sidik dan 3 digit terakhir. Riwayat cek disimpan tanpa alamat dan nilai persis. Data bisa dihapus kapan saja dari menu akun.

### `/dashboard` (Zaki)
Data dari `GET /api/dashboard`. Peta sekolah dengan lingkaran radius domisili, tekanan per sekolah, persentase diterima per kecamatan (bisa dipilih SMA, SMK, semua), tabel rayon (rayon F Pancoran Mas tanpa SMAN reguler disorot), program SMK, kursi kosong bila daya tampung sudah diisi, sinyal minat, dan tombol ekspor `GET /api/dashboard/ekspor?jenis=sekolah|kecamatan`.

### `/admin/*` (Zaki)
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
4. Orang tua masuk dengan Google, bukan nomor HP. Halaman `/masuk` dengan kode WhatsApp di prototipe diganti tombol Google.

## Jadwal sisa

| Hari | Zaki | Aqil |
|---|---|---|
| Kamis 29 (sisa) | Deploy homeserver dan Vercel pertama | Siapkan proyek, mulai `frontend/kerangka` |
| Jumat 30 | `frontend/dashboard` | `frontend/alur-cek` (cek dan hasil) |
| Sabtu 31 | `frontend/admin`, lengkapi koordinat sekolah yang kosong; malam: uji ujung ke ujung di HP | `frontend/konten`, rapikan tampilan HP; malam: uji bersama |
| Minggu 1 | Pagi: kode dibekukan, hanya perbaikan bug. Siang: berkas lomba dan pengumpulan | sama |

Kalau waktu habis, yang dipotong berurutan: `/admin/aturan`, sinyal minat di dashboard, kursi kosong, `/admin/impor` (impor tetap bisa lewat `npm run data:impor`).

## Aturan kerja

1. Jangan commit langsung ke `main`. Buat branch dari `main` terbaru, lalu buka PR. PR digabung setelah dicek orang lain dan preview Vercel-nya jalan.
2. Gabungkan ke `main` minimal dua kali sehari agar tidak menumpuk konflik.
3. Hanya Zaki yang mengubah `prisma/schema.prisma` dan migrasi.
4. `src/lib/kontrak.ts` hanya diubah setelah disepakati berdua.
5. Jangan pernah commit `.env` atau isi `data-mentah/` (berisi nama dan NISN anak).

## Menyiapkan proyek (Aqil)

Tidak perlu Docker dan tidak perlu database. Saat development, `/api` diteruskan ke backend di homeserver.

```bash
git clone https://github.com/ZakiAndriansa/SiPesek.git
cd SiPesek
npm install
cp .env.example .env      # isi BACKEND_URL dengan alamat homeserver dari Zaki; DATABASE_URL biarkan
npm run dev               # http://localhost:3000, data diambil dari homeserver
git checkout frontend/kerangka
```

Catatan: hasil cek yang dibuat saat mencoba ikut tercatat di sinyal minat dashboard. Zaki membersihkannya sebelum demo.

## Deploy

| Bagian | Tempat | Isi |
|---|---|---|
| Halaman | Vercel | Proyek Next.js yang sama. Variabel: `BACKEND_URL` (alamat homeserver, https), `JWT_SECRET` (sama persis dengan di homeserver, dipakai `src/proxy.ts` untuk menjaga halaman admin dan orang tua), dan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (deploy ulang setelah diisi, karena nilainya ditanam saat build). |
| API dan database | Homeserver | `docker-compose.server.yml`: aplikasi lengkap dan Postgres. Port Postgres tidak dibuka ke luar. |

`next.config.ts` meneruskan semua `/api/*` ke `BACKEND_URL` bila variabel itu diisi. Karena diteruskan dari server Vercel, tidak perlu pengaturan CORS, dan cookie admin tetap berada di domain Vercel.

Di homeserver (butuh Docker), buat `.env.server` berisi `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GOOGLE_CLIENT_ID`, dan `NISN_PEPPER` (simpan cadangannya; jangan pernah diganti setelah ada data anak), lalu:

```bash
docker compose -f docker-compose.server.yml --env-file .env.server up -d --build
docker compose -f docker-compose.server.yml --env-file .env.server run --rm alat npx prisma migrate deploy
docker compose -f docker-compose.server.yml --env-file .env.server run --rm alat npx prisma db seed
```

Seed sudah mengisi statistik SPMB 2026 dari `data/statistik-2026.json` (agregat, tanpa nama dan NISN), jadi CSV mentah tidak pernah disalin ke homeserver dan tidak perlu impor terpisah. Kalau statistik perlu diperbarui tanpa menunggu deploy ulang, Zaki bisa mengirim agregat langsung dari laptopnya:

```bash
SIPESEK_URL=https://alamat-homeserver npm run data:kirim
```

Homeserver harus bisa dijangkau Vercel lewat https, misalnya dengan Cloudflare Tunnel atau reverse proxy (Caddy, Nginx) dengan domain. Kalau homeserver mati, aplikasi tidak bisa menghitung peluang, jadi pastikan menyala selama masa penilaian.
