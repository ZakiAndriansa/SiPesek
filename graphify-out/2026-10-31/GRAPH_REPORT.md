# Graph Report - SiPesek  (2026-10-31)

## Corpus Check
- 173 files · ~52,871 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 32, (none) 5, .example 1)

## Summary
- 1015 nodes · 2383 edges · 58 communities (54 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ce36ff41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ekspor-statistik.ts
- LandingPage.tsx
- mesin.ts
- PageHeader
- anak-saya/page.tsx
- next
- Shell.tsx
- [langkah]/page.tsx
- Pembagian Tugas SiPesek
- kontrak.ts
- auth.ts
- [id]/page.tsx
- package.json
- MasukGoogle.tsx
- Icon
- galat
- Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)
- quick-check.ts
- components/index.ts
- kebijakan-rasio/page.tsx
- getSession
- Navbar.tsx
- compilerOptions
- dependencies
- devDependencies
- panduan/page.tsx
- scripts
- db.ts
- HomePicker.tsx
- seed.ts
- Button.tsx
- QuickCheck.tsx
- QuickCheck
- react
- styles/index.ts
- session-actions.ts
- ambil-sekolah.ts
- Button
- validasi.ts
- peluang/route.ts
- proxy.ts
- src_data_schools
- accounts.ts
- importQuickCheck
- eslint.config.mjs
- next.config.ts
- peta-sekolah/page.tsx
- AGENTS.md
- Form.tsx
- Map.tsx
- strategi/page.tsx
- state.md
- homeFor
- tanya-jawab/page.tsx
- admin-pengguna/page.tsx
- RevealObserver.tsx
- Field.tsx

