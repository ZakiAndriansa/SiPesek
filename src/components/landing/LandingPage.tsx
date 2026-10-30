import { JALUR } from "@/lib/jalur";
import { PORSI_JALUR, TAHUN_PORSI } from "@/lib/porsi-jalur";
import { Accordion } from "../accordion/Accordion";
import { Button } from "../button/Button";
import { SectionHeading } from "../section-heading/SectionHeading";

const VALUES = [
  {
    className: "landing-value-card--lavender",
    title: "Bahasa\nSehari-hari",
    text: "Istilah seperti KETM, afirmasi, dan domisili selalu dijelaskan dalam satu kalimat.",
    glyph: "/assets/landing-glyph-lavender.svg",
  },
  {
    className: "landing-value-card--sun",
    title: "Sesuai\nKondisi Anak",
    text: "Jalur yang disarankan menyesuaikan nilai rapor, alamat rumah, dan status keluarga.",
    glyph: "/assets/landing-glyph-sun.svg",
  },
  {
    className: "landing-value-card--sky",
    title: "Jujur soal\nPeluang",
    text: "Label Peluang besar, Masih mungkin, atau Peluang kecil selalu disertai alasan. Perkiraan, bukan jaminan.",
    glyph: "/assets/landing-glyph-sky.svg",
  },
  {
    className: "landing-value-card--lime",
    title: "Riwayat\nTersimpan",
    text: "Masuk dengan Google untuk menyimpan hasil tiap anak dan melihatnya lagi kapan saja.",
    glyph: "/assets/landing-glyph-lime.svg",
  },
];

const PATH_STYLE = {
  DOMISILI: { chip: "Paling umum", color: "landing-path-card--sky", squiggle: "domisili" },
  AFIRMASI: { chip: "Kartu bantuan & disabilitas", color: "landing-path-card--lime", squiggle: "afirmasi" },
  PRESTASI: { chip: "Rapor & prestasi", color: "landing-path-card--yellow", squiggle: "prestasi" },
  MUTASI: { chip: "Pindah tugas & anak guru", color: "landing-path-card--lavender", squiggle: "mutasi" },
} as const;
const PATHS = JALUR.filter((j) => j.kode in PATH_STYLE).map((j) => ({
  // Judul memakai nama resmi jalur ("Jalur Domisili"); penjelasan sehari-hari ada di deskripsi.
  title: `Jalur ${j.namaTampilan.match(/\(([^)]+)\)$/)?.[1] ?? j.namaTampilan}`,
  description: j.deskripsi,
  porsi: PORSI_JALUR[j.kode as keyof typeof PATH_STYLE],
  ...PATH_STYLE[j.kode as keyof typeof PATH_STYLE],
}));
const FAQS: readonly (readonly [q: string, a?: string])[] = [
  [
    "Apakah hasil ini menjamin anak pasti diterima?",
    "Tidak. SiPesek memperkirakan peluang dari hasil SPMB 2026 (daya tampung, jarak, dan nilai pendaftar yang diterima). Ini bukan aplikasi resmi dan bukan jaminan. Pendaftaran tetap dilakukan lewat portal SPMB Dinas Pendidikan.",
  ],
  [
    "Apakah data keluarga kami aman?",
    "Cek Cepat tidak menyimpan apa pun: isian hilang saat tab ditutup. Data anak yang diisi setelah masuk hanya dipakai untuk menghitung peluang dan hanya terlihat oleh akun itu.",
  ],
  [
    "Apakah harus membuat akun?",
    "Tidak harus. Cek Cepat bisa dipakai tanpa akun dan hasilnya tidak disimpan. Masuk dengan akun Google hanya perlu bila Bapak/Ibu ingin menyimpan data anak dan riwayat hasil.",
  ],
  [
    "Apakah ada biaya untuk memakai SiPesek?",
    "Tidak ada. SiPesek gratis untuk orang tua.",
  ],
];
function CloudEdge({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`landing-cloud-edge${flip ? " landing-cloud-edge--flip" : ""}`} aria-hidden="true">
      <span />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="landing-hero-visual" aria-hidden="true">
      <img className="landing-hero-blob" src="/assets/landing-flower.svg" alt="" />
      <img className="landing-hero-image landing-hero-image--boy" src="/assets/landing-boy.png" alt="" />
      <img className="landing-hero-image landing-hero-image--girl" src="/assets/landing-girl.png" alt="" />
      <img className="landing-hero-image landing-hero-image--school" src="/assets/landing-school.png" alt="" />
      <img className="landing-squiggle landing-squiggle--purple" src="/assets/landing-squiggle-purple.svg" alt="" />
      <img className="landing-squiggle landing-squiggle--yellow" src="/assets/landing-squiggle-yellow.svg" alt="" />
    </div>
  );
}

