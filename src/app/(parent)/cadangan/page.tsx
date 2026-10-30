import type { Metadata } from "next";
import {
  Button,
  Alert,
  SchoolCard,
  Breadcrumb,
  Select,
  Container,
  PageHeader,
  Toolbar,
} from "@/components";
import { PRIVATE_SCHOOLS } from "@/data/schools";

export const metadata: Metadata = {
  title: "Sekolah Swasta Cadangan · SiPesek",
  description: "Rekomendasi sekolah swasta terakreditasi sebagai jaring pengaman keluarga tanpa bias komersial.",
};

export default function CadanganPage() {
  return (
    <Container>
      <Breadcrumb items={[["Strategi", "/strategi"], ["Sekolah Cadangan"]]} />
      <PageHeader
        art="backup"
        title="Sekolah Swasta Cadangan"
        desc="Pilihan cadangan berkualitas bila kuota sekolah negeri tidak mencukupi. Ditampilkan secara objektif dan netral tanpa iklan berbayar."
      />
      <div className="stack stack--lg">
        <Alert kind="warning" title="Pendaftaran sekolah swasta umumnya dibuka lebih awal">
          Sebagian besar SMA/SMK swasta favorit memulai gelombang penerimaan sebelum jadwal SPMB sekolah negeri dimulai. Disarankan untuk memantau jadwal dan syarat uang muka tiap sekolah cadangan sejak dini.
        </Alert>

        <Toolbar>
          <Select
            id="f-biaya"
            label="Biaya SPP Maksimal / Bulan"
            options={["Semua biaya", "Rp 300.000", "Rp 500.000", "Rp 800.000"]}
          />
          <Select
            id="f-jarak2"
            label="Radius Jarak dari Rumah"
            options={["Semua jarak", "Sampai 3 km", "Sampai 6 km"]}
          />
        </Toolbar>

        <div className="card-grid card-grid--3">
          {PRIVATE_SCHOOLS.map((p) => (
            <SchoolCard
              key={p.id}
              name={p.name}
              type="SMA · Swasta"
              kec={p.kec}
              kind="neutral"
              badgeText={`Akreditasi ${p.akreditasi}`}
              facts={[
                ["SPP per bulan", p.spp],
                ["Uang pangkal", p.pangkal],
              ]}
              reason={`Akreditasi ${p.akreditasi} · ${p.beasiswa} · Jarak ${p.jarak} dari rumah`}
            >
              <Button
                variant="secondary"
                block
                toast={{
                  message: `${p.name} berhasil disimpan sebagai daftar cadangan.`,
                  variant: "success",
                }}
              >
                Simpan sebagai Cadangan
              </Button>
            </SchoolCard>
          ))}
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderRadius: "16px",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border-subtle)",
            color: "var(--color-ink-soft)",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          ℹ️ Biaya SPP dan uang pangkal di atas adalah perkiraan berdasarkan data survei per 2 Oktober 2026. Skema beasiswa, potongan biaya gelombang awal, dan fasilitas resmi dapat dikonfirmasi langsung ke tata usaha sekolah terkait.
        </div>
      </div>
    </Container>
  );
}

