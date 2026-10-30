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
  Icon,
} from "@/components";
import { JALUR } from "@/data/jalur";

export const metadata: Metadata = {
  title: "Panduan Jalur",
  description:
    "Penjelasan 4 jalur seleksi SPMB, berkas dokumen yang dibutuhkan, cara kalkulasi peluang, dan perlindungan privasi data.",
};

const TOY_COLOR_MAP: Record<string, { colorClass: string; kuota: string; tag: string }> = {
  domisili: { colorClass: "card--sky", kuota: "Kuota ±50%", tag: "Paling Umum" },
  afirmasi: { colorClass: "card--lime", kuota: "Kuota ±15%", tag: "KETM & Disabilitas" },
  prestasi: { colorClass: "card--sun", kuota: "Kuota ±30%", tag: "Rapor & Sertifikat" },
  mutasi: { colorClass: "card--lavender", kuota: "Kuota ±5%", tag: "Pindah Tugas" },
};

export default function PanduanPage() {
  return (
    <Container>
      
      <PageHeader
        art="guide"
        title="Panduan Jalur SPMB"
        desc="Pahami setiap jalur pendaftaran, persyaratan berkas resmi, dan cara SIPESEK mengalkulasi peluang kelulusan anak Anda dengan tenang."
      />

      {/* 4 Jalur Cards in Toy Colors */}
      <Section id="jalur">
        <SectionHeading
          title="Empat Jalur Pendaftaran Resmi"
          desc="Setiap calon siswa memilih satu jalur utama saat pendaftaran dibuka. Kenali ketentuan dan persentase kuotanya untuk menentukan opsi paling aman."
        />
        <div className="card-grid">
          {JALUR.map((j) => {
            const extra = TOY_COLOR_MAP[j.id] || { colorClass: "", kuota: "", tag: "" };
            return (
              <Card
                key={j.id}
                title={j.title}
                icon={j.icon}
                text={j.desc}
                id={j.id}
                className={extra.colorClass}
                meta={
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%" }}>
                    <Badge kind="neutral">{extra.kuota}</Badge>
                    <Badge kind="neutral">{extra.tag}</Badge>
                  </div>
                }
                footer={<p className="card__cocok">{j.cocok}</p>}
              />
            );
          })}
        </div>
      </Section>

      {/* Dokumen Tab */}
      <Section id="dokumen">
        <SectionHeading
          title="Dokumen yang Perlu Disiapkan"
          desc="Daftar berkas penting sesuai jalur yang dipilih. Siapkan fotokopi dan scan digital sedini mungkin."
        />
        <div className="card">
          <Tabs
            label="Dokumen per jalur"
            tabs={JALUR.map((j) => ({
              id: j.id,
              label: j.title.split("(")[1]?.replace(")", "") || j.title,
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
          desc="SIPESEK mengolah data historis seleksi tahun lalu secara transparan melalui lima tahapan ilmiah."
        />
        <div className="stack stack--lg">
          <div className="card-grid card-grid--3">
            <div className="card" style={{ background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>1</span>
                <h4 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Verifikasi Kelayakan</h4>
              </div>
              <p className="card__text">
                Mencocokkan profil anak (jarak, nilai rapor, atau status bantuan) dengan kriteria teknis setiap jalur.
              </p>
            </div>

            <div className="card" style={{ background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>2</span>
                <h4 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Simulasi Peringkat</h4>
              </div>
              <p className="card__text">
                Membandingkan data anak dengan batas nilai cut-off dan radius jarak terjauh yang diterima tahun lalu.
              </p>
            </div>

            <div className="card" style={{ background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "36px", height: "36px", borderRadius: "999px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>3</span>
                <h4 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>Kompilasi Rekomendasi</h4>
              </div>
              <p className="card__text">
                Menyajikan estimasi status (Peluang Besar, Bersaing, Berisiko) dengan penjelasan alasan konkret.
              </p>
            </div>
          </div>

          <div className="card-grid card-grid--3">
            <div className="card" style={{ borderLeft: "4px solid var(--color-success-text)" }}>
              <Badge kind="aman" lg />
              <p className="card__text" style={{ marginTop: "12px" }}>
                Peluang tinggi di atas ambang aman historis. Sangat direkomendasikan sebagai Pilihan Utama.
              </p>
            </div>
            <div className="card" style={{ borderLeft: "4px solid var(--color-warning-text)" }}>
              <Badge kind="bersaing" lg />
              <p className="card__text" style={{ marginTop: "12px" }}>
                Peluang seimbang. Posisi anak berada di dekat kuota tengah. Cocok untuk Pilihan Cadangan.
              </p>
            </div>
            <div className="card" style={{ borderLeft: "4px solid var(--color-danger-text)" }}>
              <Badge kind="berisiko" lg />
              <p className="card__text" style={{ marginTop: "12px" }}>
                Peluang kecil atau di luar radius aman. Perlu opsi alternatif atau sekolah swasta berkualitas.
              </p>
            </div>
          </div>

          <Alert kind="warning" title="Estimasi Ilmiah, Bukan Jaminan Resmi">
            Kalkulasi ini dirancang sebagai panduan strategi bagi keluarga. Hasil seleksi sesungguhnya bergantung pada sebaran kompetisi pendaftar di portal resmi SPMB Dinas Pendidikan tahun berjalan.
          </Alert>
        </div>
      </Section>

      {/* Privasi & Keamanan Data */}
      <Section id="privasi">
        <SectionHeading
          title="Keamanan & Privasi Data Keluarga"
          desc="Kami memprioritaskan privasi Anda dengan komitmen zero-selling dan enkripsi menyeluruh."
        />
        <div className="card" style={{ background: "var(--color-surface)" }}>
          <div className="card-grid" style={{ gap: "24px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="shield" />
              </span>
              <div>
                <strong style={{ display: "block", marginBottom: "4px", color: "var(--color-ink)" }}>Tanpa NIK & Berkas Sensitif</strong>
                <p className="card__text">Cukup masukkan nama panggilan, alamat umum, dan rata-rata rapor tanpa perlu mengunggah dokumen KTP/KK asli.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--color-primary-tint)", color: "var(--color-primary-text)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="check" />
              </span>
              <div>
                <strong style={{ display: "block", marginBottom: "4px", color: "var(--color-ink)" }}>Bebas Iklan & Tidak Dijual</strong>
                <p className="card__text">Layanan SIPESEK murni didedikasikan untuk membantu masa depan pendidikan anak Indonesia secara objektif.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Band */}
      <Section>
        <CtaBand
          title="Sudah Memahami Jalur yang Tepat?"
          text="Mulai kalkulasi peluang anak Anda di SMA/SMK Negeri impian sekarang juga. Hanya butuh waktu 8 menit."
        >
          <ButtonGroup>
            <Button variant="primary" href="/cek-cepat" icon="arrow-right">
              Cek Cepat dengan NISN
            </Button>
            <Button variant="secondary" href="/masuk">
              Masuk & Simpan Progres
            </Button>
          </ButtonGroup>
        </CtaBand>
      </Section>
    </Container>
  );
}
