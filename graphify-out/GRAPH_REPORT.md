# Graph Report - SiPesek  (2026-10-31)

## Corpus Check
- 180 files · ~57,227 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 32, (none) 5, .example 1)

## Summary
- 1084 nodes · 2607 edges · 100 communities (47 shown, 53 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5358706b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed.ts
- LandingPage.tsx
- mesin.ts
- components/index.ts
- SaveDraft.tsx
- anak/route.ts
- nav.ts
- [langkah]/page.tsx
- Pembagian Tugas SiPesek
- quick-check.ts
- auth.ts
- Button
- package.json
- HasilCepat.tsx
- react
- galat
- Shell.tsx
- A. Global
- MasukGoogle.tsx
- Alert
- getSession
- Navbar.tsx
- compilerOptions
- dependencies
- devDependencies
- src_components_index_badge
- scripts
- db.ts
- HomePicker.tsx
- MasukPetugas.tsx
- Toast.tsx
- Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)
- QuickCheck.tsx
- onBlur
- C. Cek Cepat dan Isi Data
- validasi.ts
- 4. Item animasi, lengkap dengan opsi
- Dialog
- src_components_index_breadcrumb
- peluang/route.ts
- accounts.ts
- src_components_index_buttongroup
- src_components_index_checklist
- src_components_index_button
- eslint.config.mjs
- next.config.ts
- src_components_index_dialog
- AGENTS.md
- next
- Map.tsx
- src_components_index_accordion
- state.md
- src_components_index_choice
- src_components_index_choicegroup
- src_components_index_ctaband
- src_components_index_dashsection
- Footer.tsx
- src_components_index_disclaimer
- src_components_index_field
- src_components_index_form
- src_components_index_helplink
- src_components_index_alert
- src_components_index_icon
- src_components_index_maplegend
- src_components_index_card
- src_components_index_mapschools
- src_components_index_container
- src_components_index_morelink
- src_components_index_nextstep
- src_components_index_pageheader
- src_components_index_ranklist
- src_components_index_section
- src_components_index_sectionheading
- src_components_index_select
- src_components_index_stats
- src_components_index_stepper
- src_components_index_table
- src_components_index_tabs
- src_components_index_toggle
- src_components_index_toolbar
- src_components_index_schoolcard
- B. Beranda (`/`)
- D. Halaman hasil dan strategi
- G. Dashboard
- 1. Katalog library yang boleh dipakai komersial
- src_data_geo
- src_data_geo_bounds
- src_data_geo_distancekm
- src_data_geo_frompercent
- src_data_geo_geopoint
- src_data_geo_inbounds
- src_data_geo_isvalidpoint
- src_data_geo_kec_point
- src_data_geo_map_aspect
- src_data_geo_nearestkecamatan
- src_data_geo_school_point
- src_data_geo_topercent
- src_data_schools_kind
- src_data_schools_school_rules

## God Nodes (most connected - your core abstractions)
1. `next` - 70 edges
2. `react` - 56 edges
3. `Button()` - 40 edges
4. `galat()` - 31 edges
5. `getSession()` - 30 edges
6. `Icon()` - 28 edges
7. `PageHeader()` - 28 edges
8. `Alert()` - 25 edges
9. `Badge()` - 20 edges
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

## Communities (100 total, 53 thin omitted)

### Community 0 - "seed.ts"
Cohesion: 0.05
Nodes (57): BarisSekolah, csv(), kunciNama(), main(), seedAdmin(), seedAturan(), seedDayaTampung(), seedJalur() (+49 more)

### Community 1 - "LandingPage.tsx"
Cohesion: 0.07
Nodes (24): data_statistik_2026, @number-flow/react, LandingCta, PATH_STYLE, PATHS, STRATEGY_STEPS, VALUES, Props (+16 more)

### Community 2 - "mesin.ts"
Cohesion: 0.09
Nodes (37): ATURAN_2026, JALUR, KodeJalur, KodeSubJalur, AlternatifSwasta, Jenjang, PermintaanPeluang, bulat50() (+29 more)

### Community 3 - "components/index.ts"
Cohesion: 0.13
Nodes (16): metadata, metadata, metadata, metadata, Accordion(), Disclaimer(), ExternalLink(), HelpLink() (+8 more)

