# Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)

Status dokumen: **paket S2 diimplementasi 2026-10-30** dengan opsi (R) sebagai bawaan. Status per item ada di bagian 9.

Versi ini memetakan **semua kemungkinan** yang realistis. Untuk tiap animasi ada beberapa opsi library, dan di akhir ada paket gabungan (stack) yang bisa dipilih utuh. Rekomendasi saya tetap ditandai, tapi opsi yang tidak saya sarankan juga dicantumkan supaya Anda bisa memutuskan sendiri.

## Dasar pertimbangan

**Pengguna utama (asumsi, belum ada `persona/persona.md`):** orang tua calon siswa SMA/SMK di Depok. Banyak memakai HP, cemas karena keputusan ini menentukan sekolah anak, literasi digital sedang, datang untuk satu tugas: tahu peluang anaknya. Admin dan petugas dinas memakai laptop dan butuh data cepat terbaca.

**Prinsip yang tetap berlaku walaupun memakai library:**
1. Gerak memberi tahu sesuatu berubah. Dekorasi boleh, asal tidak menunda tugas utama.
2. Angka peluang tidak boleh terlihat berubah-ubah atau "diundi". Pengguna harus bisa mempercayainya.
3. Utamakan `transform` dan `opacity`. Mikro 120-250 ms, transisi besar maksimal sekitar 500 ms.
4. Semua animasi tunduk pada `prefers-reduced-motion`. Blok global di `src/styles/base.css` hanya mematikan animasi CSS. Animasi dari library JS (Motion, GSAP, Lottie, dll.) **tidak** ikut mati, jadi setiap library wajib dicek manual (`useReducedMotion` di Motion, `gsap.matchMedia()` di GSAP, `autoplay=false` di Lottie).
5. Library dimuat hanya di halaman yang memakainya (`next/dynamic` atau import di Client Component halaman itu), supaya beranda dan form tidak membawa beban halaman lain.

**Kondisi kode saat ini:** Next.js 16.4, React 19.3, CSS biasa dengan token di `src/styles/tokens.css` (`--duration-fast` 120ms, `--duration-base` 200ms, `--duration-slow` 300ms, `--ease-out`, `--ease-in-out`). Sudah ada Recharts (grafik) dan Leaflet (peta). Belum ada `@keyframes`, dan hanya 18 deklarasi transition di seluruh CSS.

---

## 1. Katalog library yang boleh dipakai komersial

Semua lisensi dicek dari registry npm pada 30 Oktober 2026. Ukuran adalah perkiraan gzip dan bisa berbeda tergantung modul yang di-import.

### 1a. Mesin animasi umum