## God Nodes (most connected - your core abstractions)
1. `next` - 68 edges
2. `react` - 54 edges
3. `galat()` - 31 edges
4. `Button()` - 31 edges
5. `Icon()` - 27 edges
6. `getSession()` - 26 edges
7. `PageHeader()` - 22 edges
8. `prisma` - 19 edges
9. `bacaJson()` - 18 edges
10. `Alert()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `A-01 — Umpan balik tombol, tautan, kartu` --references--> `Button()`  [INFERRED]
  animation/PROPOSAL.md → src/components/button/Button.tsx
- `A-04 — Toast dan alert` --references--> `Alert()`  [INFERRED]
  animation/PROPOSAL.md → src/components/alert/Alert.tsx
- ``/hasil/[token]` (Aqil)` --references--> `ResponsPeluang`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/kontrak.ts
- ``/admin/*` (Zaki)` --references--> `agregasi()`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/etl/agregasi.ts
- ``/cek` Formulir 3 langkah (Aqil)` --references--> `galat()`  [INFERRED]
  PEMBAGIAN-TUGAS.md → src/lib/http.ts

## Import Cycles
- None detected.

## Communities (58 total, 4 thin omitted)

### Community 0 - "ekspor-statistik.ts"
Cohesion: 0.09
Nodes (21): ref_node_fs, ref_node_path, ref_node_url, papaparse, vitest, a, baris, files (+13 more)

### Community 1 - "LandingPage.tsx"
Cohesion: 0.06
Nodes (23): A-01 — Umpan balik tombol, tautan, kartu, A-02 — Reveal saat scroll, A-03 — Transisi antar halaman, A-04 — Toast dan alert, A-05 — Dialog, menu mobile, bottom sheet, A-06 — Accordion dan Tabs, A-07 — Smooth scroll (baru), A-08 — Tur panduan pertama kali (baru) (+15 more)

### Community 2 - "mesin.ts"
Cohesion: 0.10
Nodes (30): AlternatifSwasta, HasilJalur, HasilSekolah, Jenjang, LabelPeluang, PermintaanPeluang, bulat50(), formatJarak() (+22 more)

### Community 3 - "PageHeader"
Cohesion: 0.09
Nodes (16): 2026-10-30 — Panduan dan Tanya Jawab, metadata, metadata, metadata, metadata, metadata, Badge(), Breadcrumb() (+8 more)

### Community 4 - "anak-saya/page.tsx"
Cohesion: 0.31
Nodes (8): ChildCard(), metadata, Child, continueTarget(), isComplete(), STAGES, WIZARD_TOTAL, addChild()

### Community 5 - "next"
Cohesion: 0.16
Nodes (24): next, ref_node_crypto, GET(), DELETE(), DELETE(), GET(), pesanNisnTerpakai(), POST() (+16 more)

### Community 6 - "Shell.tsx"
Cohesion: 0.10
Nodes (16): BottomNav(), DashChrome(), firstName(), KELUAR_WIZARD, QuickChrome(), SiteChrome(), stagesFor(), WizardBar() (+8 more)

### Community 7 - "[langkah]/page.tsx"
Cohesion: 0.10
Nodes (23): WizardLayout(), generateMetadata(), IsiLangkah(), LOCKED_LABEL, Props, StepTransition(), FocusChrome(), AFTER_LAST (+15 more)

### Community 8 - "Pembagian Tugas SiPesek"
Cohesion: 0.07
Nodes (28): Alur kerja harian, Aturan per area, Branch backend, Branch frontend, Branch sementara, Branch utama, Panduan Branch SiPesek, Yang tidak boleh di-commit (+20 more)

### Community 9 - "kontrak.ts"
Cohesion: 0.10
Nodes (25): main(), src_generated_prisma_client_prisma, agregasi(), ambil(), bulat(), diterima(), HasilAgregasi, KOLOM (+17 more)

### Community 10 - "auth.ts"
Cohesion: 0.11
Nodes (26): Masuk dengan Google dan data anak (Aqil), jose, POST(), bacaProfilOrtu(), buatToken(), buatTokenOrtu(), buatTokenSesi(), kunci() (+18 more)

### Community 11 - "[id]/page.tsx"
Cohesion: 0.17
Nodes (7): Props, src_components_index_breadcrumb, src_components_index_buttongroup, src_components_index_dashsection, src_components_index_stats, src_data_schools_getschool, src_data_schools_shortname

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (25): name, private, version, bcryptjs, dotenv, leaflet, nanoid, pg (+17 more)

### Community 13 - "MasukGoogle.tsx"
Cohesion: 0.16
Nodes (14): metadata, Item, Choice(), ChoiceGroup(), ChoiceProps, GroupProps, Field(), Form() (+6 more)

### Community 14 - "Icon"
Cohesion: 0.16
Nodes (8): ICON, Disclaimer(), STATUS, Icon(), Item, Props, Props, Stepper()

### Community 15 - "galat"
Cohesion: 0.27
Nodes (17): zod, GET(), PUT(), skemaUbah, tahunDariParams(), PUT(), skema, POST() (+9 more)

### Community 16 - "Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)"
Cohesion: 0.05
Nodes (40): 1. Katalog library yang boleh dipakai komersial, 1a. Mesin animasi umum, 1b. Library khusus, 1c. Ditolak atau perlu hati-hati karena lisensi, 2. Paket stack yang bisa dipilih, 3. Ringkasan per halaman, 4. Item animasi, lengkap dengan opsi, 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih) (+32 more)

### Community 17 - "quick-check.ts"
Cohesion: 0.11
Nodes (20): 9. Status implementasi (2026-10-30), src_data_geo_distancekm, src_data_geo_isvalidpoint, src_data_geo_kec_point, src_data_schools_kind, src_data_schools_school_rules, average(), Candidate (+12 more)

### Community 18 - "components/index.ts"
Cohesion: 0.12
Nodes (16): metadata, metadata, metadata, metadata, ButtonGroup(), Checklist(), MapZones(), CtaBand() (+8 more)

### Community 19 - "kebijakan-rasio/page.tsx"
Cohesion: 0.14
Nodes (18): D-04 — Filter dan urutan hasil, metadata, metadata, metadata, ZONE_KIND, metadata, Alert(), Select() (+10 more)

### Community 20 - "getSession"
Cohesion: 0.17
Nodes (13): AnakSayaPage(), UnduhanPage(), AksesDitolakPage(), AREA, CariParams, metadata, CekCepatPage(), metadata (+5 more)

### Community 21 - "Navbar.tsx"
Cohesion: 0.12
Nodes (13): Brand(), Column, Footer(), JALUR, LAYANAN, panduan(), ChildMenu(), DashBar() (+5 more)

### Community 22 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 23 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcryptjs, dotenv, jose, leaflet, motion, nanoid, next (+11 more)

### Community 24 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, cheerio, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/turbopack, tsx (+9 more)

### Community 25 - "panduan/page.tsx"
Cohesion: 0.17
Nodes (10): metadata, TOY_COLOR_MAP, src_components_index_badge, src_components_index_card, src_components_index_icon, src_components_index_section, src_components_index_sectionheading, src_components_index_tabs (+2 more)

### Community 26 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, data:ekspor, data:impor, data:kirim, data:sekolah, db:migrate, db:seed (+7 more)

### Community 27 - "db.ts"
Cohesion: 0.19
Nodes (14): server-only, GET(), GET(), src_generated_prisma_client_prismaclient, muatDashboard(), persen(), tahunAktif(), tahunDiminta() (+6 more)

### Community 28 - "HomePicker.tsx"
Cohesion: 0.13
Nodes (12): src_data_geo, src_data_geo_bounds, src_data_geo_frompercent, src_data_geo_geopoint, src_data_geo_inbounds, src_data_geo_map_aspect, src_data_geo_nearestkecamatan, src_data_geo_school_point (+4 more)

### Community 29 - "seed.ts"
Cohesion: 0.20
Nodes (17): BarisSekolah, csv(), kunciNama(), main(), seedAdmin(), seedAturan(), seedDayaTampung(), seedJalur() (+9 more)

### Community 30 - "Button.tsx"
Cohesion: 0.13
Nodes (14): 6. Urutan pengerjaan (jika S2 disetujui), motion, metadata, Props, Sprite(), loadFeatures(), MotionProvider(), Ctx (+6 more)

### Community 31 - "QuickCheck.tsx"
Cohesion: 0.12
Nodes (15): src_components_index_choice, src_components_index_choicegroup, src_components_index_field, src_components_index_form, src_components_index_schoolcard, src_components_index_stepper, EMPTY, Phase (+7 more)

### Community 32 - "QuickCheck"
Cohesion: 0.22
Nodes (8): setDraft(), dateText(), QuickCheck(), save(), submitIsian(), submitNisn(), isValidNisn(), parseNumber()

### Community 33 - "react"
Cohesion: 0.25
Nodes (3): react, NavDirection(), PageTransition()

### Community 34 - "styles/index.ts"
Cohesion: 0.14
Nodes (12): src_components_bottom_nav_bottom_nav, Card(), Props, src_components_landing_landing, src_components_link_link, src_components_school_card_school_card, src_components_section_heading_section_heading, src_styles_base (+4 more)

### Community 35 - "session-actions.ts"
Cohesion: 0.16
Nodes (13): 2026-10-30 — Paket S2 diimplementasi, Changelog Animasi, MasukPetugas(), tujuan(), WizardForm(), AccountKey, ACCOUNTS, parseProgress() (+5 more)

### Community 36 - "ambil-sekolah.ts"
Cohesion: 0.24
Nodes (13): cheerio, ambilHtml(), bacaDaftar(), bacaDetail(), BarisDaftar, BATAS, bersih(), bukanSmaSmk() (+5 more)

### Community 37 - "Button"
Cohesion: 0.16
Nodes (14): metadata, Button(), handleClick(), Dialog(), ExternalLink(), HelpLink(), src_data_kecamatan_kec_names, pos() (+6 more)

### Community 38 - "validasi.ts"
Cohesion: 0.20
Nodes (9): angkaAtauNull, Aturan, bobotMapel, nilai100, RumusSkor, skemaAturan, skemaMasukGoogle, skemaPermintaanPeluang (+1 more)

### Community 39 - "peluang/route.ts"
Cohesion: 0.28
Nodes (7): BATAS_TAMU_PER_JAM, cekTersimpan(), pembatasTamu, POST(), ipKlien(), PembatasJendela, muatDataMesin()

### Community 40 - "proxy.ts"
Cohesion: 0.40
Nodes (9): buildSession(), nextWizardHref(), stageOf(), stageStatus(), selectChild(), config, penjagaAdmin(), penjagaOrangTua() (+1 more)

### Community 41 - "src_data_schools"
Cohesion: 0.36
Nodes (6): C-03 — Kemunculan hasil peluang, D-05 — Kartu ke detail sekolah, src_data_schools, src_data_schools_school, AddSchoolButton(), SchoolResultCard()

### Community 42 - "accounts.ts"
Cohesion: 0.17
Nodes (13): Keterangan(), StageItem, StageLink(), AccountSeed, isAccount(), PARENT_PREFIXES, Progress, PUBLIC_PATHS (+5 more)

### Community 43 - "importQuickCheck"
Cohesion: 0.31
Nodes (8): clearDraft(), getDraft(), SaveDraft(), submit(), importQuickCheck(), draftToWizard(), QuickDraft, validateInput()

### Community 44 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 46 - "peta-sekolah/page.tsx"
Cohesion: 0.18
Nodes (9): metadata, PetaSekolahPage(), src_components_index_dialog, src_components_index_helplink, src_components_index_maplegend, src_components_index_mapschools, src_components_index_nextstep, src_components_index_select (+1 more)

### Community 49 - "Form.tsx"
Cohesion: 0.29
Nodes (10): Control, ErrorContext, Errors, onBlur(), onChange(), onSubmit(), FormProps, isControl() (+2 more)

### Community 50 - "Map.tsx"
Cohesion: 0.24
Nodes (9): D-03 — Peta sekolah, LABEL, MapSchools(), Pin, PIN_ICON, pos(), Roads, Zone (+1 more)

### Community 51 - "strategi/page.tsx"
Cohesion: 0.20
Nodes (9): metadata, StrategiPage(), src_components_index_accordion, src_components_index_alert, src_components_index_disclaimer, src_components_index_morelink, src_components_index_ranklist, src_components_index_table (+1 more)

### Community 53 - "homeFor"
Cohesion: 0.31
Nodes (6): IndexPage(), metadata, continueFor(), LandingChrome(), publicNav(), homeFor()

### Community 54 - "tanya-jawab/page.tsx"
Cohesion: 0.22
Nodes (7): metadata, src_components_index_button, src_components_index_container, src_components_index_ctaband, src_components_index_pageheader, src_data_faq, src_data_faq_faq_groups

### Community 55 - "admin-pengguna/page.tsx"
Cohesion: 0.25
Nodes (4): metadata, Pagination(), Tab, Tabs()

### Community 56 - "RevealObserver.tsx"
Cohesion: 0.38
Nodes (6): HIDDEN, Kind, kindOf(), RevealObserver(), SHOWN, token()

### Community 57 - "Field.tsx"
Cohesion: 0.47
Nodes (4): ariaInvalid(), FieldError(), FieldProps, Props

## Knowledge Gaps
- **300 isolated node(s):** `Workflow State`, `Dasar pertimbangan`, `1a. Mesin animasi umum`, `1b. Library khusus`, `1c. Ditolak atau perlu hati-hati karena lisensi` (+295 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 424 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `PageHeader`, `anak-saya/page.tsx`, `Shell.tsx`, `[langkah]/page.tsx`, `auth.ts`, `[id]/page.tsx`, `package.json`, `MasukGoogle.tsx`, `Icon`, `galat`, `components/index.ts`, `kebijakan-rasio/page.tsx`, `getSession`, `Navbar.tsx`, `panduan/page.tsx`, `db.ts`, `Button.tsx`, `QuickCheck.tsx`, `styles/index.ts`, `session-actions.ts`, `Button`, `peluang/route.ts`, `proxy.ts`, `accounts.ts`, `next.config.ts`, `peta-sekolah/page.tsx`, `Form.tsx`, `strategi/page.tsx`, `homeFor`, `tanya-jawab/page.tsx`, `admin-pengguna/page.tsx`?**
  _High betweenness centrality (0.396) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `LandingPage.tsx`, `PageHeader`, `Shell.tsx`, `[langkah]/page.tsx`, `[id]/page.tsx`, `package.json`, `MasukGoogle.tsx`, `Icon`, `components/index.ts`, `getSession`, `Navbar.tsx`, `HomePicker.tsx`, `Button.tsx`, `QuickCheck.tsx`, `styles/index.ts`, `session-actions.ts`, `Button`, `peta-sekolah/page.tsx`, `Form.tsx`, `Map.tsx`, `homeFor`, `admin-pengguna/page.tsx`, `RevealObserver.tsx`, `Field.tsx`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `4. Item animasi, lengkap dengan opsi` connect `Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)` to `LandingPage.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `galat()` (e.g. with ``/cek` Formulir 3 langkah (Aqil)` and `Masuk dengan Google dan data anak (Aqil)`) actually correct?**
  _`galat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Workflow State`, `Dasar pertimbangan`, `1a. Mesin animasi umum` to the rest of the system?**
  _300 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ekspor-statistik.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09462365591397849 - nodes in this community are weakly interconnected._
- **Should `LandingPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06386554621848739 - nodes in this community are weakly interconnected._