# Pembagian Tugas SiPesek

Batas pengumpulan: **Minggu, 1 November 2026**. Tim: **Zaki** (backend, dashboard, admin) dan **Aqil** (halaman untuk orang tua).

## Status per Minggu, 1 November 2026

Semua halaman untuk tiga peran sudah memakai data asli dari API. Bentuk request dan response ada di `src/lib/kontrak.ts`.

1. **Backend:** database (Prisma + PostgreSQL), seed statistik SPMB 2026, data 205 SMA/SMK negeri dan swasta di Kota Depok, rayon domisili, program keahlian SMK, mesin peluang semua jalur yang bisa dihitung, login Google orang tua, dan login admin.
2. **Orang tua:** Cek Cepat, masuk dengan Google, data anak, isi data 4 langkah, hasil tersimpan, Hasil Sekolah, Strategi, Cadangan, Dokumen, serta hapus dan unduh data.
3. **Pembuat kebijakan:** dashboard terbuka untuk umum dengan data SPMB 2026.
4. **Admin:** data sekolah dan daya tampung, impor data seleksi, dan aturan SPMB.

Yang tersisa ada di bagian "Sisa sebelum pengumpulan". Aturan dan alur kerja setiap branch ada di [PANDUAN-BRANCH.md](PANDUAN-BRANCH.md).

## Halaman per peran

**Aturan penting untuk semua halaman:** ambil data hanya lewat `/api/...`. Jangan mengimpor `src/lib/db.ts`, `src/lib/dashboard.ts`, `src/lib/peluang/muat.ts`, atau Prisma dari halaman dan komponen. Halaman di-deploy di Vercel yang tidak punya database; hanya `/api` yang diteruskan ke homeserver. Di komponen klien pakai `fetch("/api/...")`; di server component pakai `fetch(urlApi("/api/..."))` dari `src/lib/api.ts`.

### Orang tua

Tampilan dari prototipe Aqil, disambungkan ke API oleh Zaki.

| Halaman | Isi | API |
|---|---|---|
| `/cek-cepat` | Cek tanpa akun: NISN, jenjang, kecamatan KK, titik rumah, kondisi keluarga, dan nilai. Hasil tidak disimpan kecuali orang tua menekan Simpan. | `POST /api/peluang` tanpa `anakId` |
| `/masuk` | Tombol Google | `POST /api/ortu/masuk` |
| `/cek-cepat/simpan` | Simpan hasil Cek Cepat ke anak di akun (anak dibuat bila NISN belum ada) | `POST /api/ortu/simpan-cek` |
| `/anak-saya` | Data Anak: daftar anak dan riwayat cek, hapus satu hasil, hapus anak, unduh salinan data (JSON), dan hapus akun | `GET /api/ortu/anak`, `GET /api/ortu/riwayat`, `DELETE /api/hasil/[token]`, `DELETE /api/ortu/anak/[id]`, `DELETE /api/ortu/akun` |
| `/isi-data/[langkah]` | Isi data anak 4 langkah; isian tersimpan otomatis di perangkat, tanpa NISN dan titik rumah | `POST /api/ortu/anak`, `POST /api/peluang` dengan `anakId` |
| `/hasil/[token]` | Hasil tersimpan, hanya untuk pemiliknya | `GET /api/hasil/[token]` |
| `/peta-sekolah`, `/detail-sekolah/[id]`, `/strategi`, `/cadangan`, `/unduhan` | Hasil Sekolah, Detail Sekolah, Strategi, Cadangan swasta, dan Dokumen, dari hasil terakhir anak yang dipilih | `GET /api/hasil/[token]` |