| Library | Versi | Lisensi | Ukuran (perkiraan) | Cocok untuk | Catatan |
|---|---|---|---|---|---|
| **Motion** (`motion`, dulu Framer Motion) | 14.9 | MIT | ~5 KB dengan `LazyMotion` + `m`, ~35 KB penuh | Komponen React: masuk/keluar, layout, gesture, scroll, reorder | Paling alami di React. Punya `useReducedMotion`, `AnimatePresence`, `layout`, `Reorder`. Harus Client Component. |
| **GSAP** (`gsap`) | 3.15 | GSAP Standard "no charge" | ~25 KB core, +12 KB ScrollTrigger | Timeline kompleks, scroll terikat, SplitText, DrawSVG, MorphSVG | Semua plugin gratis termasuk komersial sejak 2025 ([Webflow](https://webflow.com/blog/gsap-becomes-free)). Lisensinya bukan open source: dilarang dipakai di produk yang bersaing dengan builder visual Webflow ([lisensi](https://gsap.com/community/standard-license/)). SiPesek tidak termasuk, jadi aman. Bekerja di luar React, butuh `@gsap/react` (`useGSAP`) untuk cleanup. |
| **anime.js** (`animejs`) | 4.5 | MIT | ~10-17 KB modular | Timeline SVG, stagger, alternatif GSAP yang benar-benar MIT | API v4 modular. Komunitas React lebih kecil. |
| **React Spring** (`@react-spring/web`) | 10.1 | MIT | ~20 KB | Gerak berbasis pegas (fisika), angka | Terasa "hidup". Lebih sulit dikontrol durasinya, kurang cocok untuk aturan durasi ketat. |
| **AutoAnimate** (`@formkit/auto-animate`) | 0.10 | MIT | ~3 KB | Daftar yang bertambah/berkurang/berpindah | Satu baris (`useAutoAnimate`). Kontrol detail terbatas. |
| **React View Transitions** (bawaan React 19.3 + Next 16) | bawaan | MIT | 0 KB | Transisi antar halaman, elemen bersama (kartu ke detail), crossfade | Sudah tersedia tanpa konfigurasi (lihat `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). Animasi hanya jalan di Chromium 125+ dan Safari/Firefox terbaru. Browser lain tetap berfungsi tanpa animasi. |

### 1b. Library khusus

| Library | Versi | Lisensi | Ukuran (perkiraan) | Untuk apa |
|---|---|---|---|---|
| **NumberFlow** (`@number-flow/react`) | 0.6 | MIT | ~6 KB | Angka berganti dengan digit bergeser, format `Intl` (cocok untuk Rupiah dan persen) |
| **react-countup** | 6.5 | MIT | ~4 KB | Angka menghitung naik dari 0 |
| **Lenis** (`lenis`) | 1.3 | MIT | ~4 KB | Smooth scroll halaman |
| **lottie-react** / `lottie-web` | 3.1 | MIT | ~60-80 KB | Ilustrasi animasi dari file JSON After Effects |
| **dotLottie** (`@lottiefiles/dotlottie-react`) | 0.21 | MIT | WASM, lebih berat di muat awal, render lebih ringan | Sama seperti Lottie, format `.lottie` lebih kecil |
| **Rive** (`@rive-app/react-canvas`) | 4.38 | MIT (runtime) | WASM ~150 KB+ | Karakter interaktif dengan state machine (misal maskot bereaksi pada hasil) |
| **Sonner** (`sonner`) | 2.0 | MIT | ~10 KB | Toast bertumpuk dengan gerak siap pakai |
| **Vaul** (`vaul`) | 1.1 | MIT | ~8 KB + Radix Dialog | Bottom sheet yang bisa diseret di HP |
| **dnd-kit** (`@dnd-kit/sortable`) | 10.0 | MIT | ~15 KB | Drag untuk mengurutkan pilihan sekolah, aksesibel keyboard |
| **@formkit/drag-and-drop** | 0.6 | MIT | ~5 KB | Alternatif drag yang lebih ringan |
| **@use-gesture/react** | 10.3 | MIT | ~8 KB | Swipe, drag, pinch dipasangkan dengan Motion/Spring |
| **react-intersection-observer** | 11.0 | MIT | ~1 KB | Pemicu "saat masuk layar" untuk CSS biasa |
| **SplitType** (`split-type`) | 0.3 | ISC | ~3 KB | Memecah teks per kata/huruf untuk reveal judul (alternatif GSAP SplitText) |
| **canvas-confetti** | 1.9 | ISC | ~6 KB | Konfeti |
| **tsParticles** (`@tsparticles/react`) | 4.5 | MIT | ~40 KB+ (bundle slim) | Partikel latar |
| **react-parallax-tilt** | 1.7 | MIT | ~5 KB | Kartu miring mengikuti kursor |
| **Embla Carousel** (`embla-carousel-react`) | 8.6 | MIT | ~7 KB | Carousel geser untuk kartu sekolah di HP |
| **driver.js** | 1.10 | MIT | ~5 KB | Tur panduan bertahap dengan sorotan elemen |
| **three.js** / **React Three Fiber** | 0.187 / 9.8 | MIT | ~150 KB+ | 3D (misal peta Depok 3D) |
| **OGL** | 1.0 | Unlicense | ~10-30 KB | WebGL ringan untuk efek latar |
| **tw-animate-css** | 1.4 | MIT | hanya CSS | Kelas animasi siap pakai untuk Tailwind (proyek sudah memasang Tailwind 4) |

### 1c. Ditolak atau perlu hati-hati karena lisensi

| Library | Lisensi | Alasan |
|---|---|---|
| **Typed.js** 3.0 | GPL-3.0 | Mewajibkan kode yang memakainya ikut GPL. Ganti dengan `react-type-animation` (MIT) bila efek mengetik dibutuhkan. |
| **Theatre.js Studio** | AGPL-3.0 | Hanya `@theatre/core` (Apache-2.0) yang aman dikirim ke produksi. Studio dipakai saat pengembangan saja, jangan di-bundle. |
| **File animasi Lottie/Rive dari marketplace** | berbeda per file | Library-nya MIT, tapi **aset** punya lisensi sendiri. Cek per file (LottieFiles memakai Lottie Simple License untuk aset gratis, sebagian aset premium berbeda). Simpan bukti lisensi di repo. |
| **GSAP** | Standard "no charge" | Boleh komersial untuk SiPesek. Tidak bisa disebut open source, dan kalau suatu hari SiPesek menjadi builder website visual, lisensinya perlu dicek ulang. |

---

## 2. Paket stack yang bisa dipilih

| Paket | Isi | Tambahan JS (perkiraan) | Kelebihan | Kekurangan | Cocok bila |
|---|---|---|---|---|---|
| **S1. Minimal** | CSS + React View Transitions + `react-intersection-observer` | ~1 KB | Paling ringan, tidak ada risiko lisensi | Efek terbatas, reorder dan angka perlu ditulis sendiri | Prioritas performa HP murah |
| **S2. Motion-sentris** (rekomendasi) | Motion (`LazyMotion`) + NumberFlow + Sonner + View Transitions | ~25 KB | Satu cara berpikir untuk semua komponen React, reduced-motion mudah, reorder dan layout sudah ada | Semua yang beranimasi menjadi Client Component | Ingin hasil rapi dengan usaha sedang |
| **S3. GSAP-sentris** | GSAP + ScrollTrigger + SplitText + `@gsap/react` + Sonner | ~45 KB | Timeline dan scroll paling kuat, efek beranda paling kaya | Bukan gaya React, perlu disiplin cleanup, lisensi non-OSI | Beranda ingin terasa seperti situs kampanye |
| **S4. Ekspresif** | S2 + Lottie/Rive (maskot) + Lenis + dnd-kit + driver.js | ~120-250 KB (dimuat per halaman) | Paling berkarakter, cocok untuk demo lomba | Paling berat, butuh aset ilustrasi, risiko mengganggu orang tua yang cemas | Penilaian lomba menekankan kesan visual |
| **S5. Campuran** | Motion untuk komponen, GSAP hanya di beranda, NumberFlow di dashboard | ~60 KB | Tiap bagian memakai alat terbaiknya | Dua mesin animasi, dua pola kode untuk dipelajari tim | Tim nyaman dengan keduanya |

Rekomendasi saya **S2**, dengan tambahan opsional dari S4 (dnd-kit, maskot Lottie di beranda) bila Anda ingin lebih menonjol untuk lomba.

---

## 3. Ringkasan per halaman

| Halaman | Rute | Yang bisa dianimasikan | Opsi library utama |
|---|---|---|---|
| Beranda | `/` | Hero, judul, ilustrasi, reveal section, kartu jalur, langkah cara kerja, angka data, FAQ, CTA, scroll | Motion, GSAP, Lottie/Rive, SplitType, Lenis |
| Cek Cepat | `/cek-cepat` | Validasi NISN, bagian form, loading, hasil, simpan draf | Motion, NumberFlow, Sonner |
| Isi Data (wizard) | `/isi-data/[langkah]` | Stepper, perpindahan langkah | View Transitions, Motion |
| Hasil Sekolah | `/peta-sekolah` | Kartu hasil, badge, peta, dialog, filter, bottom sheet HP | Motion, AutoAnimate, Vaul, Leaflet |
| Strategi | `/strategi` | Bar probabilitas, urutan pilihan, reorder, accordion | Motion `Reorder`, dnd-kit |
| Detail sekolah | `/detail-sekolah/[id]` | Transisi dari kartu, tab, bar rentang, galeri foto | View Transitions, Motion, Embla |
| Anak saya, Cadangan, Unduhan | `/anak-saya` dll. | Daftar, hapus, toast | AutoAnimate, Motion, Sonner |
| Publik | `/masuk`, `/panduan`, `/tanya-jawab`, `/privasi` | Accordion, tur panduan, form | Motion, driver.js |
| Dashboard kebijakan | `/kebijakan-*` | Angka statistik, grafik, filter, tabel | NumberFlow, Recharts, Motion |
| Dashboard admin | `/admin-*` | Toast, progres impor, drag file | Sonner, Motion |
| Not found / akses ditolak | - | Ilustrasi kecil | Lottie (opsional) |

---

## 4. Item animasi, lengkap dengan opsi

Format opsi: **[L]** = library, **(R)** = rekomendasi saya.

### A. Global

#### A-01 — Umpan balik tombol, tautan, kartu
- Lokasi: `Button`, `Link`, kartu klik, navbar, bottom-nav
- Kebutuhan UX: pengguna di HP perlu tahu tap terdaftar, mengurangi tap ganda.
- Opsi:
  1. **CSS** `:hover` naik 1-2px, `:active` `scale(0.98)`. 120ms. **(R)**, nol biaya, tidak perlu library.
  2. **[Motion]** `whileTap={{ scale: 0.97 }}`, `whileHover={{ y: -2 }}`. Memaksa tombol menjadi Client Component.
  3. **[React Spring]** pegas pada tekan, terasa lebih memantul.
  4. **[react-parallax-tilt]** kartu miring mengikuti kursor. Hanya desktop, tidak saya sarankan untuk form.
- Fallback reduced-motion: warna saja.
- Biaya performa: rendah (opsi 1), rendah-sedang (2-4).
- Prioritas: **wajib**
- Status: usulan

#### A-02 — Reveal saat scroll
- Lokasi: section beranda, kartu daftar, strategi, detail sekolah
- Kebutuhan UX: membantu mengikuti urutan bacaan di halaman panjang.
- Opsi:
  1. **[Motion]** `whileInView` + `viewport={{ once: true }}`, stagger 60ms lewat `variants`. **(R)**
  2. **[GSAP ScrollTrigger]** `batch()` untuk grid, bisa terikat posisi scroll (scrub).
  3. **[react-intersection-observer] + CSS** kelas `is-visible`, paling ringan.
  4. **CSS scroll-driven animation** (`animation-timeline: view()`), tanpa JS. Belum jalan di semua browser, Safari baru sebagian.
  5. **[anime.js]** `onScroll` di v4.
- Aturan: konten di atas lipatan tidak ikut reveal. Konten tetap terlihat tanpa JS.
- Fallback reduced-motion: langsung tampil.
- Biaya performa: rendah
- Prioritas: **disarankan**
- Status: usulan

#### A-03 — Transisi antar halaman
- Lokasi: semua route group
- Kebutuhan UX: orientasi saat berpindah halaman.
- Opsi:
  1. **[React View Transitions]** `<ViewTransition>` bawaan React 19.3, crossfade default, arah maju/mundur dengan `addTransitionType`. **(R)**, nol KB dan didukung resmi Next 16.
  2. **[Motion]** `AnimatePresence` di `template.tsx`. Animasi keluar di App Router sulit karena halaman lama langsung dilepas, jadi hasilnya sering hanya animasi masuk.
  3. **[GSAP]** timeline masuk di `template.tsx`, sama keterbatasannya dengan opsi 2.
  4. **CSS** `@keyframes` fade pada `main`.
- Fallback reduced-motion: tanpa transisi (`@media` pada `::view-transition-*`).
- Biaya performa: rendah
- Prioritas: disarankan
- Status: usulan

#### A-04 — Toast dan alert
- Lokasi: `Toast`, `Alert`
- Kebutuhan UX: konfirmasi aksi (data tersimpan, anak dihapus).
- Opsi:
  1. **[Sonner]** menggantikan `Toast` buatan sendiri: tumpuk, geser untuk tutup, aksesibel. **(R)** bila mau cepat. Perlu menyesuaikan gaya ke token.
  2. **[Motion]** `AnimatePresence` pada `Toast` yang sudah ada, desain tetap sama persis.
  3. **CSS** keyframes masuk/keluar.
- Alert error form: getar kecil 4px dua kali (Motion `animate={{ x: [0,-4,4,0] }}` atau CSS).
- Fallback reduced-motion: muncul tanpa gerak, tanpa getar.
- Biaya performa: rendah
- Prioritas: **wajib**
- Status: usulan

#### A-05 — Dialog, menu mobile, bottom sheet
- Lokasi: `Dialog`, `Menu`, menu navbar mobile
- Kebutuhan UX: menunjukkan lapisan di atas halaman.
- Opsi:
  1. **[Motion]** `AnimatePresence`: backdrop fade, panel `scale(0.97)` ke 1. **(R)**
  2. **[Vaul]** dialog di HP menjadi bottom sheet yang bisa diseret ke bawah untuk tutup, desktop tetap dialog. Cocok untuk ibu jari, tapi butuh Radix Dialog sebagai dependensi.
  3. **CSS** `@starting-style` + `transition-behavior: allow-discrete` pada `<dialog>`, tanpa JS. Dukungan Firefox masih terbatas.
  4. **[GSAP]** timeline buka/tutup.
- Fallback reduced-motion: fade saja.
- Biaya performa: rendah
- Prioritas: **disarankan**
- Status: usulan

#### A-06 — Accordion dan Tabs
- Lokasi: `Accordion` (Tanya Jawab, Panduan, Strategi, detail sekolah), `Tabs`
- Opsi:
  1. **[Motion]** `height: "auto"` animasi tinggi sungguhan + `layoutId` untuk garis indikator tab yang meluncur. **(R)**
  2. **CSS** `grid-template-rows: 0fr → 1fr` untuk tinggi, indikator tab dengan `transform`.
  3. **CSS** `interpolate-size: allow-keywords` (animasi ke `auto`), hanya Chromium.
  4. **[AutoAnimate]** pasang pada wadah accordion, paling sedikit kode.
- Fallback reduced-motion: instan.
- Biaya performa: rendah
- Prioritas: disarankan
- Status: usulan

#### A-07 — Smooth scroll (baru)
- Lokasi: beranda (atau seluruh situs)
- Kebutuhan UX: scroll lebih halus, sinkron dengan animasi scroll.
- Opsi:
  1. **Tidak dipakai.** **(R)** Scroll bawaan HP sudah halus, dan mengubahnya sering terasa "licin" atau lambat bagi pengguna awam.
  2. **[Lenis]** hanya di beranda, dimatikan di halaman form dan peta.
  3. **[GSAP ScrollSmoother]** bila memilih S3.
- Fallback reduced-motion: Lenis dimatikan.
- Biaya performa: sedang (mengambil alih scroll)
- Prioritas: opsional
- Status: usulan

#### A-08 — Tur panduan pertama kali (baru)
- Lokasi: pertama kali masuk `/isi-data/1` atau `/peta-sekolah`
- Kebutuhan UX: literasi digital sedang, orang tua perlu ditunjukkan bagian penting.
- Opsi:
  1. **[driver.js]** sorotan elemen bertahap dengan transisi, bisa dilewati. **(R)** bila fitur ini mau dibuat.
  2. **[Motion]** tooltip buatan sendiri.
  3. Tidak dibuat; cukup halaman `/panduan`.
- Fallback reduced-motion: sorotan tanpa transisi.
- Biaya performa: rendah
- Prioritas: opsional
- Status: usulan

### B. Beranda (`/`)

#### B-01 — Hero masuk
- Kebutuhan UX: nilai situs jelas dalam 5 detik, judul tidak boleh terlambat.
- Opsi:
  1. **[Motion]** ilustrasi (anak, sekolah, bunga) fade + naik 16px, stagger 100ms. Judul dan CTA langsung tampil. **(R)**
  2. **[GSAP + SplitText]** judul muncul per kata dengan mask, lalu ilustrasi. Paling dramatis, tapi judul tertunda sekitar 400-600ms.
  3. **[SplitType + Motion]** sama dengan opsi 2, lisensi ISC/MIT.
  4. **[Lottie/dotLottie]** ilustrasi hero diganti animasi Lottie (anak berjalan ke sekolah). Butuh aset baru dan menambah ~60 KB.
  5. **[Rive]** maskot interaktif yang melambai atau mengikuti kursor. Butuh aset Rive dan ~150 KB WASM.
  6. **[react-type-animation]** teks mengetik "Domisili… Afirmasi… Prestasi…". Bisa mengganggu pembaca layar, perlu `aria-label` statis.
- Fallback reduced-motion: semua langsung tampil, Lottie/Rive di frame diam.
- Biaya performa: rendah (1), sedang (2,3,6), tinggi (4,5)
- Prioritas: disarankan
- Status: usulan

#### B-02 — Kartu jalur (Domisili, Afirmasi, Mutasi, Prestasi)
- Opsi:
  1. **[Motion]** reveal berurutan + hover naik 4px, squiggle bergeser. **(R)**
  2. **[GSAP DrawSVG]** squiggle di tiap kartu tergambar saat masuk layar. Cocok karena aset squiggle sudah berupa SVG (`public/assets/landing-squiggle-*.svg`), tetapi SVG harus di-inline agar bisa dianimasikan.
  3. **[Embla]** di HP kartu menjadi carousel geser. Mengurangi panjang halaman, tapi kartu yang tersembunyi mudah terlewat.
  4. **[react-parallax-tilt]** miring 3D saat hover (desktop).
- Fallback reduced-motion: statis.
- Biaya performa: rendah-sedang
- Prioritas: opsional
- Status: usulan

#### B-03 — Langkah "Cara kerja"
- Opsi:
  1. **[Motion]** nomor muncul 1-2-3, garis penghubung `scaleX`. **(R)**
  2. **[GSAP ScrollTrigger scrub]** garis bergerak mengikuti posisi scroll, langkah menyala satu per satu.
  3. **[GSAP ScrollTrigger pin]** section dipaku dan langkah berganti saat scroll. Paling "wah", tapi membajak scroll dan sering membingungkan di HP. Tidak saya sarankan.
  4. **[Lottie]** satu animasi pendek per langkah.
- Fallback reduced-motion: langsung tampil.
- Biaya performa: rendah (1), sedang (2-4)
- Prioritas: opsional
- Status: usulan

#### B-04 — Angka data SPMB di beranda
- Lokasi: `landing-data`
- Opsi:
  1. **[NumberFlow]** angka bergeser masuk saat terlihat. **(R)**
  2. **[react-countup]** hitung naik dari 0.
  3. **[Motion]** `useSpring` + `useTransform` untuk angka.
  4. Statis.
- Fallback reduced-motion: langsung nilai akhir.
- Biaya performa: rendah
- Prioritas: opsional
- Status: usulan

#### B-05 — Latar dan dekorasi beranda
- Opsi:
  1. **Statis.** **(R)**
  2. **CSS** glyph (`landing-glyph-*.svg`) melayang pelan 6-8 detik loop, berhenti saat tab tidak aktif.
  3. **[tsParticles]** partikel lembut di latar hero.
  4. **[OGL / three.js]** gradien bergerak WebGL atau peta Depok 3D.
- Catatan: loop terus-menerus wajib bisa dihentikan (WCAG 2.2.2) dan memakan baterai HP.
- Fallback reduced-motion: statis.
- Biaya performa: rendah (2), tinggi (3,4)
- Prioritas: opsional
- Status: usulan

### C. Cek Cepat dan Isi Data

#### C-01 — Validasi NISN dan bidang form
- Lokasi: `/cek-cepat`, `/isi-data/*`, `/masuk-petugas`
- Opsi:
  1. **[Motion]** pesan error masuk (fade + 4px), centang valid `scale` 0.6 ke 1 dengan `AnimatePresence`. **(R)**
  2. **CSS** transition pada pesan dan ikon.
  3. **[Lottie]** centang animasi kecil.
- Fallback reduced-motion: muncul tanpa gerak.
- Biaya performa: rendah
- Prioritas: **wajib**
- Status: usulan

#### C-02 — Tombol loading saat menghitung peluang
- Kebutuhan UX: `POST /api/peluang` butuh waktu. Cegah tekan dua kali, kurangi cemas.
- Opsi:
  1. **CSS** spinner + teks "Menghitung…", skeleton kartu hasil bila lebih dari 800ms. **(R)**
  2. **[Motion]** tombol berubah bentuk (`layout`) dari teks ke spinner.
  3. **[Lottie]** animasi pencarian sekolah selama menunggu.
  4. **[React View Transitions]** skeleton `Suspense` berubah halus ke isi nyata.
- Fallback reduced-motion: teks "Menghitung…" tanpa rotasi.
- Biaya performa: rendah
- Prioritas: **wajib**
- Status: usulan

#### C-03 — Kemunculan hasil peluang
- Lokasi: hasil di `/cek-cepat`, `SchoolResultCard` di `/peta-sekolah`
- Kebutuhan UX: momen utama. Hasil dibaca satu per satu, pengguna diarahkan ke hasil.
- Opsi:
  1. **[Motion]** kartu stagger 80ms (maksimal 6 pertama), badge "pop" kecil, scroll ke hasil, fokus ke judul hasil. **(R)**
  2. **[AutoAnimate]** daftar hasil masuk otomatis, kurang kontrol urutan.
  3. **[GSAP]** timeline: ringkasan, lalu kartu, lalu badge.
  4. **[Rive/Lottie]** maskot bereaksi sesuai hasil (senang untuk Tinggi, menyemangati untuk Rendah). Berisiko terasa menghakimi pada hasil Rendah.
  5. **[canvas-confetti]** konfeti bila ada peluang Tinggi. **Tidak saya sarankan:** perkiraan bisa dibaca sebagai jaminan, dan anak lain dengan hasil Rendah tidak mendapat apa-apa.
- Fallback reduced-motion: semua langsung tampil, scroll instan, fokus tetap dipindah.
- Biaya performa: rendah (1-3), tinggi (4)
- Prioritas: **wajib**
- Status: usulan

#### C-04 — Stepper wizard dan perpindahan langkah
- Lokasi: `/isi-data/[langkah]`
- Opsi:
  1. **[React View Transitions]** `addTransitionType("maju" | "mundur")` lalu konten geser kiri/kanan. Cocok karena tiap langkah adalah route. **(R)**
  2. **[Motion]** `AnimatePresence` dengan `custom={arah}` di layout wizard.
  3. **[Motion]** `layoutId` pada penanda langkah aktif yang meluncur di stepper.
  4. **CSS** fade saja.
- Fallback reduced-motion: ganti langsung.
- Biaya performa: rendah
- Prioritas: disarankan
- Status: usulan

#### C-05 — Simpan draf (`/cek-cepat/simpan`)
- Opsi:
  1. **[Sonner]** toast "Draf tersimpan". **(R)**
  2. **[Motion]** ikon disket berubah jadi centang.
- Fallback reduced-motion: toast tanpa gerak.
- Prioritas: disarankan
- Status: usulan

### D. Halaman hasil dan strategi

#### D-01 — Bar rentang skor dan probabilitas
- Lokasi: `/strategi` (`strategy-hero`), detail sekolah, hasil cek cepat
- Opsi:
  1. **[Motion]** bar `scaleX` dari kiri sekali saat terlihat, penanda skor anak turun ke posisinya. Angka persentase langsung tampil. **(R)**
  2. **[NumberFlow]** persentase bergeser masuk. Hanya sekali saat pertama tampil, tidak saat filter.
  3. **[GSAP]** bar dan penanda dalam satu timeline.
  4. **[react-countup]** persentase menghitung naik. **Tidak saya sarankan:** angka yang berputar naik terlihat seperti diundi.
- Fallback reduced-motion: langsung penuh.
- Biaya performa: rendah
- Prioritas: disarankan
- Status: usulan

#### D-02 — Urutan pilihan sekolah dan reorder
- Lokasi: `/strategi` (`RankList`)
- Opsi:
  1. **[Motion `Reorder`]** item bisa diseret, item lain bergeser halus. Ditambah tombol naik/turun untuk keyboard. **(R)**
  2. **[dnd-kit]** drag paling aksesibel (keyboard, pembaca layar sudah ditangani), animasi pergeseran bawaan.
  3. **[@formkit/drag-and-drop]** lebih ringan, fitur aksesibilitas lebih sedikit.
  4. **[AutoAnimate]** hanya tombol naik/turun, perpindahan dianimasikan otomatis.
  5. Sorot item yang baru berpindah 600ms (dipakai bersama opsi mana pun).
- Fallback reduced-motion: pindah langsung, sorotan tetap ada.
- Biaya performa: sedang
- Prioritas: opsional (tergantung apakah reorder memang fitur)
- Status: usulan

#### D-03 — Peta sekolah
- Lokasi: `/peta-sekolah` (`MapSchools`, Leaflet)
- Opsi:
  1. **[Leaflet bawaan]** `flyTo` ke sekolah terpilih 0.6s, pin terpilih `scale(1.2)` lewat CSS. **(R)**, tanpa library baru.
  2. **[Motion]** pin sebagai komponen React (`react-leaflet` + Motion) dengan animasi masuk berurutan.
  3. **[Vaul]** di HP, daftar hasil menjadi bottom sheet di atas peta yang bisa ditarik naik/turun (pola Google Maps).
  4. **CSS** pin berdenyut terus-menerus. **Tidak saya sarankan:** mengganggu dan menguras baterai.
- Fallback reduced-motion: `setView` tanpa animasi.
- Biaya performa: sedang
- Prioritas: opsional (opsi 3 layak dipertimbangkan untuk HP)
- Status: usulan

#### D-04 — Filter dan urutan hasil
- Lokasi: `Toolbar`/`Select` di `/peta-sekolah`
- Opsi:
  1. **[Motion `layout`]** kartu bergeser ke posisi baru saat urutan berubah. **(R)**
  2. **[AutoAnimate]** satu baris pada wadah daftar.
  3. **[React View Transitions]** crossfade daftar.
- Fallback reduced-motion: langsung.
- Prioritas: disarankan
- Status: usulan

#### D-05 — Kartu ke detail sekolah
- Lokasi: `SchoolResultCard` ke `/detail-sekolah/[id]`
- Opsi:
  1. **[React View Transitions]** nama dan foto sekolah "berpindah" dari kartu ke header detail (shared element). **(R)**
  2. **[Motion `layoutId`]** hanya bekerja dalam satu halaman, jadi butuh detail sebagai dialog/intercepting route.
  3. Fade biasa (A-03).
- Fallback reduced-motion: tanpa morph.
- Biaya performa: rendah
- Prioritas: disarankan
- Status: usulan

#### D-06 — Galeri foto sekolah di detail
- Opsi:
  1. **[Embla]** carousel geser untuk foto Google. **(R)** bila ada lebih dari 3 foto.
  2. **CSS** `scroll-snap` tanpa library.
- Prioritas: opsional
- Status: usulan

### E. Akun orang tua

#### E-01 — Daftar anak, cadangan, unduhan
- Lokasi: `/anak-saya`, `/cadangan`, `/unduhan`
- Opsi:
  1. **[AutoAnimate]** tambah/hapus anak otomatis beranimasi. **(R)**, paling sedikit kode.
  2. **[Motion]** `AnimatePresence` item keluar dengan fade + tinggi mengecil.
  3. **CSS** fade lalu hapus.
- Ditambah toast konfirmasi (A-04) dan dialog konfirmasi (A-05).
- Fallback reduced-motion: langsung hilang, toast tetap muncul.
- Prioritas: disarankan
- Status: usulan

#### E-02 — Unduh dokumen
- Opsi:
  1. **[Motion]** ikon unduh berubah menjadi centang setelah selesai. **(R)**
  2. **[Lottie]** animasi dokumen terbang ke folder.
- Prioritas: opsional
- Status: usulan

### F. Halaman publik

#### F-01 — Tanya Jawab dan Panduan
- Accordion memakai A-06. Panduan bisa ditambah tur (A-08).
- Opsi tambahan: **[Motion]** daftar isi menyorot bagian yang sedang dibaca (scroll spy).
- Prioritas: disarankan (accordion), opsional (scroll spy)
- Status: usulan

#### F-02 — Masuk dan masuk petugas
- Opsi:
  1. Hanya fokus dan error (C-01). **(R)**
  2. **[Motion]** kartu masuk fade-in saat halaman dibuka.
- Prioritas: disarankan
- Status: usulan

#### F-03 — Not found dan akses ditolak
- Opsi:
  1. Statis. **(R)**
  2. **[Lottie]** ilustrasi `art-lost.svg` dibuat bergerak pelan, sekali jalan.
- Prioritas: opsional
- Status: usulan

### G. Dashboard

#### G-01 — Statistik dashboard kebijakan
- Lokasi: `/kebijakan-ringkasan`, `kebijakan-rasio`, `kebijakan-blank-spot`, `kebijakan-pendaftar`
- Opsi:
  1. **[NumberFlow]** angka bergeser saat pertama tampil dan saat filter berganti (hanya digit yang berubah). **(R)**
  2. **[react-countup]** hitung naik dari 0 sekali.
  3. **[Motion]** `useSpring` untuk angka.
  4. Statis.
- Nilai akhir selalu ada di DOM untuk pembaca layar.
- Fallback reduced-motion: langsung nilai akhir.
- Prioritas: opsional
- Status: usulan

#### G-02 — Grafik dashboard
- Opsi:
  1. **[Recharts bawaan]** animasi masuk sekali saat mount, `isAnimationActive={false}` saat data filter berubah. **(R)**, tanpa library baru.
  2. **[Motion]** pembungkus grafik fade saat filter.
  3. Ganti ke **[visx + Motion]** atau **[Nivo]** (keduanya MIT) bila butuh animasi transisi data lebih halus. Biaya migrasi besar, tidak saya sarankan sekarang.
- Fallback reduced-motion: `isAnimationActive={false}` di semua grafik.
- Prioritas: opsional
- Status: usulan

#### G-03 — Peta blank spot
- Lokasi: `/kebijakan-blank-spot`
- Opsi:
  1. **CSS** fade warna area kecamatan saat tahun/filter berganti. **(R)**
  2. **[three.js / React Three Fiber]** peta kecamatan 3D dengan tinggi = kekurangan kursi. Menarik untuk presentasi lomba, berat dan sulit dibaca akurat.
- Prioritas: opsional
- Status: usulan

#### G-04 — Admin: impor, simpan, aturan
- Opsi:
  1. **[Sonner]** toast simpan, progres impor determinate dengan `scaleX`, border area unggah menyala saat file diseret. **(R)**
  2. **[Motion]** langkah impor (parse, validasi, kirim) muncul berurutan dengan centang.
- Fallback reduced-motion: bar progres tetap bergerak (informasi, bukan hiasan).
- Prioritas: disarankan
- Status: usulan

---

## 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih)

| Ide | Library | Alasan |
|---|---|---|
| Konfeti saat peluang Tinggi | canvas-confetti | Hasil adalah perkiraan. Perayaan memberi kesan jaminan dan tidak adil bagi hasil Rendah. |
| Persentase menghitung naik | react-countup | Terlihat seperti angka diundi. Gunakan NumberFlow atau tampil langsung. |
| Section dipaku saat scroll | GSAP ScrollTrigger pin | Membajak scroll, membingungkan di HP. |
| Smooth scroll seluruh situs | Lenis / ScrollSmoother | Terasa licin bagi pengguna awam, bentrok dengan peta Leaflet dan form. |
| Partikel/WebGL di latar | tsParticles, OGL, three.js | Berat di HP murah, tidak membantu tugas. |
| Pin peta berdenyut | CSS | Gerak terus-menerus mengalihkan perhatian. |
| Animasi di teks privasi, disclaimer, `/privasi` | apa pun | Teks hukum harus langsung bisa dibaca. |
| Efek mengetik di hero | react-type-animation | Menunda pesan utama, menyulitkan pembaca layar. |

---

## 6. Urutan pengerjaan (jika S2 disetujui)

1. **Fondasi:** pasang `motion`, `@number-flow/react`, `sonner`. Buat `MotionProvider` dengan `LazyMotion` + `MotionConfig reducedMotion="user"` di layout. Tambah token `--duration-reveal: 500ms`.
2. **Umpan balik inti:** A-01, A-04, C-01, C-02.
3. **Momen hasil:** C-03, D-01, D-04.
4. **Transisi:** A-03, A-05, A-06, C-04, D-05, E-01.
5. **Beranda dan dashboard:** B-01 s.d. B-04, G-01, G-02, G-04.
6. **Opsional:** A-07, A-08, B-05, D-02, D-03, D-06, E-02, F-03, G-03.

Setiap langkah diverifikasi: tidak ada CLS baru, reduced-motion benar-benar mematikan animasi JS, bundle per halaman dicek dengan `next build`.

## 7. Cara memberi keputusan

1. Pilih paket: `S1` / `S2` / `S3` / `S4` / `S5`, atau campuran sendiri.
2. Per item, tulis keputusan dan nomor opsi. Contoh: `A-01 approve opsi 1`, `B-01 approve opsi 2`, `C-03 tolak opsi 5`, `D-02 ubah: pakai dnd-kit`.
3. Item yang tidak disebut dianggap memakai opsi rekomendasi **(R)**.

## 8. Pertanyaan terbuka

1. Apakah asumsi persona benar (orang tua, banyak lewat HP)? Benar Kalau ada `persona/persona.md`, saya sesuaikan.
2. Apakah urutan pilihan di `/strategi` bisa diubah pengguna? Ini menentukan D-02.
3. Kalau memilih Lottie/Rive, siapa yang menyediakan aset animasi, dan apakah boleh membeli/mengambil dari LottieFiles? Gunakan yang free dahulu. Lisensi aset perlu dicatat.
4. Apakah penilaian lomba lebih menekankan kesan visual (condong ke S4) atau kegunaan (condong ke S2)? Keduanya sama bernilai

---

## 9. Status implementasi (2026-10-30)

Paket: S2 tanpa Sonner. Library terpasang: `motion` 14.9 (MIT), `@number-flow/react` 0.6 (MIT). React View Transitions bawaan React 19.3.

| Item | Status | Cara | File utama |
|---|---|---|---|
| A-01 | selesai | CSS `scale` saat ditekan, hover dimatikan saat kurangi gerak | `button.css` |
| A-02 | selesai | Motion `inView` + `animate` lewat atribut `data-reveal` / `data-reveal-group`, tanpa mengubah DOM | `motion/RevealObserver.tsx` |
| A-03 | selesai | `<ViewTransition>` di `template.tsx` tiap route group, isi memudar | `motion/PageTransition.tsx`, `motion.css` |
| A-04 | selesai, **diubah** | Toast buatan sendiri tetap dipakai, dianimasikan Motion `AnimatePresence`. Sonner tidak dipasang karena akan mengganti API `useToast` dan tampilan | `Toast.tsx` |
| A-05 | selesai, **diubah** | Dialog memakai CSS `@starting-style` + `allow-discrete`, karena Motion tidak cocok dengan `<dialog>` native. Menu dan menu HP turun pelan | `dialog.css`, `navbar.css` |
| A-06 | selesai, **diubah** | Accordion memakai CSS `::details-content` (Chromium 131+, browser lain langsung terbuka) karena komponennya `<details>` native. Tabs memakai Motion `layoutId` | `accordion.css`, `Tabs.tsx`, `tabs.css` |
| A-07 | tidak dipakai | sesuai (R) | - |
| A-08 | ditunda | fitur baru (tur), perlu keputusan | - |
| B-01 | selesai | CSS: ilustrasi hero naik berurutan, judul dan tombol tidak ditunda | `landing.css` |
| B-02 | selesai | reveal berurutan + hover naik 4px, coretan bergeser | `landing.css` |
| B-03 | selesai | garis timeline tergambar (`draw-y`), langkah muncul berurutan | `LandingPage.tsx` |
| B-04 | selesai | NumberFlow, dari 0 saat pertama terlihat | `stats/AnimatedNumber.tsx` |
| B-05 | statis | sesuai (R) | - |
| C-01 | selesai | pesan error turun pelan. Tanda centang valid tidak dibuat (fitur baru) | `field.css` |
| C-02 | tidak relevan | Cek Cepat menghitung di browser secara langsung (`estimate()`), tidak ada waktu tunggu | - |
| C-03 | selesai | kartu hasil muncul berurutan (`data-reveal-live`), label peluang "pop", kartu isian muncul tiap pindah tahap. Fokus ke judul sudah ada | `QuickCheck.tsx`, `school-card.css`, `quick.css` |
| C-04 | selesai, **diubah** | geser maju/mundur lewat `<html data-nav-dir>`, karena `transitionTypes` tidak sampai ke React. Simpan langkah dibungkus `startTransition`, `router.refresh()` ditunda 700ms karena membatalkan animasi | `PageTransition.tsx`, `NavDirection.tsx`, `WizardForm.tsx`, `stepper.css` |
| C-05 | sudah ada | toast yang ada ikut beranimasi (A-04) | - |
| D-01 | selesai | bar terisi `scale-x` saat dibuka, angka diam | `pages.css` |
| D-02 | selesai, **sebagian** | Motion `layout` saat tukar posisi + sorotan 600ms. Drag tidak dibuat (fitur baru, bentrok dengan scroll HP) | `RankList.tsx`, `pages.css` |
| D-03 | ditunda | peta belum punya fitur pilih sekolah | - |
| D-04 | ditunda | filter di `/peta-sekolah` belum berfungsi (hanya tampilan) | - |
| D-05 | **dibatalkan** | sudah dicoba, nama sekolah tidak berpindah karena isi halaman detail dialirkan di balik `<Suspense>`, jadi tidak ada di commit yang sama. Kode dihapus | - |
| D-06 | ditunda | foto sekolah belum lebih dari 1 | - |
| E-01 | sebagian | daftar anak dirender server, tidak ada hapus di sisi client. Toast dan dialog beranimasi | - |
| E-02, F-03 | statis | sesuai (R) | - |
| F-01 | selesai | accordion (A-06). Scroll spy tidak dibuat | - |
| F-02 | selesai | fokus dan error (C-01) | - |
| G-01 | selesai | NumberFlow di `Stats` (dashboard dan detail sekolah) | `Stats.tsx` |
| G-02 | tidak relevan | Recharts belum dipakai di halaman mana pun | - |
| G-03 | ditunda | peta blank spot belum berubah warna saat filter | - |
| G-04 | sebagian | area unggah menyala saat file diseret. Bar progres impor belum ada di UI | `Upload.tsx`, `upload.css` |

Token baru: `--duration-reveal` (500ms), `--stagger` (60ms), `--reveal-distance` (12px). Semua animasi JS memeriksa `prefers-reduced-motion` sendiri.
