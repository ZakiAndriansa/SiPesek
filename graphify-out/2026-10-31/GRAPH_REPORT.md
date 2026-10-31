# Graph Report - SiPesek  (2026-10-31)

## Corpus Check
- 180 files · ~57,548 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 32, (none) 5, .example 1)

## Summary
- 1091 nodes · 2617 edges · 96 communities (43 shown, 53 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5358706b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed.ts
- LandingPage.tsx
- mesin.ts
- panduan/page.tsx
- akses-ditolak/page.tsx
- anak/route.ts
- nav.ts
- [langkah]/page.tsx
- Pembagian Tugas SiPesek
- quick-check.ts
- auth.ts
- [id]/page.tsx
- package.json
- HasilCepat.tsx
- components/index.ts
- galat
- Shell.tsx
- react
- Select
- next
- getSession
- Navbar.tsx
- compilerOptions
- dependencies
- devDependencies
- src_components_index_badge
- scripts
- kontrak.ts
- HomePicker.tsx
- mesin.test.ts
- Toast.tsx
- porsi-jalur.ts
- QuickCheck.tsx
- onBlur
- jalur.ts
- AnimatedNumber.tsx
- A. Global
- Button
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
- admin-pengguna/page.tsx
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

## Communities (96 total, 53 thin omitted)

### Community 0 - "seed.ts"
Cohesion: 0.05
Nodes (59): BarisSekolah, csv(), kunciNama(), main(), seedAdmin(), seedAturan(), seedDayaTampung(), seedJalur() (+51 more)

### Community 1 - "LandingPage.tsx"
Cohesion: 0.09
Nodes (16): ARIA_PORSI(), PATH_STYLE, PATHS, PorsiAngka(), PorsiBar(), PorsiDuaCincin(), PorsiRing(), PorsiVarian (+8 more)

### Community 2 - "mesin.ts"
Cohesion: 0.17
Nodes (21): AlternatifSwasta, Jenjang, bulat50(), angka(), berlaku(), bulat2(), cocokJenjang(), desimal() (+13 more)

### Community 3 - "panduan/page.tsx"
Cohesion: 0.07
Nodes (29): 2026-10-30 — Panduan dan Tanya Jawab, 2026-10-31 — Merge origin/main (81c4e5e) ke frontend/animation, Changelog Animasi, metadata, metadata, metadata, MasukPetugas(), tujuan() (+21 more)

### Community 4 - "akses-ditolak/page.tsx"
Cohesion: 0.20
Nodes (13): AksesDitolakPage(), AREA, CariParams, Keterangan(), metadata, homeFor(), ROLE_LABEL, rolesFor() (+5 more)

### Community 5 - "anak/route.ts"
Cohesion: 0.16
Nodes (22): ref_node_crypto, GET(), DELETE(), DELETE(), GET(), pesanNisnTerpakai(), POST(), GET() (+14 more)

### Community 6 - "nav.ts"
Cohesion: 0.15
Nodes (10): DashChrome(), FocusChrome(), DashMenu, Sidebar(), ADMIN, DashItem, HELP_URL, NavItem (+2 more)

### Community 7 - "[langkah]/page.tsx"
Cohesion: 0.08
Nodes (27): 2026-10-30 — Paket S2 diimplementasi, WizardLayout(), generateMetadata(), IsiLangkah(), LOCKED_LABEL, Props, StepTransition(), AFTER_LAST (+19 more)

### Community 8 - "Pembagian Tugas SiPesek"
Cohesion: 0.07
Nodes (28): Alur kerja harian, Aturan per area, Branch backend, Branch frontend, Branch sementara, Branch utama, Panduan Branch SiPesek, Yang tidak boleh di-commit (+20 more)

### Community 9 - "quick-check.ts"
Cohesion: 0.11
Nodes (21): HasilJalur, HasilSekolah, LabelPeluang, SkorAnak, alasanTertutup(), angka(), isi(), JALUR_UTAMA (+13 more)

### Community 10 - "auth.ts"
Cohesion: 0.10
Nodes (28): Masuk dengan Google dan data anak (Aqil), jose, POST(), skema, POST(), bacaProfilOrtu(), buatToken(), buatTokenOrtu() (+20 more)

### Community 11 - "[id]/page.tsx"
Cohesion: 0.15
Nodes (10): 9. Status implementasi (2026-10-30), Props, metadata, MapLegend(), Stats(), src_data_schools, src_data_schools_getschool, src_data_schools_school (+2 more)

### Community 12 - "package.json"
Cohesion: 0.09
Nodes (21): name, private, version, bcryptjs, nanoid, pg, @prisma/adapter-pg, @prisma/client (+13 more)

### Community 13 - "HasilCepat.tsx"
Cohesion: 0.17
Nodes (26): BarisSekolah(), DialogBaca(), gabung(), Gauge(), HasilCepat(), KartuHasil(), KartuPilihan(), JENJANG (+18 more)

### Community 14 - "components/index.ts"
Cohesion: 0.09
Nodes (28): Accordion(), ICON, Disclaimer(), STATUS, src_components_bottom_nav_bottom_nav, Breadcrumb(), Card(), Props (+20 more)

### Community 15 - "galat"
Cohesion: 0.29
Nodes (16): zod, GET(), PUT(), skemaUbah, tahunDariParams(), PUT(), skema, POST() (+8 more)

### Community 16 - "Shell.tsx"
Cohesion: 0.16
Nodes (14): ChildCard(), continueFor(), firstName(), KELUAR_WIZARD, LandingChrome(), publicNav(), QuickChrome(), SiteChrome() (+6 more)

### Community 17 - "react"
Cohesion: 0.25
Nodes (3): react, NavDirection(), PageTransition()

### Community 18 - "Select"
Cohesion: 0.10
Nodes (24): D-04 — Filter dan urutan hasil, metadata, metadata, Checklist(), Item, Choice(), ChoiceGroup(), ChoiceProps (+16 more)

### Community 19 - "next"
Cohesion: 0.09
Nodes (25): next, metadata, metadata, metadata, metadata, metadata, metadata, ZONE_KIND (+17 more)

### Community 20 - "getSession"
Cohesion: 0.11
Nodes (23): IndexPage(), metadata, AnakSayaPage(), PetaSekolahPage(), StrategiPage(), UnduhanPage(), PanduanPage(), porsi() (+15 more)

### Community 21 - "Navbar.tsx"
Cohesion: 0.12
Nodes (16): A-05 — Dialog, menu mobile, bottom sheet, BottomNav(), Menu(), ChildMenu(), DashBar(), firstName(), FocusBar(), Navbar() (+8 more)

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

### Community 27 - "kontrak.ts"
Cohesion: 0.11
Nodes (26): server-only, GET(), GET(), src_generated_prisma_client, src_generated_prisma_client_prisma, src_generated_prisma_client_prismaclient, muatDashboard(), persen() (+18 more)

### Community 28 - "HomePicker.tsx"
Cohesion: 0.16
Nodes (13): leaflet, react-leaflet, HomePicker(), locate(), pilih(), PetaRumah, BATAS, SekolahPeta (+5 more)

### Community 29 - "mesin.test.ts"
Cohesion: 0.15
Nodes (11): PermintaanPeluang, DataMesin, SekolahMesin, StatistikMesin, aturan, data, keUtara(), minta() (+3 more)

### Community 30 - "Toast.tsx"
Cohesion: 0.07
Nodes (29): 1. Katalog library yang boleh dipakai komersial, 1a. Mesin animasi umum, 1b. Library khusus, 1c. Ditolak atau perlu hati-hati karena lisensi, 2. Paket stack yang bisa dipilih, 3. Ringkasan per halaman, 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih), 6. Urutan pengerjaan (jika S2 disetujui) (+21 more)

