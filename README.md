# PetaKursi Depok

Perkiraan peluang anak masuk SMA/SMK negeri di Kota Depok per jalur SPMB, alternatif sekolah swasta terdekat, dan dashboard publik untuk melihat sekolah yang kebanjiran pendaftar serta kecamatan yang kekurangan kursi. Subtema: Data-Driven Decision Support (MIA 2026).

Stack: Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma 7, Vitest.

## Menjalankan di komputer sendiri

Prasyarat: Node 24, Docker Desktop.

```bash
npm install                 # juga menjalankan prisma generate
cp .env.example .env        # lalu isi JWT_SECRET dan ADMIN_PASSWORD
npm run db:up               # Postgres lokal lewat docker compose
npm run db:migrate          # membuat tabel
npm run db:seed             # jalur, rayon, sekolah, aturan 2026, akun admin
npm run data:impor          # statistik SPMB dari CSV di data-mentah/ (lihat di bawah)
npm run dev                 # http://localhost:3000
npm test                    # tes mesin peluang, agregasi, dan rayon
```

CSV klasemen SPMB berisi nama dan NISN anak, jadi **tidak ada di repo**. Minta filenya ke Dev A, lalu taruh di `data-mentah/` (folder ini di-.gitignore). Tanpa file itu, tes yang memakai data asli otomatis dilewati.

## Struktur penting

| Lokasi | Isi |
|---|---|
| `prisma/schema.prisma` | Rancangan database. Hanya Dev A yang mengubah. |
| `src/lib/kontrak.ts` | Tipe request dan response API. Pegangan Dev B untuk membuat UI. |
| `src/lib/peluang/` | Mesin peluang (fungsi murni) dan rumus skor juknis. |
| `src/lib/etl/agregasi.ts` | CSV klasemen menjadi statistik agregat tanpa data pribadi. Dipakai juga di browser admin. |
| `src/lib/jalur.ts` | Daftar jalur, sub jalur, dan aturan SPMB 2026. |
| `src/proxy.ts` | Penjaga halaman `/admin` (Next 16 mengganti `middleware.ts` menjadi `proxy.ts`). |
| `data/` | Data publik: sekolah, rayon, program keahlian, biaya. Lihat `data/README.md`. |
| `scripts/` | Crawler sekolah dan impor klasemen. |

## API

| Rute | Fungsi |
|---|---|
| `GET /api/sekolah` | Semua sekolah dan koordinatnya |
| `POST /api/peluang` | Hitung peluang, simpan ringkasan anonim, kembalikan token |
| `GET /api/hasil/[token]` | Buka hasil yang disimpan |
| `GET /api/dashboard?tahun=` | Agregat dashboard |
| `GET /api/dashboard/ekspor?jenis=sekolah\|kecamatan` | Unduh CSV |
| `POST /api/admin/masuk`, `/keluar` | Sesi admin (cookie httpOnly) |
| `POST /api/admin/impor` | Simpan agregat hasil parsing di browser |
| `GET`/`PUT /api/admin/aturan/[tahun]` | Rumus dan batas label |
| `PATCH /api/admin/sekolah/[id]` | Koordinat, alamat, biaya |
| `PUT /api/admin/daya-tampung` | Daya tampung per sekolah atau program |

Bentuk request dan response ada di `src/lib/kontrak.ts`.

## Pembagian tugas dan alur branch

Lihat [PEMBAGIAN-TUGAS.md](PEMBAGIAN-TUGAS.md): siapa mengerjakan apa, daftar branch, jadwal sampai 1 November, dan cara menyiapkan proyek tanpa Docker.

## Privasi

Yang tidak pernah disimpan: nama, NISN, nomor HP, dan koordinat rumah. Hasil cek hanya menyimpan kecamatan, jarak yang dibulatkan 50 m, rentang skor per 10 poin, dan label peluang.
