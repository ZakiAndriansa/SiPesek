# Graph Report - SiPesek  (2026-10-31)

## Corpus Check
- 180 files · ~57,056 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 32, (none) 5, .example 1)

## Summary
- 1082 nodes · 2606 edges · 104 communities (52 shown, 52 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ce36ff41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- agregasi.ts
- LandingPage.tsx
- mesin.ts
- next
- anak-saya/page.tsx
- anak/route.ts
- Shell.tsx
- [langkah]/page.tsx
- Pembagian Tugas SiPesek
- quick-check.ts
- auth.ts
- Button
- package.json
- HasilCepat.tsx
- react
- galat
- Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)
- Toast.tsx
- Select
- kebijakan-rasio/page.tsx
- getSession
- Navbar.tsx
- compilerOptions
- dependencies
- devDependencies
- src_components_index_badge
- scripts
- db.ts
- HomePicker.tsx
- PageHeader
- app/layout.tsx
- src_components_index_choice
- QuickCheck.tsx
- PageTransition.tsx
- styles/index.ts
- session-actions.ts
- A. Global
- Button.tsx
- validasi.ts
- peluang/route.ts
- akses-ditolak/page.tsx
- C. Cek Cepat dan Isi Data
- accounts.ts
- SaveDraft.tsx
- eslint.config.mjs
- next.config.ts
- src_components_index_dialog
- AGENTS.md
- Form.tsx
- Map.tsx
- src_components_index_accordion
- state.md
- google.ts
- src_components_index_button
- components/index.ts
- 4. Item animasi, lengkap dengan opsi
- Footer.tsx
- D. Halaman hasil dan strategi
- B. Beranda (`/`)
- G. Dashboard
- 1. Katalog library yang boleh dipakai komersial
- src_components_index_alert
- src_components_index_breadcrumb
- src_components_index_buttongroup
- src_components_index_card
- src_components_index_choicegroup
- src_components_index_container
- src_components_index_ctaband
- src_components_index_dashsection
- src_components_index_disclaimer
- src_components_index_field
- src_components_index_form
- src_components_index_helplink
- src_components_index_icon
- src_components_index_maplegend
- src_components_index_mapschools
- src_components_index_morelink
- src_components_index_nextstep
- src_components_index_pageheader
- src_components_index_ranklist
- src_components_index_schoolcard
- src_components_index_section
- src_components_index_sectionheading
- src_components_index_select
- src_components_index_stats
- src_components_index_stepper
- src_components_index_table
- src_components_index_tabs
- src_components_index_toolbar
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
- `D-03 — Peta sekolah` --references--> `MapSchools()`  [INFERRED]
  animation/PROPOSAL.md → src/components/map/Map.tsx