### Community 4 - "SaveDraft.tsx"
Cohesion: 0.21
Nodes (12): metadata, clearDraft(), getDraft(), SaveDraft(), submit(), parseProgress(), importQuickCheck(), OPTS (+4 more)

### Community 5 - "anak/route.ts"
Cohesion: 0.19
Nodes (19): GET(), DELETE(), DELETE(), GET(), pesanNisnTerpakai(), POST(), GET(), GET() (+11 more)

### Community 6 - "nav.ts"
Cohesion: 0.15
Nodes (10): DashChrome(), FocusChrome(), DashMenu, Sidebar(), ADMIN, DashItem, HELP_URL, NavItem (+2 more)

### Community 7 - "[langkah]/page.tsx"
Cohesion: 0.06
Nodes (28): WizardLayout(), generateMetadata(), IsiLangkah(), LOCKED_LABEL, Props, NavDirection(), PageTransition(), StepTransition() (+20 more)

### Community 8 - "Pembagian Tugas SiPesek"
Cohesion: 0.06
Nodes (29): Alur kerja harian, Aturan per area, Branch backend, Branch frontend, Branch sementara, Branch utama, Panduan Branch SiPesek, Yang tidak boleh di-commit (+21 more)

### Community 9 - "quick-check.ts"
Cohesion: 0.09
Nodes (30): HasilJalur, HasilSekolah, KECAMATAN_DEPOK, KECAMATAN_IRISAN_LUAR, KECAMATAN_LAINNYA, LabelPeluang, NilaiMapel, PembandingStatistik (+22 more)

### Community 10 - "auth.ts"
Cohesion: 0.10
Nodes (26): jose, POST(), bacaProfilOrtu(), buatToken(), buatTokenOrtu(), buatTokenSesi(), kunci(), NAMA_COOKIE (+18 more)

### Community 11 - "Button"
Cohesion: 0.13
Nodes (14): metadata, Props, metadata, Breadcrumb(), Button(), handleClick(), SchoolCard(), src_data_schools (+6 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, version, bcryptjs, pg, @prisma/client, react-dom, recharts (+11 more)

### Community 13 - "HasilCepat.tsx"
Cohesion: 0.19
Nodes (24): BarisSekolah(), DialogBaca(), gabung(), Gauge(), HasilCepat(), KartuHasil(), KartuPilihan(), JENJANG (+16 more)

### Community 14 - "react"
Cohesion: 0.11
Nodes (20): react, ICON, Badge(), STATUS, src_components_bottom_nav_bottom_nav, Props, Icon(), src_components_landing_landing (+12 more)

### Community 15 - "galat"
Cohesion: 0.25
Nodes (18): zod, GET(), PUT(), skemaUbah, tahunDariParams(), PUT(), skema, POST() (+10 more)

### Community 16 - "Shell.tsx"
Cohesion: 0.16
Nodes (11): continueFor(), firstName(), KELUAR_WIZARD, LandingChrome(), publicNav(), QuickChrome(), SiteChrome(), stagesFor() (+3 more)

### Community 17 - "A. Global"
Cohesion: 0.20
Nodes (10): A-01 — Umpan balik tombol, tautan, kartu, A-02 — Reveal saat scroll, A-03 — Transisi antar halaman, A-04 — Toast dan alert, A-05 — Dialog, menu mobile, bottom sheet, A-06 — Accordion dan Tabs, A-07 — Smooth scroll (baru), A-08 — Tur panduan pertama kali (baru) (+2 more)

### Community 18 - "MasukGoogle.tsx"
Cohesion: 0.09
Nodes (25): 9. Status implementasi (2026-10-30), metadata, metadata, Checklist(), Item, Choice(), ChoiceGroup(), ChoiceProps (+17 more)

### Community 19 - "Alert"
Cohesion: 0.10
Nodes (23): D-04 — Filter dan urutan hasil, metadata, metadata, metadata, metadata, metadata, ZONE_KIND, metadata (+15 more)

### Community 20 - "getSession"
Cohesion: 0.09
Nodes (27): 2026-10-30 — Panduan dan Tanya Jawab, IndexPage(), metadata, AnakSayaPage(), PetaSekolahPage(), StrategiPage(), UnduhanPage(), metadata (+19 more)

### Community 21 - "Navbar.tsx"
Cohesion: 0.13
Nodes (14): BottomNav(), ChildMenu(), DashBar(), firstName(), FocusBar(), Navbar(), NavbarProps, NavChild (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 23 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcryptjs, dotenv, jose, leaflet, motion, nanoid, next (+11 more)

### Community 24 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, cheerio, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/turbopack, tsx (+9 more)

### Community 26 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, data:ekspor, data:impor, data:kirim, data:sekolah, db:migrate, db:seed (+7 more)

### Community 27 - "db.ts"
Cohesion: 0.15
Nodes (18): @prisma/adapter-pg, server-only, GET(), GET(), src_generated_prisma_client, src_generated_prisma_client_prisma, src_generated_prisma_client_prismaclient, muatDashboard() (+10 more)

### Community 28 - "HomePicker.tsx"
Cohesion: 0.17
Nodes (12): leaflet, react-leaflet, HomePicker(), locate(), pilih(), PetaRumah, BATAS, SekolahPeta (+4 more)

### Community 29 - "MasukPetugas.tsx"
Cohesion: 0.31
Nodes (9): MasukPetugas(), tujuan(), MasukDemo(), MasukGoogle(), pasangTombol(), setelahGoogle(), tujuan(), ACCOUNTS (+1 more)

### Community 30 - "Toast.tsx"
Cohesion: 0.09
Nodes (21): 2026-10-30 — Paket S2 diimplementasi, 2026-10-31 — Merge origin/main (81c4e5e) ke frontend/animation, 2026-10-31 — Perbaikan hydration mismatch dan pemulihan beranda, Changelog Animasi, 6. Urutan pengerjaan (jika S2 disetujui), motion, metadata, Sprite() (+13 more)

### Community 31 - "Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)"
Cohesion: 0.25
Nodes (7): 2. Paket stack yang bisa dipilih, 3. Ringkasan per halaman, 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih), 7. Cara memberi keputusan, 8. Pertanyaan terbuka, Dasar pertimbangan, Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)

