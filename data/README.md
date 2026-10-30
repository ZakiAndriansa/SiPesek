# Sumber data

Semua file di folder ini publik dan boleh di-commit. CSV klasemen SPMB mentah (berisi nama dan NISN) tidak boleh ada di sini; simpan di `data-mentah/`.

| File | Isi | Sumber |
|---|---|---|
| `sekolah-depok.csv` | Semua SMA dan SMK negeri dan swasta di Kota Depok: alamat, akreditasi, koordinat | Data Referensi Kemendikdasmen, diambil dengan `npm run data:sekolah`. Halaman per sekolah: `https://referensi.data.kemendikdasmen.go.id/pendidikan/npsn/{NPSN}` |
| `rayon.csv` | 11 rayon domisili SMA Kota Depok: kecamatan utama dan irisan | Lampiran Kepgub Jabar No. 420/Kep.207-Disdik/2026 (juknis SPMB SMA, SMK, SLB 2026) |
| `rayon-sekolah.csv` | SMAN dan SMA swasta per rayon, ditulis persis seperti di juknis | Lampiran juknis yang sama. Catatan: di dokumen asli, huruf urut rayon D tidak berurutan (huruf b muncul dua kali dan huruf e tidak ada) |
| `kode-spmb.csv` | NPSN yang ditulis berbeda di CSV SPMB, serta kategori sekolah unggulan | CSV klasemen SPMB 2026 (SMKN 5 tertulis `USB-SMKN5DEPOK`) |
| `program-keahlian.csv` | Program keahlian 5 SMKN dan kelompok bobot Kelas Industri | CSV klasemen SPMB 2026. Bobot dari Tabel 4.1 Juklak SPMB Jabar 2025 (teknologi 2-3-3-1-2, bisnis/pariwisata/seni 3-2-1-3-2) |
| `biaya-swasta.csv` | Biaya sekolah swasta, hanya yang ada sumbernya | Situs resmi sekolah (`resmi=true`) atau media (`resmi=false`, ditampilkan dengan label "menurut media") |
| `daya-tampung.csv` | Kuota (daya tampung) 20 SMA/SMK negeri Kota Depok, SPMB 2026 | [Gebrak.id, 11 Juni 2026](https://www.gebrak.id/2026/06/krisis-daya-tampung-sma-smk-negeri-di-depok-kian-nyata-jabar-gagal-kejar-kebutuhan-25-ribu-siswa.html), mengutip data SPMB Jabar 2026. Total 7.104 kursi. Portal spmb.jabarprov.go.id tidak dapat diakses saat data diambil (30 Oktober 2026). Dicocokkan dengan CSV klasemen: siswa yang diterima tidak pernah melebihi kuota di 20 sekolah, dan SMAN 1 tepat 320 dari 320. Angka pendaftar di artikel tidak dipakai karena diambil saat pendaftaran masih berjalan |

Rumus skor ada di `src/lib/jalur.ts` (`ATURAN_2026`), bersumber dari juknis di atas dan slide sosialisasi juklak Disdik Jabar 2026.
