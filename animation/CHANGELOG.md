# Changelog Animasi

## 2026-10-30 — Paket S2 diimplementasi

Permintaan: "execute" untuk `animation/PROPOSAL.md`, memakai opsi (R) sebagai bawaan.

- Pasang `motion` 14.9 dan `@number-flow/react` 0.6.
- Tambah `src/components/motion/` (MotionProvider, RevealObserver, PageTransition, NavDirection) dan `src/styles/motion.css`.
- Tambah `template.tsx` di route group `(parent)`, `(public)`, `(quick)`, `(dash)/(admin)`, `(dash)/(kebijakan)`.
- Komponen beranimasi: Button, Toast, Dialog, Menu, navbar HP, Accordion, Tabs, Field, Stepper, SchoolCard, RankList, Stats, Upload, beranda.
- Perilaku yang berubah: `WizardForm` menyimpan dan pindah langkah di dalam `startTransition`, dan `router.refresh()` ditunda 700ms.
- Tab aktif: latar oranye dipindah dari tombol ke `span.tabs__pill`. Tampilan diam sama.
- D-05 (nama sekolah berpindah ke halaman detail) dicoba lalu dibatalkan. Rincian di PROPOSAL.md bagian 9.

## 2026-10-30 — Panduan dan Tanya Jawab

Permintaan: halaman `/panduan` dan `/tanya-jawab` belum terlihat beranimasi. Penyebabnya: reveal melewati elemen yang sudah terlihat saat halaman dibuka, dan accordion hanya bergerak saat diklik.
- `Section` dan `PageHeader` dapat prop `reveal` (muncul pelan, juga bila sudah di layar saat dibuka).
- Panduan: header, tiap seksi, dan kartu di grid muncul berurutan.
- Tanya Jawab: header, chip kategori, dan kartu kelompok muncul berurutan.
