import type { Metadata } from "next";
import {
  Badge,
  Button,
  ButtonGroup,
  MoreLink,
  Alert,
  Accordion,
  Table,
  Container,
  NextStep,
  PageHeader,
  RankList,
  Disclaimer,
} from "@/components";
import { strategySchools } from "@/data/schools";
import { StrategiOrtu } from "@/features/ortu/StrategiOrtu";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Strategi Pilihan Sekolah · SiPesek",
  description: "Rekomendasi urutan sekolah negeri terbaik untuk anak Anda.",
};

export default async function StrategiPage() {
  const session = await getSession();
  // Akun Google: strategi dari hasil cek tersimpan. Akun contoh tetap memakai data prototipe.
  if (session?.account === "google") {
    return (
      <Container>
        <StrategiOrtu />
      </Container>
    );
  }
  const first = (session?.child?.name ?? "anak").split(" ")[0];
  return (
    <Container>
      <PageHeader
        art="strategy"
        title={`Strategi untuk ${first}`}
        desc="Urutan pilihan yang kami sarankan berdasarkan data resmi dan aturan terbaru. Bapak/Ibu bebas menyesuaikan urutan."
      />
      <div className="stack stack--lg stack--strategi" data-reveal-group="">
        {/* Strategy Hero Probability Card */}
        <div className="strategy-hero">
          <div className="strategy-hero__top">
            <div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-primary-text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Analisis Rekomendasi
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  marginTop: "4px",
                }}
              >
                Peluang Diterima di Sekolah Negeri: Sangat Tinggi
              </h2>
            </div>
            <Badge kind="aman" lg>
              Peluang 80-92%
            </Badge>
          </div>
          <p style={{ color: "var(--color-ink-soft)", fontSize: "15px", lineHeight: "1.6" }}>
            Kombinasi 1 pilihan impian dan 2 pilihan zona aman menjaga agar {first} memiliki proteksi maksimal
            tanpa mengorbankan peluang masuk ke sekolah favorit.
          </p>
          <div className="strategy-hero__meter">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "var(--color-ink-muted)",
                fontWeight: 500,
              }}
            >
              <span>Perkiraan Peluang Masuk</span>
              <strong style={{ color: "var(--color-success-text)" }}>86% Rata-rata Peluang</strong>
            </div>
            <div className="strategy-hero__bar-bg">
              <div className="strategy-hero__bar-fill" style={{ width: "86%" }} />
            </div>
          </div>
        </div>

        {/* Pilihan Sekolah */}
        <section className="stack">
          <div className="block-head">
            <h2 className="text-heading-md">Pilihan Sekolah</h2>
            <p className="text-secondary">
              Aturan resmi: boleh memilih hingga 3 sekolah. Gunakan tombol panah untuk menukar urutan prioritas.
            </p>
          </div>
          <RankList
            items={strategySchools().map(({ role, school }) => ({
              name: school.name,
              role,
              jalur: school.jalur,
              kind: school.kind,
            }))}
          />
        </section>

        {/* Kenapa kombinasi ini? */}
        <Accordion
          items={[
            [
              "Kenapa kombinasi 1 Pilihan Ambisius + 2 Pilihan Aman?",
              `Satu pilihan ambisius memberi kesempatan emas untuk mencoba sekolah unggulan yang diinginkan anak. Dua pilihan berpeluang besar menjaga agar ${first} tetap mendapatkan bangku sekolah negeri yang layak bila kuota pilihan pertama terlampaui.`,
            ],
            [
              "Bagaimana jika urutan ini ingin diubah?",
              "Bapak/Ibu berhak mengubah urutan sesuai aspirasi anak. Cukup klik tombol panah naik atau turun pada kartu sekolah di atas. Pilihan nomor 1 akan menjadi prioritas utama saat sistem seleksi SPMB memproses berkas.",
            ],
          ]}
          openFirst
        />

        {/* Tabel Perbandingan Jalur */}
        <section className="stack">
          <div className="block-head">
            <h2 className="text-heading-md">Jalur Mana yang Paling Menguntungkan?</h2>
            <p className="text-secondary">Berdasarkan berkas {first}, ada 2 jalur yang memenuhi kriteria pendaftaran.</p>
          </div>
          <Table
            caption={`Perbandingan Jalur Masuk ${first}`}
            head={["Jalur Pendaftaran", "Estimasi Peluang & Catatan"]}
            rows={[
              [
                <>
                  <strong style={{ display: "block", color: "var(--color-ink)" }}>
                    Jalur dekat rumah (Domisili)
                  </strong>
                  <span style={{ fontSize: "13px", color: "var(--color-ink-muted)" }}>
                    Jarak 0,8 km dari sekolah
                  </span>
                </>,
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Badge kind="aman" /> <strong style={{ color: "var(--color-success-text)" }}>80-92%</strong>
                    <Badge kind="brand">Sangat Disarankan</Badge>
                  </div>
                  <span className="table__muted">
                    Paling menguntungkan karena jarak rumah {first} sangat dekat dan berada dalam radius aman kuota tahun lalu.
                  </span>
                </>,
              ],
              [
                <>
                  <strong style={{ display: "block", color: "var(--color-ink)" }}>
                    Jalur nilai & prestasi (Prestasi)
                  </strong>
                  <span style={{ fontSize: "13px", color: "var(--color-ink-muted)" }}>
                    Nilai rata-rata rapor: 88,4
                  </span>
                </>,
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Badge kind="bersaing" /> <strong style={{ color: "var(--color-warning-text)" }}>45-60%</strong>
                  </div>
                  <span className="table__muted">
                    Bagus untuk satu pilihan ambisius di sekolah favorit tanpa membebani pilihan kedua dan ketiga.
                  </span>
                </>,
              ],
            ]}
          />
        </section>

        {/* Sekolah Cadangan Alert */}
        <Alert
          kind="info"
          title="Opsi Sekolah Cadangan Swasta"
          action={
            <MoreLink href="/cadangan">
              Lihat 6 sekolah swasta berkualitas dekat rumah →
            </MoreLink>
          }
        >
          Peluang negeri {first} sangat tinggi, sehingga sekolah swasta cadangan tidak wajib diambil saat ini. Namun, Bapak/Ibu tetap dapat memantau opsi swasta terakreditasi sebagai jaring pengaman keluarga.
        </Alert>

        <Disclaimer />

        <NextStep
          step="Tahap 4 dari 4"
          title="Bawa strategi ini saat mendaftar"
          text="Unduh ringkasan 1 halaman dan centang dokumen yang perlu disiapkan."
          href="/unduhan"
          label="Buka Dokumen"
        />
      </div>
    </Container>
  );
}