### Community 32 - "QuickCheck.tsx"
Cohesion: 0.14
Nodes (18): setDraft(), angkaAtauNull(), dateText(), EMPTY, Phase, PHASE_NO, PHASE_TITLE, Props (+10 more)

### Community 33 - "onBlur"
Cohesion: 0.60
Nodes (6): onBlur(), onChange(), onSubmit(), isControl(), keyOf(), messageFor()

### Community 34 - "C. Cek Cepat dan Isi Data"
Cohesion: 0.25
Nodes (8): C-01 — Validasi NISN dan bidang form, C-02 — Tombol loading saat menghitung peluang, C-03 — Kemunculan hasil peluang, C-04 — Stepper wizard dan perpindahan langkah, C-05 — Simpan draf (`/cek-cepat/simpan`), C. Cek Cepat dan Isi Data, D-05 — Kartu ke detail sekolah, SchoolResultCard()

### Community 35 - "validasi.ts"
Cohesion: 0.25
Nodes (7): angkaAtauNull, Aturan, bobotMapel, nilai100, skemaAturan, skemaPermintaanPeluang, skemaTambahAnak

### Community 36 - "4. Item animasi, lengkap dengan opsi"
Cohesion: 0.25
Nodes (8): 4. Item animasi, lengkap dengan opsi, E-01 — Daftar anak, cadangan, unduhan, E-02 — Unduh dokumen, E. Akun orang tua, F-01 — Tanya Jawab dan Panduan, F-02 — Masuk dan masuk petugas, F-03 — Not found dan akses ditolak, F. Halaman publik

### Community 37 - "Dialog"
Cohesion: 0.25
Nodes (7): metadata, Dialog(), Upload(), dialogs, registerDialog(), triggerOf(), triggers

### Community 39 - "peluang/route.ts"
Cohesion: 0.14
Nodes (15): nanoid, ref_node_crypto, ref_node_url, vitest, BATAS_TAMU_PER_JAM, cekTersimpan(), pembatasTamu, POST() (+7 more)