Data orang tua diambil di komponen klien agar cookie sesi `sipesek_ortu` ikut terkirim; server component di Vercel tidak meneruskan cookie ke homeserver. Respons 401 menampilkan tombol "Masuk lagi". Tanpa `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, halaman Masuk menampilkan akun contoh yang masih memakai halaman prototipe.

### Pembuat kebijakan

Terbuka tanpa login, karena isinya agregat tanpa data pribadi. Tautan "Dashboard Kebijakan" ada di footer.

| Halaman | Isi | API |
|---|---|---|
| `/kebijakan-ringkasan` | Angka utama, temuan yang dihitung otomatis, dan minat orang tua (disamarkan bila kurang dari 10 anak) | `GET /api/dashboard` |
| `/kebijakan-rasio` | Persentase diterima per kecamatan KK untuk SMA, SMK, atau gabungan, dibanding rata-rata kota | `GET /api/dashboard` |
| `/kebijakan-blank-spot` | Peta sekolah dengan radius Jalur Domisili dan tabel rayon; Rayon F Pancoran Mas tanpa SMAN reguler disorot | `GET /api/dashboard` |
| `/kebijakan-pendaftar` | Tekanan pendaftar per sekolah, daya tampung, kuota belum terisi, dan program SMK | `GET /api/dashboard` |
| `/kebijakan-ekspor` | Unduh CSV per sekolah dan per kecamatan | `GET /api/dashboard/ekspor?jenis=sekolah` atau `jenis=kecamatan` |

### Admin

Masuk di `/masuk-petugas` dengan email dan kata sandi admin (sesi 8 jam). Halaman `/admin-*` dijaga `src/proxy.ts` dengan JWT admin, dan API admin memeriksa sesi sendiri. Satu akun admin dibuat oleh seed dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.

| Halaman | Isi | API |
|---|---|---|
| `/masuk-petugas` | Form email dan kata sandi; keluar lewat menu akun | `POST /api/admin/masuk` |
| `/admin-sekolah` | Koordinat, alamat, daya tampung sekolah negeri, dan biaya sekolah swasta | `GET /api/admin/sekolah`, `PATCH /api/admin/sekolah/[id]`, `PUT /api/admin/daya-tampung` |
| `/admin-impor` | CSV klasemen diringkas di browser dengan `agregasi()` dari `src/lib/etl/agregasi.ts`; yang dikirim hanya angka agregat, tanpa NISN | `POST /api/admin/impor` |
| `/admin-aturan` | Rumus skor jalur prestasi, ambang data, tahun acuan, dan salin aturan ke tahun baru | `GET` dan `PUT /api/admin/aturan/[tahun]` |
| `/admin-rencana` | Rencana pengembangan: konfigurasi model peluang, pengguna dan hak akses, validasi NISN resmi | |

## Teks yang sudah disepakati

Label peluang (selalu dengan warna **dan** ikon, supaya tetap terbaca oleh yang sulit membedakan warna):

| Nilai API | Teks | Warna dan ikon |
|---|---|---|
| `PELUANG_BESAR` | Peluang besar | hijau, centang |
| `MASIH_MUNGKIN` | Masih mungkin | kuning, timbangan |
| `PELUANG_KECIL` | Peluang kecil | merah, segitiga peringatan |
| `TIDAK_DIHITUNG` | Belum bisa dihitung | abu-abu, tanda tanya |

Nama jalur memakai bahasa sehari-hari dengan istilah resmi di dalam kurung: "Jalur dekat rumah (Domisili)", "Jalur keluarga kurang mampu dan berkebutuhan khusus (Afirmasi)", "Jalur nilai dan prestasi (Prestasi)", "Jalur orang tua pindah tugas atau anak guru (Mutasi)". Teks lengkapnya ada di `src/lib/jalur.ts`.

Masukan dari uji coba prototipe (sudah diterapkan):
1. Teks jangan kecil dan pucat; utamakan keterbacaan untuk orang tua yang jarang memakai HP.
2. Tautan "Dashboard kebijakan" boleh ada di footer, tetapi "Panel admin" jangan ditampilkan ke orang tua.
3. Hapus tulisan "Data contoh untuk prototipe": data sekarang sudah asli.
4. Orang tua masuk dengan Google, bukan nomor HP. Halaman `/masuk` dengan kode WhatsApp di prototipe diganti tombol Google.

## Sisa sebelum pengumpulan

1. Gabungkan PR dashboard kebijakan dan panel admin (branch `frontend/dashboard-kebijakan`) ke `main`.
2. Deploy ulang homeserver (ada endpoint baru `GET /api/admin/sekolah`) dan Vercel.
3. Pastikan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` dan `JWT_SECRET` terisi di Vercel, lalu coba masuk dengan akun Google yang bukan test user.
4. Coba masuk admin di `/masuk-petugas` dengan akun dari `ADMIN_EMAIL`.
5. Hapus cek uji coba dan akun uji di database produksi, agar sinyal minat di dashboard bersih.
6. Uji ujung ke ujung di HP: Cek Cepat, simpan, isi data, hasil, dashboard, dan admin.

Setelah itu kode dibekukan; hanya perbaikan bug sampai pengumpulan.

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
```

Catatan: hasil cek yang dibuat saat mencoba ikut tercatat di sinyal minat dashboard. Zaki membersihkannya sebelum demo.

## Deploy

| Bagian | Tempat | Isi |
|---|---|---|
| Halaman | Vercel | Proyek Next.js yang sama. Variabel: `BACKEND_URL` (alamat homeserver, https), `JWT_SECRET` (sama persis dengan di homeserver, dipakai `src/proxy.ts` untuk menjaga halaman `/admin-*`), dan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (deploy ulang setelah diisi, karena nilainya ditanam saat build). |
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
