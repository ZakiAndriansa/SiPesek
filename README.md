# SiPesek

Perkiraan peluang anak masuk SMA/SMK negeri di Kota Depok per jalur SPMB, alternatif sekolah swasta terdekat, dan dashboard publik untuk melihat sekolah yang kebanjiran pendaftar serta kecamatan yang kekurangan kursi. Subtema: Data-Driven Decision Support (MIA 2026).

Aplikasi produksi: https://si-pesek.vercel.app

## Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript 5 |
| Tampilan | Tailwind CSS 4 dan design token CSS, Motion untuk animasi, Number Flow untuk angka |
| Peta | Leaflet dan React Leaflet |
| Grafik dashboard | Recharts |
| Database | PostgreSQL, Prisma 7 dengan driver adapter `pg` |
| Validasi | Zod 4 |
| Autentikasi | Orang tua: Google Identity Services (ID token diverifikasi dengan `jose`). Admin: email dan kata sandi (`bcryptjs`). Keduanya memakai sesi JWT di cookie httpOnly |
| Pengolahan data | Papa Parse (CSV klasemen, diproses di browser admin), Cheerio (crawler data sekolah), tsx (skrip) |
| Tes dan kualitas kode | Vitest 5, ESLint 9, `tsc --noEmit` |
| Hosting | Vercel region Singapura (halaman dan API, dengan Speed Insights), Neon Postgres Singapura lewat Vercel Marketplace, GitHub Actions untuk pinger database |

## Menjalankan di komputer sendiri

Prasyarat: Node 24 dan Docker Desktop (untuk Postgres lokal).

```bash
npm install                 # juga menjalankan prisma generate
cp .env.example .env        # lalu isi JWT_SECRET, ADMIN_PASSWORD, NISN_PEPPER, dan Client ID Google
npm run db:up               # Postgres lokal lewat docker compose
npm run db:migrate          # membuat tabel
npm run db:seed             # jalur, rayon, sekolah, aturan 2026, statistik SPMB 2026, akun admin
npm run dev                 # http://localhost:3000
npm test                    # tes mesin peluang, agregasi, dan rayon
```

Statistik SPMB 2026 sudah ada di repo dalam bentuk agregat (`data/statistik-2026.json`, tanpa nama dan NISN), sehingga seed langsung membuat aplikasi siap dipakai. CSV klasemen mentah berisi nama dan NISN anak, jadi **tidak ada di repo**; hanya Zaki yang menyimpannya di `data-mentah/` (folder ini di-.gitignore). Setelah CSV mentah berubah, jalankan `npm run data:ekspor` untuk menulis ulang file JSON, lalu commit. Tanpa CSV mentah, tes yang memakai data asli otomatis dilewati.

## Struktur penting

| Lokasi | Isi |
|---|---|
| `prisma/schema.prisma` | Rancangan database. Hanya Zaki yang mengubah. |
| `src/lib/kontrak.ts` | Tipe request dan response API. Pegangan Aqil untuk membuat UI. |
| `src/lib/peluang/` | Mesin peluang (fungsi murni) dan rumus skor juknis. |
| `src/lib/etl/agregasi.ts` | CSV klasemen menjadi statistik agregat tanpa data pribadi. Dipakai juga di browser admin. |
| `src/lib/jalur.ts` | Daftar jalur, sub jalur, dan aturan SPMB 2026. |
| `src/proxy.ts` | Penjaga halaman admin dan halaman orang tua (Next 16 mengganti `middleware.ts` menjadi `proxy.ts`). API tetap memeriksa sesi sendiri. |
| `data/` | Data publik: sekolah, rayon, program keahlian, biaya. Lihat `data/README.md`. |
| `scripts/` | Crawler sekolah dan impor klasemen. |

## API