### Community 40 - "accounts.ts"
Cohesion: 0.11
Nodes (34): ChildCard(), metadata, AksesDitolakPage(), AREA, CariParams, Keterangan(), metadata, AccountKey (+26 more)

### Community 44 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 49 - "next"
Cohesion: 0.20
Nodes (6): next, metadata, Card(), Props, Pagination(), Tabs()

### Community 50 - "Map.tsx"
Cohesion: 0.21
Nodes (11): D-03 — Peta sekolah, LABEL, MapLegend(), MapSchools(), MapZones(), Pin, PIN_ICON, pos() (+3 more)

### Community 57 - "Footer.tsx"
Cohesion: 0.32
Nodes (6): Brand(), Column, Footer(), JALUR, LAYANAN, panduan()

### Community 82 - "B. Beranda (`/`)"
Cohesion: 0.33
Nodes (6): B-01 — Hero masuk, B-02 — Kartu jalur (Domisili, Afirmasi, Mutasi, Prestasi), B-03 — Langkah "Cara kerja", B-04 — Angka data SPMB di beranda, B-05 — Latar dan dekorasi beranda, B. Beranda (`/`)

### Community 83 - "D. Halaman hasil dan strategi"
Cohesion: 0.33
Nodes (5): D-01 — Bar rentang skor dan probabilitas, D-02 — Urutan pilihan sekolah dan reorder, D-06 — Galeri foto sekolah di detail, D. Halaman hasil dan strategi, RankList()

### Community 84 - "G. Dashboard"
Cohesion: 0.40
Nodes (5): G-01 — Statistik dashboard kebijakan, G-02 — Grafik dashboard, G-03 — Peta blank spot, G-04 — Admin: impor, simpan, aturan, G. Dashboard

### Community 85 - "1. Katalog library yang boleh dipakai komersial"
Cohesion: 0.50
Nodes (4): 1. Katalog library yang boleh dipakai komersial, 1a. Mesin animasi umum, 1b. Library khusus, 1c. Ditolak atau perlu hati-hati karena lisensi

## Knowledge Gaps
- **301 isolated node(s):** `eslintConfig`, `backend`, `nextConfig`, `name`, `version` (+296 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 448 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `components/index.ts`, `SaveDraft.tsx`, `anak/route.ts`, `nav.ts`, `[langkah]/page.tsx`, `auth.ts`, `Button`, `package.json`, `HasilCepat.tsx`, `react`, `galat`, `MasukGoogle.tsx`, `Alert`, `getSession`, `Navbar.tsx`, `db.ts`, `HomePicker.tsx`, `Toast.tsx`, `QuickCheck.tsx`, `Dialog`, `peluang/route.ts`, `accounts.ts`, `next.config.ts`, `Footer.tsx`?**
  _High betweenness centrality (0.280) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `LandingPage.tsx`, `components/index.ts`, `SaveDraft.tsx`, `nav.ts`, `[langkah]/page.tsx`, `Button`, `package.json`, `HasilCepat.tsx`, `Shell.tsx`, `MasukGoogle.tsx`, `Alert`, `Navbar.tsx`, `HomePicker.tsx`, `Toast.tsx`, `QuickCheck.tsx`, `Dialog`, `accounts.ts`, `next`, `Map.tsx`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button` to `QuickCheck.tsx`, `LandingPage.tsx`, `components/index.ts`, `SaveDraft.tsx`, `Dialog`, `[langkah]/page.tsx`, `accounts.ts`, `HasilCepat.tsx`, `react`, `A. Global`, `MasukGoogle.tsx`, `Alert`, `next`, `getSession`, `Navbar.tsx`, `HomePicker.tsx`, `MasukPetugas.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `galat()` (e.g. with ``/cek` Formulir 3 langkah (Aqil)` and `Masuk dengan Google dan data anak (Aqil)`) actually correct?**
  _`galat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `backend`, `nextConfig` to the rest of the system?**
  _301 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seed.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05311871227364185 - nodes in this community are weakly interconnected._
- **Should `LandingPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06685633001422475 - nodes in this community are weakly interconnected._