import type { Metadata } from "next";
import {
  Badge,
  Button,
  Tabs,
  Pagination,
  Table,
  Dialog,
  Form,
  Field,
  Select,
  PageHeader,
} from "@/components";

export const metadata: Metadata = {
  title: "Pengguna dan Hak Akses",
  description: "Pengguna dan Hak Akses",
};

export default function AdminPenggunaPage() {
  return (
    <>
      <PageHeader
        title="Pengguna dan hak akses"
        desc="Admin dan Pembuat Kebijakan, lengkap dengan log aktivitas."
        actions={
          <>
            <Button variant="primary" iconLeft="plus" opens="dlg-undang">
              Undang Pengguna
            </Button>
          </>
        }
      />
      <Tabs
        label="Pengguna dan log"
        tabs={[
          {
            id: "user",
            label: "Pengguna",
            content: (
              <>
                <Table
                  caption="Daftar pengguna"
                  head={["Nama", "Peran", "Nomor HP", "Terakhir masuk"]}
                  rows={[
                    [
                      <>Andi Saputra</>,
                      <>
                        <Badge kind="brand">Admin</Badge>
                      </>,
                      <>0812-••••-3456</>,
                      <>14 Okt 2026</>,
                    ],
                    [
                      <>Rina Wulandari</>,
                      <>
                        <Badge kind="info">Pembuat Kebijakan</Badge>
                      </>,
                      <>0813-••••-7788</>,
                      <>13 Okt 2026</>,
                    ],
                    [
                      <>Dewi Lestari</>,
                      <>
                        <Badge kind="brand">Admin</Badge>
                      </>,
                      <>0857-••••-1209</>,
                      <>9 Okt 2026</>,
                    ],
                  ]}
                />
              </>
            ),
          },
          {
            id: "log",
            label: "Log aktivitas",
            content: (
              <>
                <Table
                  caption="Log aktivitas"
                  head={["Waktu", "Pengguna", "Aksi"]}
                  rows={[
                    [
                      <>14 Okt 2026, 09.12</>,
                      <>Andi Saputra</>,
                      <>Menghitung ulang peluang</>,
                    ],
                    [
                      <>14 Okt 2026, 08.40</>,
                      <>Andi Saputra</>,
                      <>Mengubah kuota prestasi (v3)</>,
                    ],
                    [
                      <>13 Okt 2026, 15.02</>,
                      <>Rina Wulandari</>,
                      <>Mengekspor ringkasan (PDF)</>,
                    ],
                    [<>13 Okt 2026, 10.30</>, <>Rina Wulandari</>, <>Masuk</>],
                  ]}
                />
                <Pagination
                  label="Halaman log aktivitas"
                  current={1}
                  total={4}
                />
              </>
            ),
          },
        ]}
        panelClassName="stack"
      />
      <Dialog
        id="dlg-undang"
        title="Undang pengguna"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" type="submit" form="form-undang">
              Kirim Undangan
            </Button>
          </>
        }
      >
        <Form id="form-undang" toast="Undangan terkirim lewat WhatsApp.">
          <Field
            id="u-nama"
            label="Nama"
            required
            errorRequired="Nama belum diisi."
          />
          <Field
            id="u-hp"
            label="Nomor HP"
            type="tel"
            required
            errorRequired="Nomor HP belum diisi."
            errorPattern="Nomor HP tampaknya belum lengkap. Tulis diawali 0."
            inputMode="tel"
            pattern="0[0-9]{9,12}"
          />
          <Select
            id="u-peran"
            label="Peran"
            options={["Pembuat Kebijakan", "Admin"]}
          />
        </Form>
      </Dialog>
    </>
  );
}