### Community 31 - "porsi-jalur.ts"
Cohesion: 0.23
Nodes (10): data_statistik_2026, BarisDiterima, hitungPorsi(), JALUR_UTAMA, jalurDari, JalurUtama, PORSI_JALUR, PorsiJalur (+2 more)

### Community 32 - "QuickCheck.tsx"
Cohesion: 0.12
Nodes (21): getDraft(), setDraft(), angkaAtauNull(), dateText(), EMPTY, Phase, PHASE_NO, PHASE_TITLE (+13 more)

### Community 33 - "onBlur"
Cohesion: 0.60
Nodes (6): onBlur(), onChange(), onSubmit(), isControl(), keyOf(), messageFor()

### Community 34 - "jalur.ts"
Cohesion: 0.33
Nodes (5): ATURAN_2026, JALUR, KodeJalur, KodeSubJalur, SUB_JALUR

### Community 35 - "AnimatedNumber.tsx"
Cohesion: 0.60
Nodes (3): @number-flow/react, AnimatedNumber(), parse()

### Community 36 - "A. Global"
Cohesion: 0.05
Nodes (39): 4. Item animasi, lengkap dengan opsi, A-01 — Umpan balik tombol, tautan, kartu, A-02 — Reveal saat scroll, A-03 — Transisi antar halaman, A-04 — Toast dan alert, A-07 — Smooth scroll (baru), A-08 — Tur panduan pertama kali (baru), A. Global (+31 more)

