# Graph Report - SiPesek  (2026-10-31)

## Corpus Check
- 173 files · ~52,733 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 32, (none) 5, .example 1)

## Summary
- 981 nodes · 2385 edges · 53 communities (48 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `15955f3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- agregasi.ts
- LandingPage.tsx
- mesin.ts
- components/index.ts
- anak-saya/page.tsx
- db.ts
- Shell.tsx
- [langkah]/page.tsx
- Pembagian Tugas SiPesek
- kontrak.ts
- auth.ts
- [id]/page.tsx
- package.json
- react
- Badge
- galat
- Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)
- quick-check.ts
- A. Global
- kebijakan-rasio/page.tsx
- accounts.ts
- Navbar.tsx
- compilerOptions
- dependencies
- devDependencies
- next
- scripts
- 4. Item animasi, lengkap dengan opsi
- HomePicker.tsx
- anak/route.ts
- Toast.tsx
- QuickCheck.tsx
- QuickCheck
- onBlur
- styles/index.ts
- Map.tsx
- Footer.tsx
- Button
- validasi.ts
- peluang/route.ts
- getSession
- C. Cek Cepat dan Isi Data
- MasukPetugas.tsx
- SaveDraft.tsx
- eslint.config.mjs
- next.config.ts
- B. Beranda (`/`)
- AGENTS.md
- D. Halaman hasil dan strategi
- G. Dashboard
- NAMA_COOKIE_ORTU
- state.md

## God Nodes (most connected - your core abstractions)
1. `next` - 68 edges
2. `react` - 54 edges
3. `Button()` - 38 edges
4. `galat()` - 31 edges
5. `Icon()` - 28 edges
6. `PageHeader()` - 27 edges
7. `getSession()` - 26 edges
8. `Alert()` - 24 edges
9. `Badge()` - 19 edges
10. `Select()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `A-04 — Toast dan alert` --references--> `Alert()`  [INFERRED]
  animation/PROPOSAL.md → src/components/alert/Alert.tsx
- `A-01 — Umpan balik tombol, tautan, kartu` --references--> `Button()`  [INFERRED]
  animation/PROPOSAL.md → src/components/button/Button.tsx
- ``/admin/*` (Zaki)` --references--> `agregasi()`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/etl/agregasi.ts
- ``/cek` Formulir 3 langkah (Aqil)` --references--> `galat()`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/http.ts
- ``/hasil/[token]` (Aqil)` --references--> `ResponsPeluang`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/kontrak.ts

## Import Cycles
- None detected.

## Communities (53 total, 5 thin omitted)

### Community 0 - "agregasi.ts"
Cohesion: 0.07
Nodes (42): cheerio, dotenv, ref_node_fs, ref_node_path, ref_node_url, papaparse, vitest, ambilHtml() (+34 more)

### Community 1 - "LandingPage.tsx"
Cohesion: 0.10
Nodes (12): @number-flow/react, FAQS, LandingCta, LandingPage(), PATH_STYLE, PATHS, STRATEGY_STEPS, VALUES (+4 more)

### Community 2 - "mesin.ts"
Cohesion: 0.07
Nodes (49): BarisSekolah, csv(), kunciNama(), main(), seedAdmin(), seedAturan(), seedDayaTampung(), seedJalur() (+41 more)

### Community 3 - "components/index.ts"
Cohesion: 0.10
Nodes (23): A-06 — Accordion dan Tabs, metadata, metadata, metadata, metadata, metadata, metadata, Accordion() (+15 more)

### Community 4 - "anak-saya/page.tsx"
Cohesion: 0.17
Nodes (21): AnakSayaPage(), ChildCard(), metadata, AccountKey, buildSession(), Child, continueTarget(), isComplete() (+13 more)

### Community 5 - "db.ts"
Cohesion: 0.21
Nodes (16): GET(), DELETE(), DELETE(), GET(), GET(), GET(), src_generated_prisma_client_prismaclient, tolakTanpaSesiOrtu() (+8 more)

### Community 6 - "Shell.tsx"
Cohesion: 0.13
Nodes (11): DashChrome(), KELUAR_WIZARD, QuickChrome(), SiteChrome(), stagesFor(), DashMenu, Sidebar(), ADMIN (+3 more)

### Community 7 - "[langkah]/page.tsx"
Cohesion: 0.06
Nodes (31): 2026-10-30 — Paket S2 diimplementasi, Changelog Animasi, WizardLayout(), generateMetadata(), IsiLangkah(), LOCKED_LABEL, Props, NavDirection() (+23 more)

### Community 8 - "Pembagian Tugas SiPesek"
Cohesion: 0.06
Nodes (29): Alur kerja harian, Aturan per area, Branch backend, Branch frontend, Branch sementara, Branch utama, Panduan Branch SiPesek, Yang tidak boleh di-commit (+21 more)

### Community 9 - "kontrak.ts"
Cohesion: 0.10
Nodes (25): GET(), GET(), muatDashboard(), persen(), tahunAktif(), tahunDiminta(), AnakRingkas, KECAMATAN_DEPOK (+17 more)

### Community 10 - "auth.ts"
Cohesion: 0.12
Nodes (24): jose, server-only, bacaProfilOrtu(), buatToken(), buatTokenOrtu(), buatTokenSesi(), kunci(), NAMA_COOKIE (+16 more)

### Community 11 - "[id]/page.tsx"
Cohesion: 0.13
Nodes (10): metadata, Props, metadata, Breadcrumb(), src_data_schools, src_data_schools_getschool, src_data_schools_private_schools, src_data_schools_school (+2 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, version, bcryptjs, leaflet, pg, prisma, @prisma/adapter-pg (+15 more)

### Community 13 - "react"
Cohesion: 0.11
Nodes (22): react, Item, Choice(), ChoiceGroup(), ChoiceProps, GroupProps, ariaInvalid(), Field() (+14 more)

### Community 14 - "Badge"
Cohesion: 0.22
Nodes (6): metadata, Badge(), STATUS, Item, Props, SchoolCard()

### Community 15 - "galat"
Cohesion: 0.22
Nodes (20): zod, GET(), PUT(), skemaUbah, tahunDariParams(), PUT(), skema, POST() (+12 more)

### Community 16 - "Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)"
Cohesion: 0.17
Nodes (11): 1. Katalog library yang boleh dipakai komersial, 1a. Mesin animasi umum, 1b. Library khusus, 1c. Ditolak atau perlu hati-hati karena lisensi, 2. Paket stack yang bisa dipilih, 3. Ringkasan per halaman, 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih), 7. Cara memberi keputusan (+3 more)

### Community 17 - "quick-check.ts"
Cohesion: 0.12
Nodes (19): src_data_geo_distancekm, src_data_geo_isvalidpoint, src_data_geo_kec_point, src_data_schools_kind, src_data_schools_school_rules, average(), Candidate, estimate() (+11 more)

### Community 18 - "A. Global"
Cohesion: 0.22
Nodes (9): A-01 — Umpan balik tombol, tautan, kartu, A-02 — Reveal saat scroll, A-03 — Transisi antar halaman, A-04 — Toast dan alert, A-05 — Dialog, menu mobile, bottom sheet, A-07 — Smooth scroll (baru), A-08 — Tur panduan pertama kali (baru), A. Global (+1 more)

### Community 19 - "kebijakan-rasio/page.tsx"
Cohesion: 0.12
Nodes (19): D-04 — Filter dan urutan hasil, metadata, metadata, metadata, metadata, ZONE_KIND, metadata, Select() (+11 more)

### Community 20 - "accounts.ts"
Cohesion: 0.13
Nodes (19): AksesDitolakPage(), AREA, CariParams, Keterangan(), metadata, AccountSeed, COOKIE, isAccount() (+11 more)

### Community 21 - "Navbar.tsx"
Cohesion: 0.13
Nodes (13): BottomNav(), ChildMenu(), DashBar(), firstName(), FocusBar(), Navbar(), NavbarProps, NavChild (+5 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 23 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcryptjs, dotenv, jose, leaflet, motion, nanoid, next (+11 more)

### Community 24 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, cheerio, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/turbopack, tsx (+9 more)

### Community 25 - "next"
Cohesion: 0.12
Nodes (11): next, metadata, metadata, TOY_COLOR_MAP, Card(), Props, Pagination(), Tab (+3 more)

### Community 26 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, data:ekspor, data:impor, data:kirim, data:sekolah, db:migrate, db:seed (+7 more)

### Community 27 - "4. Item animasi, lengkap dengan opsi"
Cohesion: 0.25
Nodes (8): 4. Item animasi, lengkap dengan opsi, E-01 — Daftar anak, cadangan, unduhan, E-02 — Unduh dokumen, E. Akun orang tua, F-01 — Tanya Jawab dan Panduan, F-02 — Masuk dan masuk petugas, F-03 — Not found dan akses ditolak, F. Halaman publik

### Community 28 - "HomePicker.tsx"
Cohesion: 0.14
Nodes (11): src_data_geo, src_data_geo_bounds, src_data_geo_frompercent, src_data_geo_geopoint, src_data_geo_inbounds, src_data_geo_map_aspect, src_data_geo_nearestkecamatan, src_data_geo_school_point (+3 more)

### Community 29 - "anak/route.ts"
Cohesion: 0.23
Nodes (10): ref_node_crypto, pesanNisnTerpakai(), POST(), src_generated_prisma_client, src_generated_prisma_client_prisma, ResponsImpor, HasilPeriksaNisn, periksaNisn() (+2 more)

### Community 30 - "Toast.tsx"
Cohesion: 0.11
Nodes (18): 6. Urutan pengerjaan (jika S2 disetujui), motion, metadata, Sprite(), loadFeatures(), MotionProvider(), HIDDEN, Kind (+10 more)

### Community 31 - "QuickCheck.tsx"
Cohesion: 0.17
Nodes (10): src_data_kecamatan_kec_names, EMPTY, Phase, PHASE_NO, PHASE_TITLE, Props, PRESTASI, QuickCheckInput (+2 more)

### Community 32 - "QuickCheck"
Cohesion: 0.29
Nodes (9): setDraft(), dateText(), QuickCheck(), save(), submitIsian(), submitNisn(), isValidNisn(), parseNumber() (+1 more)

### Community 33 - "onBlur"
Cohesion: 0.60
Nodes (6): onBlur(), onChange(), onSubmit(), isControl(), keyOf(), messageFor()

### Community 34 - "styles/index.ts"
Cohesion: 0.11
Nodes (14): metadata, Alert(), ICON, src_components_bottom_nav_bottom_nav, src_components_landing_landing, src_components_link_link, src_components_school_card_school_card, src_components_section_heading_section_heading (+6 more)

### Community 35 - "Map.tsx"
Cohesion: 0.21
Nodes (11): D-03 — Peta sekolah, LABEL, MapLegend(), MapSchools(), MapZones(), Pin, PIN_ICON, pos() (+3 more)

### Community 36 - "Footer.tsx"
Cohesion: 0.32
Nodes (6): Brand(), Column, Footer(), JALUR, LAYANAN, panduan()

### Community 37 - "Button"
Cohesion: 0.12
Nodes (18): 9. Status implementasi (2026-10-30), metadata, metadata, Button(), handleClick(), Props, Dialog(), Form() (+10 more)

### Community 38 - "validasi.ts"
Cohesion: 0.25
Nodes (7): angkaAtauNull, Aturan, bobotMapel, nilai100, skemaAturan, skemaPermintaanPeluang, skemaTambahAnak

### Community 39 - "peluang/route.ts"
Cohesion: 0.23
Nodes (9): nanoid, BATAS_TAMU_PER_JAM, cekTersimpan(), pembatasTamu, POST(), ipKlien(), PembatasJendela, BATAS_CEK_PER_HARI (+1 more)

### Community 40 - "getSession"
Cohesion: 0.16
Nodes (14): IndexPage(), metadata, PetaSekolahPage(), StrategiPage(), UnduhanPage(), CekCepatPage(), metadata, continueFor() (+6 more)

### Community 41 - "C. Cek Cepat dan Isi Data"
Cohesion: 0.25
Nodes (8): C-01 — Validasi NISN dan bidang form, C-02 — Tombol loading saat menghitung peluang, C-03 — Kemunculan hasil peluang, C-04 — Stepper wizard dan perpindahan langkah, C-05 — Simpan draf (`/cek-cepat/simpan`), C. Cek Cepat dan Isi Data, D-05 — Kartu ke detail sekolah, SchoolResultCard()

### Community 42 - "MasukPetugas.tsx"
Cohesion: 0.31
Nodes (9): MasukPetugas(), tujuan(), MasukDemo(), MasukGoogle(), pasangTombol(), setelahGoogle(), tujuan(), ACCOUNTS (+1 more)

### Community 43 - "SaveDraft.tsx"
Cohesion: 0.30
Nodes (8): metadata, clearDraft(), getDraft(), SaveDraft(), submit(), importQuickCheck(), draftToWizard(), QuickDraft

### Community 44 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 46 - "B. Beranda (`/`)"
Cohesion: 0.33
Nodes (6): B-01 — Hero masuk, B-02 — Kartu jalur (Domisili, Afirmasi, Mutasi, Prestasi), B-03 — Langkah "Cara kerja", B-04 — Angka data SPMB di beranda, B-05 — Latar dan dekorasi beranda, B. Beranda (`/`)

### Community 49 - "D. Halaman hasil dan strategi"
Cohesion: 0.33
Nodes (5): D-01 — Bar rentang skor dan probabilitas, D-02 — Urutan pilihan sekolah dan reorder, D-06 — Galeri foto sekolah di detail, D. Halaman hasil dan strategi, RankList()

### Community 50 - "G. Dashboard"
Cohesion: 0.40
Nodes (5): G-01 — Statistik dashboard kebijakan, G-02 — Grafik dashboard, G-03 — Peta blank spot, G-04 — Admin: impor, simpan, aturan, G. Dashboard

## Knowledge Gaps
- **300 isolated node(s):** `eslintConfig`, `backend`, `nextConfig`, `name`, `version` (+295 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 407 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `components/index.ts`, `anak-saya/page.tsx`, `db.ts`, `Shell.tsx`, `[langkah]/page.tsx`, `kontrak.ts`, `auth.ts`, `[id]/page.tsx`, `package.json`, `react`, `Badge`, `galat`, `kebijakan-rasio/page.tsx`, `accounts.ts`, `Navbar.tsx`, `anak/route.ts`, `Toast.tsx`, `QuickCheck.tsx`, `styles/index.ts`, `Footer.tsx`, `Button`, `peluang/route.ts`, `getSession`, `SaveDraft.tsx`, `next.config.ts`, `NAMA_COOKIE_ORTU`?**
  _High betweenness centrality (0.385) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `LandingPage.tsx`, `components/index.ts`, `Shell.tsx`, `[langkah]/page.tsx`, `[id]/page.tsx`, `package.json`, `Badge`, `kebijakan-rasio/page.tsx`, `accounts.ts`, `Navbar.tsx`, `next`, `HomePicker.tsx`, `Toast.tsx`, `QuickCheck.tsx`, `styles/index.ts`, `Map.tsx`, `Button`, `getSession`, `SaveDraft.tsx`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `galat()` (e.g. with ``/cek` Formulir 3 langkah (Aqil)` and `Masuk dengan Google dan data anak (Aqil)`) actually correct?**
  _`galat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `backend`, `nextConfig` to the rest of the system?**
  _300 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `agregasi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `LandingPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09782608695652174 - nodes in this community are weakly interconnected._
- **Should `mesin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06516290726817042 - nodes in this community are weakly interconnected._