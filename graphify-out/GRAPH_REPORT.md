# Graph Report - SiPesek  (2026-10-31)

## Corpus Check
- 173 files · ~52,871 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 32, (none) 5, .example 1)

## Summary
- 982 nodes · 2388 edges · 52 communities (48 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `15955f3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- agregasi.ts
- seed.ts
- kontrak.ts
- next
- accounts.ts
- anak/route.ts
- Shell.tsx
- react
- Pembagian Tugas SiPesek
- nav.ts
- auth.ts
- [id]/page.tsx
- package.json
- Select
- components/index.ts
- galat
- Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)
- quick-check.ts
- A. Global
- Alert
- getSession
- Navbar.tsx
- compilerOptions
- dependencies
- devDependencies
- panduan/page.tsx
- scripts
- 4. Item animasi, lengkap dengan opsi
- HomePicker.tsx
- google.ts
- Form.tsx
- QuickCheck.tsx
- QuickCheck
- Halaman dan API yang dipakai
- styles/index.ts
- MasukPetugas.tsx
- 1. Katalog library yang boleh dipakai komersial
- Button
- validasi.ts
- peluang/route.ts
- proxy.ts
- C. Cek Cepat dan Isi Data
- signIn
- SaveDraft.tsx
- eslint.config.mjs
- next.config.ts
- B. Beranda (`/`)
- AGENTS.md
- D. Halaman hasil dan strategi
- G. Dashboard
- state.md

## God Nodes (most connected - your core abstractions)
1. `next` - 68 edges
2. `react` - 54 edges
3. `Button()` - 38 edges
4. `galat()` - 31 edges
5. `Icon()` - 28 edges
6. `PageHeader()` - 28 edges
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
- `A-05 — Dialog, menu mobile, bottom sheet` --references--> `Dialog()`  [INFERRED]
  animation/PROPOSAL.md → src/components/dialog/Dialog.tsx

## Import Cycles
- None detected.

## Communities (52 total, 4 thin omitted)

### Community 0 - "agregasi.ts"
Cohesion: 0.07
Nodes (42): cheerio, dotenv, ref_node_fs, ref_node_path, ref_node_url, papaparse, vitest, ambilHtml() (+34 more)

### Community 1 - "seed.ts"
Cohesion: 0.07
Nodes (28): BarisSekolah, csv(), kunciNama(), main(), seedAdmin(), seedAturan(), seedDayaTampung(), seedJalur() (+20 more)

### Community 2 - "kontrak.ts"
Cohesion: 0.06
Nodes (53): GET(), GET(), muatDashboard(), persen(), tahunAktif(), tahunDiminta(), AlternatifSwasta, HasilJalur (+45 more)

### Community 3 - "next"
Cohesion: 0.12
Nodes (15): 2026-10-30 — Panduan dan Tanya Jawab, next, metadata, metadata, metadata, metadata, Checklist(), Gis (+7 more)

### Community 4 - "accounts.ts"
Cohesion: 0.17
Nodes (21): ChildCard(), metadata, AccountKey, ACCOUNTS, AccountSeed, buildSession(), Child, continueTarget() (+13 more)

### Community 5 - "anak/route.ts"
Cohesion: 0.15
Nodes (25): server-only, GET(), DELETE(), DELETE(), GET(), pesanNisnTerpakai(), POST(), GET() (+17 more)

### Community 6 - "Shell.tsx"
Cohesion: 0.14
Nodes (9): firstName(), KELUAR_WIZARD, LandingChrome(), QuickChrome(), SiteChrome(), stagesFor(), WizardBar(), DashMenu (+1 more)

### Community 7 - "react"
Cohesion: 0.06
Nodes (32): 2026-10-30 — Paket S2 diimplementasi, Changelog Animasi, react, WizardLayout(), generateMetadata(), IsiLangkah(), LOCKED_LABEL, Props (+24 more)

### Community 8 - "Pembagian Tugas SiPesek"
Cohesion: 0.08
Nodes (22): Alur kerja harian, Aturan per area, Branch backend, Branch frontend, Branch sementara, Branch utama, Panduan Branch SiPesek, Yang tidak boleh di-commit (+14 more)

### Community 9 - "nav.ts"
Cohesion: 0.21
Nodes (7): DashChrome(), ADMIN, DashItem, HELP_URL, NavItem, POLICY, PUBLIC_NAV

### Community 10 - "auth.ts"
Cohesion: 0.15
Nodes (18): skema, bacaProfilOrtu(), buatToken(), buatTokenOrtu(), buatTokenSesi(), kunci(), NAMA_COOKIE, NAMA_COOKIE_ORTU (+10 more)

### Community 11 - "[id]/page.tsx"
Cohesion: 0.11
Nodes (12): metadata, Props, metadata, Disclaimer(), Breadcrumb(), MapLegend(), Stats(), src_data_schools (+4 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, version, bcryptjs, leaflet, pg, prisma, @prisma/adapter-pg (+15 more)

### Community 13 - "Select"
Cohesion: 0.16
Nodes (15): D-04 — Filter dan urutan hasil, metadata, Item, Choice(), ChoiceGroup(), ChoiceProps, GroupProps, ariaInvalid() (+7 more)

### Community 14 - "components/index.ts"
Cohesion: 0.16
Nodes (15): ICON, Badge(), STATUS, Card(), Props, Icon(), ExternalLink(), HelpLink() (+7 more)

### Community 15 - "galat"
Cohesion: 0.25
Nodes (18): zod, GET(), PUT(), skemaUbah, tahunDariParams(), PUT(), skema, POST() (+10 more)

### Community 16 - "Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)"
Cohesion: 0.25
Nodes (7): 2. Paket stack yang bisa dipilih, 3. Ringkasan per halaman, 5. Yang saya sarankan tidak dipakai (tetap bisa Anda pilih), 7. Cara memberi keputusan, 8. Pertanyaan terbuka, Dasar pertimbangan, Usulan Animasi SiPesek (versi 2: dengan library pihak ketiga)

### Community 17 - "quick-check.ts"
Cohesion: 0.11
Nodes (20): 9. Status implementasi (2026-10-30), src_data_geo_distancekm, src_data_geo_isvalidpoint, src_data_geo_kec_point, src_data_schools_kind, src_data_schools_school_rules, average(), Candidate (+12 more)

### Community 18 - "A. Global"
Cohesion: 0.20
Nodes (9): A-01 — Umpan balik tombol, tautan, kartu, A-02 — Reveal saat scroll, A-03 — Transisi antar halaman, A-04 — Toast dan alert, A-05 — Dialog, menu mobile, bottom sheet, A-07 — Smooth scroll (baru), A-08 — Tur panduan pertama kali (baru), A. Global (+1 more)

### Community 19 - "Alert"
Cohesion: 0.11
Nodes (20): metadata, metadata, metadata, metadata, metadata, ZONE_KIND, metadata, Alert() (+12 more)

### Community 20 - "getSession"
Cohesion: 0.15
Nodes (15): AnakSayaPage(), PetaSekolahPage(), StrategiPage(), UnduhanPage(), AksesDitolakPage(), AREA, CariParams, metadata (+7 more)

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

### Community 25 - "panduan/page.tsx"
Cohesion: 0.10
Nodes (14): A-06 — Accordion dan Tabs, metadata, TOY_COLOR_MAP, metadata, Accordion(), CtaBand(), Props, SectionHeading() (+6 more)

### Community 26 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, data:ekspor, data:impor, data:kirim, data:sekolah, db:migrate, db:seed (+7 more)

### Community 27 - "4. Item animasi, lengkap dengan opsi"
Cohesion: 0.25
Nodes (8): 4. Item animasi, lengkap dengan opsi, E-01 — Daftar anak, cadangan, unduhan, E-02 — Unduh dokumen, E. Akun orang tua, F-01 — Tanya Jawab dan Panduan, F-02 — Masuk dan masuk petugas, F-03 — Not found dan akses ditolak, F. Halaman publik

### Community 28 - "HomePicker.tsx"
Cohesion: 0.13
Nodes (12): src_data_geo, src_data_geo_bounds, src_data_geo_frompercent, src_data_geo_geopoint, src_data_geo_inbounds, src_data_geo_map_aspect, src_data_geo_nearestkecamatan, src_data_geo_school_point (+4 more)

### Community 29 - "google.ts"
Cohesion: 0.39
Nodes (5): jose, fotoGoogle(), AkunGoogle, JWKS_GOOGLE, verifikasiTokenGoogle()

### Community 30 - "Form.tsx"
Cohesion: 0.08
Nodes (28): 6. Urutan pengerjaan (jika S2 disetujui), motion, metadata, Control, ErrorContext, Errors, onBlur(), onChange() (+20 more)

### Community 31 - "QuickCheck.tsx"
Cohesion: 0.17
Nodes (10): src_data_kecamatan_kec_names, EMPTY, Phase, PHASE_NO, PHASE_TITLE, Props, PRESTASI, QuickCheckInput (+2 more)

### Community 32 - "QuickCheck"
Cohesion: 0.29
Nodes (9): setDraft(), dateText(), QuickCheck(), save(), submitIsian(), submitNisn(), isValidNisn(), parseNumber() (+1 more)

### Community 33 - "Halaman dan API yang dipakai"
Cohesion: 0.25
Nodes (8): `/admin/*` (Zaki), `/` Beranda (Aqil), `/cek` Formulir 3 langkah (Aqil), `/dashboard` (Zaki), Halaman dan API yang dipakai, `/hasil/[token]` (Aqil), Masuk dengan Google dan data anak (Aqil), ResponsPeluang

### Community 34 - "styles/index.ts"
Cohesion: 0.08
Nodes (26): D-03 — Peta sekolah, src_components_bottom_nav_bottom_nav, Brand(), Column, Footer(), JALUR, LAYANAN, panduan() (+18 more)

### Community 35 - "MasukPetugas.tsx"
Cohesion: 0.47
Nodes (3): MasukPetugas(), tujuan(), metadata

### Community 36 - "1. Katalog library yang boleh dipakai komersial"
Cohesion: 0.50
Nodes (4): 1. Katalog library yang boleh dipakai komersial, 1a. Mesin animasi umum, 1b. Library khusus, 1c. Ditolak atau perlu hati-hati karena lisensi

### Community 37 - "Button"
Cohesion: 0.13
Nodes (17): metadata, metadata, metadata, Button(), handleClick(), ButtonGroup(), Props, Dialog() (+9 more)

### Community 38 - "validasi.ts"
Cohesion: 0.18
Nodes (10): opsiCookieOrtu, ResponsOrtu, angkaAtauNull, Aturan, bobotMapel, nilai100, skemaMasukGoogle, skemaPermintaanImpor (+2 more)

### Community 39 - "peluang/route.ts"
Cohesion: 0.16
Nodes (13): nanoid, ref_node_crypto, BATAS_TAMU_PER_JAM, cekTersimpan(), pembatasTamu, POST(), ipKlien(), PembatasJendela (+5 more)

### Community 40 - "proxy.ts"
Cohesion: 0.30
Nodes (10): IndexPage(), metadata, continueFor(), publicNav(), homeFor(), nextWizardHref(), config, penjagaAdmin() (+2 more)

### Community 41 - "C. Cek Cepat dan Isi Data"
Cohesion: 0.25
Nodes (8): C-01 — Validasi NISN dan bidang form, C-02 — Tombol loading saat menghitung peluang, C-03 — Kemunculan hasil peluang, C-04 — Stepper wizard dan perpindahan langkah, C-05 — Simpan draf (`/cek-cepat/simpan`), C. Cek Cepat dan Isi Data, D-05 — Kartu ke detail sekolah, SchoolResultCard()

### Community 42 - "signIn"
Cohesion: 0.27
Nodes (10): Keterangan(), MasukDemo(), MasukGoogle(), pasangTombol(), setelahGoogle(), tujuan(), rolesFor(), safeNext() (+2 more)

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
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `kontrak.ts`, `accounts.ts`, `anak/route.ts`, `Shell.tsx`, `react`, `auth.ts`, `[id]/page.tsx`, `package.json`, `Select`, `components/index.ts`, `galat`, `Alert`, `getSession`, `Navbar.tsx`, `panduan/page.tsx`, `Form.tsx`, `QuickCheck.tsx`, `styles/index.ts`, `MasukPetugas.tsx`, `Button`, `validasi.ts`, `peluang/route.ts`, `proxy.ts`, `SaveDraft.tsx`, `next.config.ts`?**
  _High betweenness centrality (0.385) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `seed.ts`, `styles/index.ts`, `next`, `Button`, `Shell.tsx`, `nav.ts`, `[id]/page.tsx`, `package.json`, `Select`, `components/index.ts`, `SaveDraft.tsx`, `A. Global`, `getSession`, `Navbar.tsx`, `panduan/page.tsx`, `HomePicker.tsx`, `Form.tsx`, `QuickCheck.tsx`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `Halaman dan API yang dipakai` connect `Halaman dan API yang dipakai` to `Pembagian Tugas SiPesek`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `galat()` (e.g. with ``/cek` Formulir 3 langkah (Aqil)` and `Masuk dengan Google dan data anak (Aqil)`) actually correct?**
  _`galat()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `backend`, `nextConfig` to the rest of the system?**
  _300 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `agregasi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `seed.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07439024390243902 - nodes in this community are weakly interconnected._