### Community 37 - "Button"
Cohesion: 0.20
Nodes (11): Button(), handleClick(), Props, Dialog(), ExternalLink(), HelpLink(), dialogs, openDialog() (+3 more)

### Community 39 - "peluang/route.ts"
Cohesion: 0.13
Nodes (16): BATAS_TAMU_PER_JAM, cekTersimpan(), pembatasTamu, POST(), ipKlien(), PembatasJendela, BATAS_CEK_PER_HARI, muatDataMesin() (+8 more)

### Community 40 - "accounts.ts"
Cohesion: 0.14
Nodes (23): metadata, MasukDemo(), MasukGoogle(), pasangTombol(), setelahGoogle(), tujuan(), AccountKey, AccountSeed (+15 more)

### Community 44 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 49 - "admin-pengguna/page.tsx"
Cohesion: 0.33
Nodes (3): A-06 — Accordion dan Tabs, metadata, Tabs()

### Community 50 - "Map.tsx"
Cohesion: 0.24
Nodes (10): D-03 — Peta sekolah, LABEL, MapSchools(), MapZones(), Pin, PIN_ICON, pos(), Roads (+2 more)

### Community 57 - "Footer.tsx"
Cohesion: 0.32
Nodes (6): Brand(), Column, Footer(), JALUR, LAYANAN, panduan()

## Knowledge Gaps
- **303 isolated node(s):** `eslintConfig`, `backend`, `nextConfig`, `name`, `version` (+298 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 451 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `panduan/page.tsx`, `akses-ditolak/page.tsx`, `anak/route.ts`, `nav.ts`, `[langkah]/page.tsx`, `auth.ts`, `[id]/page.tsx`, `package.json`, `HasilCepat.tsx`, `components/index.ts`, `galat`, `Select`, `getSession`, `Navbar.tsx`, `kontrak.ts`, `HomePicker.tsx`, `Toast.tsx`, `QuickCheck.tsx`, `Button`, `peluang/route.ts`, `accounts.ts`, `next.config.ts`, `admin-pengguna/page.tsx`, `Footer.tsx`?**
  _High betweenness centrality (0.264) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `QuickCheck.tsx`, `LandingPage.tsx`, `panduan/page.tsx`, `akses-ditolak/page.tsx`, `Button`, `nav.ts`, `[langkah]/page.tsx`, `AnimatedNumber.tsx`, `[id]/page.tsx`, `package.json`, `HasilCepat.tsx`, `components/index.ts`, `Shell.tsx`, `Select`, `Map.tsx`, `Navbar.tsx`, `HomePicker.tsx`, `Toast.tsx`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `Halaman dan API yang dipakai` connect `Pembagian Tugas SiPesek` to `auth.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `galat()` (e.g. with ``/cek` Formulir 3 langkah (Aqil)` and `Masuk dengan Google dan data anak (Aqil)`) actually correct?**
  _`galat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `backend`, `nextConfig` to the rest of the system?**
  _303 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seed.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050351721584598295 - nodes in this community are weakly interconnected._
- **Should `LandingPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08831908831908832 - nodes in this community are weakly interconnected._