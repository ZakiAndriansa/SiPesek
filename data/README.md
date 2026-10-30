# Sumber data

Semua file di folder ini publik dan boleh di-commit. CSV klasemen SPMB mentah (berisi nama dan NISN) tidak boleh ada di sini; simpan di `data-mentah/`.

| File | Isi | Sumber |
|---|---|---|
| `sekolah-depok.csv` | Semua SMA dan SMK negeri dan swasta di Kota Depok: alamat, akreditasi, koordinat | Data Referensi Kemendikdasmen, diambil dengan `npm run data:sekolah`. Halaman per sekolah: `https://referensi.data.kemendikdasmen.go.id/pendidikan/npsn/{NPSN}` |
| `rayon.csv` | 11 rayon domisili SMA Kota Depok: kecamatan utama dan irisan | Lampiran Kepgub Jabar No. 420/Kep.207-Disdik/2026 (juknis SPMB SMA, SMK, SLB 2026) |
| `rayon-sekolah.csv` | SMAN dan SMA swasta per rayon, ditulis persis seperti di juknis | Lampiran juknis yang sama. Catatan: di dokumen asli, huruf urut rayon D tidak berurutan (huruf b muncul dua kali dan huruf e tidak ada) |
| `kode-spmb.csv` | NPSN yang ditulis berbeda di CSV SPMB, serta kategori sekolah unggulan | CSV klasemen SPMB 2026 (SMKN 5 tertulis `USB-SMKN5DEPOK`) |
| `program-keahlian.csv` | Program keahlian 5 SMKN dan kelompok bobot Kelas Industri | CSV klasemen SPMB 2026. Bobot dari Tabel 4.1 Juklak SPMB Jabar 2025 (teknologi 2-3-3-1-2, bisnis/pariwisata/seni 3-2-1-3-2) |
| `statistik-2026.json` | Statistik agregat SPMB 2026 per sekolah, sub jalur, dan program (pendaftar, diterima, nilai terendah, median, tertinggi), serta pendaftar dan diterima unik per kecamatan. Tanpa nama, NISN, atau baris per anak. Diisi oleh seed | Dibuat `npm run data:ekspor` dari CSV klasemen SPMB 2026 di `data-mentah/` (33.234 baris, 20 sekolah negeri) |
| `biaya-swasta.csv` | Biaya sekolah swasta, hanya yang ada sumbernya | Situs resmi sekolah (`resmi=true`) atau media (`resmi=false`, ditampilkan dengan label "menurut media") |

Rumus skor ada di `src/lib/jalur.ts` (`ATURAN_2026`), bersumber dari juknis di atas dan slide sosialisasi juklak Disdik Jabar 2026.