- ``/admin/*` (Zaki)` --references--> `agregasi()`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/etl/agregasi.ts
- ``/cek` Formulir 3 langkah (Aqil)` --references--> `galat()`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/http.ts

## Import Cycles
- None detected.

## Communities (104 total, 52 thin omitted)

### Community 0 - "agregasi.ts"
Cohesion: 0.06
Nodes (44): cheerio, dotenv, ref_node_fs, ref_node_path, ref_node_url, papaparse, vitest, ambilHtml() (+36 more)

### Community 1 - "LandingPage.tsx"
Cohesion: 0.05
Nodes (41): data_statistik_2026, BarisSekolah, csv(), kunciNama(), main(), seedAdmin(), seedAturan(), seedDayaTampung() (+33 more)

### Community 2 - "mesin.ts"
Cohesion: 0.10
Nodes (33): AlternatifSwasta, Jenjang, PermintaanPeluang, bulat50(), jarakMeter(), angka(), berlaku(), bulat2() (+25 more)

### Community 3 - "next"
Cohesion: 0.11
Nodes (16): next, metadata, metadata, metadata, WARNA, metadata, metadata, Badge() (+8 more)

### Community 4 - "anak-saya/page.tsx"
Cohesion: 0.31
Nodes (9): ChildCard(), metadata, Child, continueTarget(), isComplete(), STAGES, stageStatus(), HELP_URL (+1 more)

### Community 5 - "anak/route.ts"
Cohesion: 0.14
Nodes (24): ref_node_crypto, GET(), DELETE(), DELETE(), GET(), pesanNisnTerpakai(), POST(), GET() (+16 more)

### Community 6 - "Shell.tsx"
Cohesion: 0.11
Nodes (13): DashChrome(), KELUAR_WIZARD, LandingChrome(), publicNav(), QuickChrome(), SiteChrome(), stagesFor(), DashMenu (+5 more)

### Community 7 - "[langkah]/page.tsx"
Cohesion: 0.07
Nodes (34): 2026-10-30 — Paket S2 diimplementasi, WizardLayout(), generateMetadata(), IsiLangkah(), LOCKED_LABEL, Props, Item, Choice() (+26 more)

### Community 8 - "Pembagian Tugas SiPesek"
Cohesion: 0.06
Nodes (29): Alur kerja harian, Aturan per area, Branch backend, Branch frontend, Branch sementara, Branch utama, Panduan Branch SiPesek, Yang tidak boleh di-commit (+21 more)

### Community 9 - "quick-check.ts"
Cohesion: 0.09
Nodes (28): HasilJalur, HasilSekolah, KECAMATAN_DEPOK, KECAMATAN_IRISAN_LUAR, KECAMATAN_LAINNYA, LabelPeluang, NilaiMapel, PembandingStatistik (+20 more)

### Community 10 - "auth.ts"
Cohesion: 0.14
Nodes (19): POST(), skema, bacaProfilOrtu(), buatToken(), buatTokenOrtu(), buatTokenSesi(), kunci(), NAMA_COOKIE (+11 more)

### Community 11 - "Button"
Cohesion: 0.12
Nodes (18): Props, metadata, metadata, metadata, Disclaimer(), Button(), ButtonGroup(), Checklist() (+10 more)

### Community 12 - "package.json"
Cohesion: 0.09
Nodes (21): name, private, version, bcryptjs, nanoid, pg, prisma, @prisma/client (+13 more)

### Community 13 - "HasilCepat.tsx"
Cohesion: 0.17
Nodes (26): BarisSekolah(), DialogBaca(), gabung(), Gauge(), HasilCepat(), KartuHasil(), KartuPilihan(), JENJANG (+18 more)

### Community 14 - "react"
Cohesion: 0.21
Nodes (8): react, STATUS, Props, Icon(), Item, Props, Props, Stepper()

### Community 15 - "galat"
Cohesion: 0.27
Nodes (17): zod, GET(), PUT(), skemaUbah, tahunDariParams(), PUT(), skema, POST() (+9 more)

### Community 16 - "Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)"
Cohesion: 0.25
Nodes (7): 2. Paket stack yang bisa dipilih, 3. Ringkasan per halaman, 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih), 7. Cara memberi keputusan, 8. Pertanyaan terbuka, Dasar pertimbangan, Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)

### Community 17 - "Toast.tsx"
Cohesion: 0.25
Nodes (7): 9. Status implementasi (2026-10-30), Ctx, ICONS, ToastContext, ToastData, ToastRegion(), useToast()

### Community 18 - "Select"
Cohesion: 0.10
Nodes (20): D-04 — Filter dan urutan hasil, metadata, metadata, metadata, metadata, metadata, metadata, Dialog() (+12 more)

### Community 19 - "kebijakan-rasio/page.tsx"
Cohesion: 0.15
Nodes (12): metadata, metadata, ZONE_KIND, metadata, Stats(), src_data_kecamatan_fmt, src_data_kecamatan_kec_filter, src_data_kecamatan_kecamatan (+4 more)

### Community 20 - "getSession"
Cohesion: 0.14
Nodes (18): IndexPage(), metadata, AnakSayaPage(), PetaSekolahPage(), StrategiPage(), UnduhanPage(), PanduanPage(), porsi() (+10 more)

### Community 21 - "Navbar.tsx"
Cohesion: 0.15
Nodes (11): BottomNav(), ChildMenu(), DashBar(), firstName(), FocusBar(), Navbar(), NavbarProps, NavChild (+3 more)

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
Nodes (17): @prisma/adapter-pg, server-only, GET(), GET(), src_generated_prisma_client, src_generated_prisma_client_prismaclient, muatDashboard(), persen() (+9 more)

### Community 28 - "HomePicker.tsx"
Cohesion: 0.17
Nodes (12): leaflet, react-leaflet, HomePicker(), locate(), pilih(), PetaRumah, BATAS, SekolahPeta (+4 more)

### Community 29 - "PageHeader"
Cohesion: 0.20
Nodes (9): 2026-10-30 — Panduan dan Tanya Jawab, 2026-10-31 — Merge origin/main (81c4e5e) ke frontend/animation, Changelog Animasi, metadata, Breadcrumb(), PageHeader(), Section(), SchoolCard() (+1 more)

### Community 30 - "app/layout.tsx"
Cohesion: 0.15
Nodes (13): 6. Urutan pengerjaan (jika S2 disetujui), motion, metadata, Sprite(), loadFeatures(), MotionProvider(), HIDDEN, Kind (+5 more)

### Community 32 - "QuickCheck.tsx"
Cohesion: 0.14
Nodes (19): setDraft(), angkaAtauNull(), dateText(), EMPTY, Phase, PHASE_NO, PHASE_TITLE, Props (+11 more)

### Community 34 - "styles/index.ts"
Cohesion: 0.18
Nodes (10): src_components_bottom_nav_bottom_nav, src_components_landing_landing, src_components_link_link, src_components_school_card_school_card, src_components_section_heading_section_heading, src_styles_base, src_styles_motion, src_styles_pages (+2 more)

### Community 35 - "session-actions.ts"
Cohesion: 0.19
Nodes (15): MasukPetugas(), tujuan(), Gis, MasukDemo(), MasukGoogle(), pasangTombol(), setelahGoogle(), tujuan() (+7 more)

### Community 36 - "A. Global"
Cohesion: 0.22
Nodes (9): A-01 — Umpan balik tombol, tautan, kartu, A-02 — Reveal saat scroll, A-03 — Transisi antar halaman, A-04 — Toast dan alert, A-05 — Dialog, menu mobile, bottom sheet, A-07 — Smooth scroll (baru), A-08 — Tur panduan pertama kali (baru), A. Global (+1 more)

### Community 37 - "Button.tsx"
Cohesion: 0.26
Nodes (8): handleClick(), Props, HelpLink(), dialogs, openDialog(), registerDialog(), triggerOf(), triggers

### Community 38 - "validasi.ts"
Cohesion: 0.17
Nodes (11): opsiCookieOrtu, ResponsOrtu, angkaAtauNull, Aturan, bobotMapel, nilai100, skemaAturan, skemaMasukGoogle (+3 more)

### Community 39 - "peluang/route.ts"
Cohesion: 0.25
Nodes (8): BATAS_TAMU_PER_JAM, cekTersimpan(), pembatasTamu, POST(), ipKlien(), PembatasJendela, BATAS_CEK_PER_HARI, muatDataMesin()

### Community 40 - "akses-ditolak/page.tsx"
Cohesion: 0.18
Nodes (15): AksesDitolakPage(), AREA, CariParams, Keterangan(), metadata, homeFor(), nextWizardHref(), ROLE_LABEL (+7 more)

### Community 41 - "C. Cek Cepat dan Isi Data"
Cohesion: 0.25
Nodes (8): C-01 — Validasi NISN dan bidang form, C-02 — Tombol loading saat menghitung peluang, C-03 — Kemunculan hasil peluang, C-04 — Stepper wizard dan perpindahan langkah, C-05 — Simpan draf (`/cek-cepat/simpan`), C. Cek Cepat dan Isi Data, D-05 — Kartu ke detail sekolah, SchoolResultCard()

### Community 42 - "accounts.ts"
Cohesion: 0.20
Nodes (12): StageItem, StageLink(), AccountSeed, buildSession(), isAccount(), PARENT_PREFIXES, parseProgress(), Progress (+4 more)

### Community 43 - "SaveDraft.tsx"
Cohesion: 0.24
Nodes (10): metadata, clearDraft(), getDraft(), SaveDraft(), submit(), importQuickCheck(), OPTS, draftToWizard() (+2 more)

### Community 44 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 49 - "Form.tsx"
Cohesion: 0.18
Nodes (14): ariaInvalid(), FieldError(), FieldProps, Control, ErrorContext, Errors, onBlur(), onChange() (+6 more)

### Community 50 - "Map.tsx"
Cohesion: 0.28
Nodes (8): LABEL, MapSchools(), Pin, PIN_ICON, pos(), Roads, Zone, ZONE_ICON

### Community 53 - "google.ts"
Cohesion: 0.39
Nodes (5): jose, fotoGoogle(), AkunGoogle, JWKS_GOOGLE, verifikasiTokenGoogle()

### Community 55 - "components/index.ts"
Cohesion: 0.15
Nodes (11): A-06 — Accordion dan Tabs, metadata, Accordion(), Alert(), ICON, MapZones(), Props, SectionHeading() (+3 more)

### Community 56 - "4. Item animasi, lengkap dengan opsi"
Cohesion: 0.25
Nodes (8): 4. Item animasi, lengkap dengan opsi, E-01 — Daftar anak, cadangan, unduhan, E-02 — Unduh dokumen, E. Akun orang tua, F-01 — Tanya Jawab dan Panduan, F-02 — Masuk dan masuk petugas, F-03 — Not found dan akses ditolak, F. Halaman publik

### Community 57 - "Footer.tsx"
Cohesion: 0.32
Nodes (6): Brand(), Column, Footer(), JALUR, LAYANAN, panduan()

### Community 58 - "D. Halaman hasil dan strategi"
Cohesion: 0.29
Nodes (6): D-01 — Bar rentang skor dan probabilitas, D-02 — Urutan pilihan sekolah dan reorder, D-03 — Peta sekolah, D-06 — Galeri foto sekolah di detail, D. Halaman hasil dan strategi, RankList()

### Community 59 - "B. Beranda (`/`)"
Cohesion: 0.33
Nodes (6): B-01 — Hero masuk, B-02 — Kartu jalur (Domisili, Afirmasi, Mutasi, Prestasi), B-03 — Langkah "Cara kerja", B-04 — Angka data SPMB di beranda, B-05 — Latar dan dekorasi beranda, B. Beranda (`/`)

### Community 60 - "G. Dashboard"
Cohesion: 0.40
Nodes (5): G-01 — Statistik dashboard kebijakan, G-02 — Grafik dashboard, G-03 — Peta blank spot, G-04 — Admin: impor, simpan, aturan, G. Dashboard

### Community 61 - "1. Katalog library yang boleh dipakai komersial"
Cohesion: 0.50
Nodes (4): 1. Katalog library yang boleh dipakai komersial, 1a. Mesin animasi umum, 1b. Library khusus, 1c. Ditolak atau perlu hati-hati karena lisensi

## Knowledge Gaps
- **302 isolated node(s):** `eslintConfig`, `backend`, `nextConfig`, `name`, `version` (+297 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 447 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `anak-saya/page.tsx`, `anak/route.ts`, `Shell.tsx`, `[langkah]/page.tsx`, `auth.ts`, `Button`, `package.json`, `HasilCepat.tsx`, `react`, `galat`, `Select`, `kebijakan-rasio/page.tsx`, `getSession`, `Navbar.tsx`, `db.ts`, `HomePicker.tsx`, `PageHeader`, `app/layout.tsx`, `QuickCheck.tsx`, `session-actions.ts`, `Button.tsx`, `validasi.ts`, `peluang/route.ts`, `akses-ditolak/page.tsx`, `accounts.ts`, `SaveDraft.tsx`, `next.config.ts`, `Form.tsx`, `components/index.ts`, `Footer.tsx`?**
  _High betweenness centrality (0.288) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `LandingPage.tsx`, `next`, `Shell.tsx`, `[langkah]/page.tsx`, `Button`, `package.json`, `HasilCepat.tsx`, `Toast.tsx`, `Select`, `Navbar.tsx`, `HomePicker.tsx`, `app/layout.tsx`, `QuickCheck.tsx`, `PageTransition.tsx`, `session-actions.ts`, `Button.tsx`, `akses-ditolak/page.tsx`, `SaveDraft.tsx`, `Form.tsx`, `Map.tsx`, `components/index.ts`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `Button()` connect `Button` to `QuickCheck.tsx`, `LandingPage.tsx`, `next`, `A. Global`, `anak-saya/page.tsx`, `session-actions.ts`, `[langkah]/page.tsx`, `akses-ditolak/page.tsx`, `Button.tsx`, `SaveDraft.tsx`, `HasilCepat.tsx`, `Toast.tsx`, `Select`, `kebijakan-rasio/page.tsx`, `Navbar.tsx`, `components/index.ts`, `HomePicker.tsx`, `PageHeader`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `galat()` (e.g. with ``/cek` Formulir 3 langkah (Aqil)` and `Masuk dengan Google dan data anak (Aqil)`) actually correct?**
  _`galat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `backend`, `nextConfig` to the rest of the system?**
  _302 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `agregasi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06328320802005012 - nodes in this community are weakly interconnected._
- **Should `LandingPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05454545454545454 - nodes in this community are weakly interconnected._