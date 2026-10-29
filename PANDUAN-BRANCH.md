# Panduan Branch SiPesek

Branch dikelompokkan menurut area: `backend/` untuk API, database, data, dan deploy; `frontend/` untuk halaman dan komponen. Pembagian orang dan jadwal ada di [PEMBAGIAN-TUGAS.md](PEMBAGIAN-TUGAS.md).

## Branch utama

| Branch | Fungsi |
|---|---|
| `main` | Versi yang selalu bisa di-deploy. Vercel men-deploy produksi dari sini. Tidak boleh di-commit langsung; perubahan masuk hanya lewat Pull Request (PR). |

## Branch backend

| Branch | Pemilik | Isi | Folder yang disentuh |
|---|---|---|---|
| `backend/statistik-seed` | Zaki | Statistik agregat SPMB 2026 (tanpa nama dan NISN) disimpan di `data/` dan dimuat otomatis oleh seed, sehingga aplikasi bisa dijalankan tanpa CSV mentah | `data/`, `prisma/seed.ts`, `scripts/` |
| `backend/perbaikan-data` | Zaki | Melengkapi koordinat sekolah yang kosong dan biaya sekolah swasta yang ada sumbernya | `data/`, `scripts/` |
| `backend/deploy` | Zaki bersama pemilik homeserver | Penyesuaian deploy homeserver (API dan database) dan Vercel (halaman) | `Dockerfile`, `docker-compose.server.yml`, `next.config.ts` |

## Branch frontend

| Branch | Pemilik | Isi | Halaman |
|---|---|---|---|
| `frontend/kerangka` | Aqil | Layout, header, footer, beranda, gaya dasar dari prototipe | `/` |
| `frontend/alur-cek` | Aqil | Formulir 3 langkah dengan peta, halaman hasil, tombol bagikan | `/cek`, `/hasil/[token]` |
| `frontend/konten` | Aqil | Panduan jalur SPMB dan tanya jawab | `/panduan`, `/tanya-jawab` |
| `frontend/dashboard` | Zaki | Dashboard publik: peta radius, grafik, tabel rayon, ekspor CSV | `/dashboard` |
| `frontend/admin` | Zaki | Halaman admin: masuk, impor, sekolah, aturan | `/admin/*` |

## Branch sementara

Buat dari `main` terbaru bila perlu, lalu hapus setelah digabung:

| Awalan | Untuk | Contoh |
|---|---|---|
| `fix/` | Perbaikan bug | `fix/peta-tidak-muncul-di-hp` |
| `docs/` | Perubahan dokumen saja | `docs/perbarui-readme` |

## Aturan per area

1. **Frontend tidak menyentuh database.** Halaman mengambil data hanya lewat `/api/...` (lihat `src/lib/api.ts`), karena di Vercel tidak ada database.
2. **Hanya branch backend yang mengubah** `prisma/schema.prisma`, migrasi, `src/lib/peluang/`, `src/lib/etl/`, dan `src/app/api/`.
3. **`src/lib/kontrak.ts` adalah kesepakatan bersama.** Perubahan di sini harus dibicarakan dulu, karena memengaruhi backend dan frontend sekaligus.
4. Branch frontend boleh menambah komponen di `src/components/` dan halaman di `src/app/` (selain `src/app/api/`).

## Alur kerja harian

Mulai mengerjakan sebuah branch:
```bash
git checkout main
git pull
git checkout frontend/kerangka      # atau branch lain milikmu
git merge main                      # ambil perubahan terbaru dari main
```

Selama bekerja:
```bash
git add -A
git commit -m "Tambah header dan footer"
git push
```

Selesai satu bagian:
1. Buka GitHub, buat Pull Request dari branch-mu ke `main`.
2. Tunggu preview Vercel jalan, lalu minta rekan memeriksa.
3. Setelah digabung, ambil `main` terbaru di laptop (`git checkout main` lalu `git pull`).

Gabungkan ke `main` minimal dua kali sehari agar konflik tidak menumpuk. Kalau terjadi konflik, selesaikan di branch sendiri dengan `git merge main`, bukan di `main`.

## Yang tidak boleh di-commit

1. `.env`, `.env.server`, dan file `.env.*` lain yang berisi rahasia.
2. Isi `data-mentah/` (CSV klasemen berisi nama dan NISN anak).
3. `src/generated/` (dibuat ulang otomatis oleh `npm install`).