function ValueSection() {
  return (
    <section className="landing-section landing-values">
      <SectionHeading
        center
        title={<>Dibuat untuk orang tua.<br />Jujur soal peluang.</>}
        desc="Semua dirancang agar memilih sekolah terasa tenang dan masuk akal — dengan angka yang jelas dan penjelasan yang mudah dipahami."
      />
      <div className="landing-value-grid">
        {VALUES.map((item) => (
          <article className={`landing-value-card ${item.className}`} key={item.title}>
            <img className="landing-glyph" src={item.glyph} alt="" aria-hidden="true" />
            <div>
              <h3>{item.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PathsSection() {
  return (
    <section className="landing-section landing-paths">
      <SectionHeading
        title={<>Jalur mana yang paling<br />cocok untuk anak?</>}
        desc="Empat jalur SPMB dengan kuota dan syarat masing-masing. Porsinya berbeda untuk SMA dan SMK, dan SMAN 1 Depok memakai seleksi unggulan tersendiri. SiPesek mencocokkan kondisi anak dengan jalur yang paling realistis."
        action={
          <Button variant="secondary" href="/panduan#jalur">
            Panduan Lengkap ↗
          </Button>
        }
      />
      <div className="landing-path-grid">
        {PATHS.map((path) => (
          <article className="landing-path-card" key={path.title}>
            <span className="landing-chip">{path.chip}</span>
            <h3>{path.title}</h3>
            <p>{path.description}</p>
            <div className={`landing-path-visual ${path.color}`}>
              {/* Porsi SMA dan SMK berbeda jauh, jadi keduanya ditampilkan terpisah. */}
              <div className="landing-path-porsi">
                <span><strong>{path.porsi.SMA}%</strong>SMA</span>
                <span><strong>{path.porsi.SMK}%</strong>SMK</span>
              </div>
              <img className={`landing-path-squiggle landing-path-squiggle--${path.squiggle}`} src={`/assets/landing-squiggle-${path.squiggle}.svg`} alt="" aria-hidden="true" />
              <small>siswa diterima di Depok {TAHUN_PORSI}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const STRATEGY_STEPS = [
  { title: "Nilai rapor rata-rata", accent: "Peluang terbaik lewat Jalur Domisili", chips: ["Jarak rumah ke sekolah", "Titik rumah di peta", "Alamat sesuai KK"], icon: "/assets/landing-icon-home.svg", color: "sky" },
  { title: "Keluarga penerima bantuan (KETM)", accent: "Lebih aman lewat Jalur Afirmasi", chips: ["Kartu bantuan", "Terdaftar di data bantuan pemerintah (DTSEN)", "Anak berkebutuhan khusus"], icon: "/assets/landing-icon-heart.svg", color: "lime" },
  { title: "Anak berprestasi", accent: "Pertimbangkan Jalur Prestasi", chips: ["Rapor semester 1–5", "Nilai TKA (SMA)", "Kelas industri (SMK)"], icon: "/assets/landing-icon-trophy.svg", color: "yellow" },
];

function StrategySection() {
  return (
    <section className="landing-section landing-strategy" id="cara-kerja">
      <div className="landing-strategy-copy">
        <h2>Strategi yang tepat untuk setiap anak.</h2>
        <p>Setiap anak punya kondisi berbeda. SiPesek membaca alamat, status keluarga, dan nilai (bila diisi), lalu menunjukkan jalur dengan peluang paling besar.</p>
        <Button variant="primary" lg href="/cek-cepat">Cek Peluang Anak</Button>
      </div>
      <div className="landing-timeline">
        <div className="landing-timeline-line" aria-hidden="true" />
        {STRATEGY_STEPS.map((step) => (
          <article className="landing-timeline-step" key={step.title}>
            <span className="landing-timeline-dot" aria-hidden="true" />
            <div className="landing-timeline-content">
              <h3>{step.title}</h3>
              <h4>{step.accent}</h4>
              <div className="landing-timeline-chips">
                {step.chips.map((chip) => <span key={chip}>{chip}</span>)}
              </div>
            </div>
            <span className={`landing-timeline-icon landing-timeline-icon--${step.color}`} aria-hidden="true"><img src={step.icon} alt="" /></span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DataSection() {
  return (
    <section className="landing-section landing-data">
      <div className="landing-data-card">
        <img src="/assets/landing-school-photo.png" alt="Gedung sekolah dan halaman hijau" />
        <div className="landing-data-copy">
          <h2>Dihitung dari data, dijelaskan dengan bahasa sehari-hari.</h2>
          <p>Peluang dihitung dari hasil seleksi SPMB 2026, daya tampung setiap sekolah, dan jarak rumah di Kota Depok. Setiap angka disertai alasan yang bisa dibaca orang tua.</p>
          <h3>Hasil SPMB 2026</h3>
          <span>Ringkasan per sekolah, tanpa nama dan NISN anak</span>
          <div className="landing-highlight">Hasil adalah perkiraan berdasarkan data tahun lalu, bukan jaminan diterima.</div>
          <div className="landing-data-stats">
            <div><strong>20</strong><span><i />SMA/SMK Negeri</span></div>
            <div><strong>7.104</strong><span><i />Daya tampung 2026</span></div>
            <div><strong>2 cara</strong><span><i />Cek Cepat atau masuk</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="landing-section landing-faq">
      <SectionHeading
        center
        title={<>Pertanyaan yang sering<br />diajukan.</>}
        desc="Segala hal tentang cara menghitung peluang, keamanan data, dan akun."
      />
      <Accordion items={FAQS} openFirst noHint />
    </section>
  );
}

function CtaSection({ cta }: { cta: LandingCta }) {
  return (
    <section className="landing-cta-wrap">
      <div className="landing-cta">
        <img className="landing-cta-image landing-cta-image--boy" src="/assets/landing-cta-boy.png" alt="" aria-hidden="true" />
        <img className="landing-cta-image landing-cta-image--girl" src="/assets/landing-cta-girl.png" alt="" aria-hidden="true" />
        <div className="landing-cta-content">
          <h2>Siapkan pilihan sekolah<br />sebelum mendaftar.</h2>
          <p>Cek Cepat tanpa akun, atau masuk untuk menyimpan riwayat. Dapatkan gambaran peluang yang jelas di tiap sekolah.</p>
          <div>
            <Button variant="inverse" lg href={cta.href}>{cta.ctaLabel}</Button>
            <Button variant="inverse-outline" lg href={cta.secondary?.href ?? "/panduan"}>{cta.secondary?.label ?? "Pelajari Panduan Jalur"}</Button>
          </div>
        </div>
        <div className="landing-cta-cloud" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      </div>
    </section>
  );
}
export type LandingCta = {
  href: string;
  label: string;
  ctaLabel: string;
  /** Tombol kedua (tamu: masuk dan simpan riwayat). */
  secondary?: { href: string; label: string };
  /** Keterangan di bawah tombol hero (tamu: NISN yang perlu disiapkan). */
  hint?: string;
  trust?: string;
};

/** cta: tamu ke Cek Cepat atau Masuk; orang tua yang sudah login langsung ke tahap berikutnya anaknya. */
export function LandingPage({ cta }: { cta: LandingCta }) {
  return (
    <>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow"><i />Persiapan SPMB 2027 · Kota Depok</span>
          <h1><em>Anak bisa masuk</em><span>SMA/SMK negeri mana?</span></h1>
          <p>Masukkan tempat tinggal dan nilai rapor anak, lalu lihat peluangnya di tiap sekolah negeri di Depok, beserta sekolah swasta terdekat sebagai cadangan.</p>
          <div className="landing-hero-actions">
            <Button variant="primary" lg href={cta.href}>{cta.label}</Button>
            {cta.secondary ? (
              <Button variant="secondary" lg href={cta.secondary.href}>{cta.secondary.label}</Button>
            ) : (
              <Button variant="secondary" lg href="#cara-kerja">Lihat Cara Kerja</Button>
            )}
          </div>
          {cta.hint && <small className="landing-trust landing-trust--hint">{cta.hint}</small>}
          {cta.trust && <small className="landing-trust">{cta.trust}</small>}
        </div>
        <HeroVisual />
      </section>
      <ValueSection />
      <CloudEdge />
      <PathsSection />
      <CloudEdge flip />
      <StrategySection />
      <DataSection />
      <FaqSection />
      <CtaSection cta={cta} />
    </>
  );
}