| Rute | Fungsi |
|---|---|
| `GET /api/sekolah` | Semua sekolah dan koordinatnya |
| `POST /api/ortu/masuk`, `/keluar` | Sesi orang tua dengan Google (ID token, cookie httpOnly) |
| `GET /api/ortu/saya` | Orang tua yang sedang masuk |
| `GET`/`POST /api/ortu/anak`, `DELETE /api/ortu/anak/[id]` | Data anak (nama dan NISN) milik akun |
| `GET /api/ortu/riwayat?anakId=` | Riwayat cek satu anak |
| `GET /api/ortu/salinan` | Semua data akun dalam satu panggilan, untuk Unduh Salinan Data |
| `DELETE /api/ortu/akun` | Hapus akun dan semua data anak |
| `POST /api/peluang` | Hitung peluang. Dengan `anakId` (wajib masuk): disimpan ke riwayat anak (20 cek terbaru per anak; tanpa batas harian, paling banyak 5 cek per menit per akun). Tanpa `anakId` (mode tamu, wajib NISN): tidak disimpan, tamu dibatasi 10 cek per jam per perangkat dan 150 per IP |
| `GET /api/hasil/[token]` | Buka hasil yang disimpan (hanya pemiliknya) |
| `GET /api/dashboard?tahun=` | Agregat dashboard |
| `GET /api/dashboard/ekspor?jenis=sekolah\|kecamatan` | Unduh CSV |
| `POST /api/admin/masuk`, `/keluar` | Sesi admin (cookie httpOnly) |
| `POST /api/admin/impor` | Simpan agregat hasil parsing di browser |
| `GET`/`PUT /api/admin/aturan/[tahun]` | Rumus dan batas label |
| `GET /api/admin/aturan/aktif` | Aturan tahun SPMB yang aktif (dibuka pertama di halaman Aturan SPMB) |
| `PATCH /api/admin/sekolah/[id]` | Koordinat, alamat, biaya |
| `PUT /api/admin/daya-tampung` | Daya tampung per sekolah atau program |
| `GET /api/ping` | Membangunkan database dan menghangatkan fungsi. Diketuk pinger `.github/workflows/pinger.yml`, yang mati secara bawaan; cara menyalakan dan batas kuota Neon ada di berkas itu |

Bentuk request dan response ada di `src/lib/kontrak.ts`.

## Pembagian tugas dan alur branch

Lihat [PEMBAGIAN-TUGAS.md](PEMBAGIAN-TUGAS.md) untuk siapa mengerjakan apa, serta pengaturan deploy di Vercel dan Neon. Daftar branch backend dan frontend beserta alur kerjanya ada di [PANDUAN-BRANCH.md](PANDUAN-BRANCH.md).

## Privasi

Tamu bisa cek peluang tanpa masuk: NISN-nya hanya diperiksa, dan tidak ada isian atau hasil yang disimpan. Orang tua yang masuk dengan Google bisa menyimpan riwayat per anak. Yang disimpan untuk mereka: ID Google, email, dan nama orang tua (foto profil Google hanya dibawa di token sesi untuk header, tidak disimpan di database); nama anak; serta NISN dalam bentuk sidik HMAC (`NISN_PEPPER`) dan 3 digit terakhirnya. NISN asli tidak disimpan. Hasil cek menyimpan kecamatan, daftar sekolah dan jalur beserta label peluang, jarak yang dibulatkan 50 m, serta skor gabungan hasil hitungan dan rentangnya per 10 poin. Karena jalur afirmasi, anak guru, dan pindah tugas hanya dihitung bila kondisinya dipilih, riwayat juga menyiratkan kondisi itu. Koordinat rumah, NISN lengkap, serta nilai rapor dan TKA per mata pelajaran tidak disimpan. Rincian untuk orang tua ada di halaman `/privasi`. Orang tua bisa menghapus anak atau seluruh akunnya, dan semua riwayatnya ikut terhapus.

NISN tidak bisa dicek otomatis ke data resmi (pencarian NISN Kemendikdasmen dilindungi reCAPTCHA dan tidak punya API publik). Server memeriksa format 10 digit, kewajaran awalan tahun lahir, dan keunikan antarakun; orang tua diarahkan ke nisn.data.kemendikdasmen.go.id untuk memastikan sendiri. Anak dengan NISN yang tidak lazim tidak dihitung di sinyal minat dashboard.
