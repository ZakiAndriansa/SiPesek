import type { Metadata } from "next";
import {
  Badge,
  Button,
  ButtonGroup,
  Alert,
  Card,
  SectionHeading,
  Tabs,
  Container,
  PageHeader,
  Section,
  CtaBand,
  MoreLink,
} from "@/components";
import { ctaUntuk } from "@/components/landing/cta";
import { JALUR } from "@/data/jalur";
import { PORSI_JALUR, TAHUN_PORSI } from "@/lib/porsi-jalur";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Panduan Jalur",
  description:
    "Penjelasan empat jalur SPMB, berkas yang perlu disiapkan, dan cara SiPesek menghitung peluang anak diterima.",
};

// Persen = porsi siswa yang diterima di Depok tahun lalu, sama dengan landing page (src/lib/porsi-jalur.ts).
const porsi = (p: { SMA: number; SMK: number }) => `SMA ${p.SMA}% · SMK ${p.SMK}%`;
const WARNA: Record<string, string> = {
  domisili: "card--sky",
  afirmasi: "card--lime",
  prestasi: "card--sun",
  mutasi: "card--lavender",
};

export default async function PanduanPage() {
  const cta = ctaUntuk(await getSession());
  return (
    <Container>

      <PageHeader
        art="guide"
        title="Panduan Jalur SPMB"
        desc="Kenali empat jalur SPMB, berkas yang perlu disiapkan, dan cara SiPesek menghitung peluang anak diterima."
      />

      {/* 4 Jalur Cards in Toy Colors */}
      <Section id="jalur">
        <SectionHeading
          title="Empat Jalur Pendaftaran Resmi"
          desc={`Persen di tiap kartu adalah porsi siswa yang diterima lewat jalur itu di SMA dan SMK negeri Depok tahun ${TAHUN_PORSI}. SMAN 1 Depok memakai seleksi unggulan tersendiri.`}
        />
        <div className="card-grid">
          {JALUR.map((j) => (
            <Card
              key={j.id}
              title={j.title}
              icon={j.icon}
              text={j.desc}
              id={j.id}
              className={WARNA[j.id]}
              meta={
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%" }}>
                  <Badge kind="neutral">{porsi(PORSI_JALUR[j.kode])}</Badge>
                  <Badge kind="neutral">{j.ciri}</Badge>
                </div>
              }
              footer={<p className="card__cocok">{j.cocok}</p>}
            />
          ))}
        </div>
      </Section>

      {/* Dokumen Tab */}
      <Section id="dokumen">
        <SectionHeading
          title="Dokumen yang Perlu Disiapkan"
          desc="Daftar berkas penting sesuai jalur yang dipilih. Siapkan fotokopi dan scan digital sedini mungkin. Daftar ini ringkasan; syarat lengkap mengikuti juknis SPMB Jawa Barat tahun berjalan."
        />
        <div className="card">
          <Tabs
            label="Dokumen per jalur"
            tabs={JALUR.map((j) => ({
              id: j.id,
              label: j.title.replace(/^Jalur /, ""),
              content: (
                <ul className="list">
                  {j.docs.map((d) => (
                    <li key={d} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ color: "var(--color-primary-text)", marginTop: "2px", fontWeight: "700" }}>✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ),
            }))}
          />
        </div>
      </Section>

      {/* Cara Peluang Dihitung */}
      <Section id="cara-hitung">
        <SectionHeading
          title="Bagaimana Peluang Dihitung?"
          desc={`SiPesek membandingkan kondisi anak dengan siswa yang diterima di SPMB ${TAHUN_PORSI}, dalam tiga langkah.`}
        />
        <div className="stack stack--lg">
          <div className="card-grid card-grid--3">
            <div className="card" style={{ background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>1</span>
                <h4 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Cek jalur yang terbuka</h4>
              </div>
              <p className="card__text">
                Dari alamat, status keluarga, dan nilai, SiPesek melihat jalur yang bisa dipakai anak di tiap sekolah.
              </p>
            </div>

            <div className="card" style={{ background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>2</span>
                <h4 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Bandingkan dengan yang diterima</h4>
              </div>
              <p className="card__text">
                Jarak rumah dibandingkan dengan jarak siswa yang diterima, dan nilai dibandingkan dengan nilai mereka.
              </p>
            </div>

            <div className="card" style={{ background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>3</span>
                <h4 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Beri label beserta alasannya</h4>
              </div>
              <p className="card__text">
                Tiap sekolah mendapat label Peluang besar, Masih mungkin, atau Peluang kecil, lengkap dengan alasannya.
              </p>
            </div>
          </div>

          <div className="card-grid card-grid--3">
            <div className="card" style={{ borderLeft: "4px solid var(--color-success-text)" }}>
              <Badge kind="aman" lg />
              <p className="card__text" style={{ marginTop: "12px" }}>
                Jarak atau nilai anak sama atau lebih baik dari separuh siswa yang diterima tahun {TAHUN_PORSI}. Cocok sebagai pilihan aman.
              </p>
            </div>
            <div className="card" style={{ borderLeft: "4px solid var(--color-warning-text)" }}>
              <Badge kind="bersaing" lg />
              <p className="card__text" style={{ marginTop: "12px" }}>
                Masih di dalam rentang siswa yang diterima, tapi di bawah separuhnya. Bergantung pada pendaftar tahun ini. Cocok untuk satu pilihan ambisius.
              </p>
            </div>
            <div className="card" style={{ borderLeft: "4px solid var(--color-danger-text)" }}>
              <Badge kind="berisiko" lg />
              <p className="card__text" style={{ marginTop: "12px" }}>
                Di luar rentang siswa yang diterima tahun {TAHUN_PORSI}. Sebaiknya bukan satu-satunya pilihan. Siapkan sekolah swasta terdekat sebagai cadangan.
              </p>
            </div>
          </div>

          <Alert kind="warning" title="Perkiraan, bukan jaminan">
            Hasil dihitung dari data SPMB {TAHUN_PORSI}. Hasil tahun ini bergantung pada jumlah pendaftar, dan pendaftaran tetap lewat portal resmi SPMB Dinas Pendidikan.
          </Alert>
        </div>
      </Section>

      {/* Privasi: ringkas di sini, rinciannya hanya di /privasi */}
      <Section id="privasi">
        <Card
          icon="shield"
          title="Data keluarga tetap aman"
          text="Data anak hanya dipakai untuk menghitung peluang dan tidak dijual. Cek Cepat tidak menyimpan apa pun."
          footer={<MoreLink href="/privasi">Baca kebijakan privasi</MoreLink>}
        />
      </Section>

      {/* CTA Band: sama dengan penutup beranda, menyesuaikan status masuk */}
      <Section>
        <CtaBand
          title="Siapkan pilihan sekolah sebelum mendaftar."
          text={
            cta.secondary
              ? "Cek Cepat tanpa akun, atau masuk untuk menyimpan riwayat."
              : "Dapatkan gambaran peluang yang jelas di tiap sekolah."
          }
        >
          <ButtonGroup>
            <Button variant="primary" href={cta.href} icon="arrow-right">
              {cta.ctaLabel}
            </Button>
            {cta.secondary && (
              <Button variant="secondary" href={cta.secondary.href}>
                {cta.secondary.label}
              </Button>
            )}
          </ButtonGroup>
        </CtaBand>
      </Section>
    </Container>
  );
}
