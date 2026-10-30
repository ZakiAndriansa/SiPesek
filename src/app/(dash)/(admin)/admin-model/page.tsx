import type { Metadata } from "next";
import {
  Button,
  Alert,
  Table,
  Toggle,
  Dialog,
  Form,
  Field,
  PageHeader,
  DashSection,
  Toolbar,
} from "@/components";

export const metadata: Metadata = {
  title: "Konfigurasi Model Peluang",
  description: "Konfigurasi Model Peluang",
};

export default function AdminModelPage() {
  return (
    <>
      <PageHeader
        title="Konfigurasi model peluang"
        desc="Ambang label dan aturan tampil. Nilai awal perlu dikalibrasi dengan data nyata."
      />
      <Form toast="Pengaturan model tersimpan.">
        <DashSection
          title="Ambang label"
          desc="Label Peluang kecil berlaku untuk peluang di bawah ambang Masih mungkin."
        >
          <Toolbar>
            <Field
              id="amb-aman"
              label="Peluang besar mulai dari (%)"
              type="number"
              defaultValue="75"
              inputMode="numeric"
              min="0"
              max="100"
            />
            <Field
              id="amb-bersaing"
              label="Masih mungkin mulai dari (%)"
              type="number"
              defaultValue="40"
              inputMode="numeric"
              min="0"
              max="100"
            />
          </Toolbar>
        </DashSection>
        <DashSection title="Aturan tampil">
          <Toggle label="Tampilkan sekolah swasta cadangan otomatis" checked />
          <Toolbar>
            <Field
              id="amb-cadangan"
              label="Tampilkan cadangan bila peluang negeri di bawah (%)"
              type="number"
              defaultValue="50"
              inputMode="numeric"
              min="0"
              max="100"
            />
            <Field
              id="amb-agregasi"
              label="Ambang agregasi minimum (pengguna)"
              type="number"
              defaultValue="10"
              inputMode="numeric"
              min="1"
            />
          </Toolbar>
        </DashSection>
        <div className="button-group">
          <Button variant="primary" type="submit">
            Simpan Pengaturan
          </Button>
        </div>
      </Form>
      <DashSection
        title="Hitung ulang peluang"
        desc="Hasil bisa ditinjau dulu sebelum dipublikasikan ke orang tua."
      >
        <Alert kind="success" title="Perhitungan terakhir selesai">
          14 Okt 2026, 09.12 · 4 menit · versi model 1.2
        </Alert>
        <Table
          caption="Sebaran label sebelum dan sesudah"
          head={["Label", "Sebelum", "Sesudah"]}
          rows={[
            [<>Peluang besar</>, <>38%</>, <>41%</>],
            [<>Masih mungkin</>, <>34%</>, <>33%</>],
            [<>Peluang kecil</>, <>28%</>, <>26%</>],
          ]}
          num={[1, 2]}
          compact={true}
        />
        <div className="button-group">
          <Button
            variant="secondary"
            iconLeft="refresh"
            toast={{
              message:
                "Perhitungan dimulai. Anda akan diberi tahu bila selesai.",
              variant: "info",
            }}
          >
            Hitung Ulang
          </Button>
          <Button variant="primary" opens="dlg-model">
            Publikasikan ke Orang Tua
          </Button>
        </div>
      </DashSection>
      <Dialog
        id="dlg-model"
        title="Publikasikan hasil ini?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button
              variant="primary"
              closes
              toast={{
                message: "Hasil peluang dipublikasikan.",
                variant: "success",
              }}
            >
              Ya, publikasikan
            </Button>
          </>
        }
      >
        <p>
          Orang tua akan langsung melihat peluang yang baru. Pastikan sebaran
          label sudah masuk akal.
        </p>
      </Dialog>
    </>
  );
}
