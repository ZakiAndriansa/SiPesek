import type { Metadata } from "next";
import {
  Button,
  Alert,
  Table,
  Form,
  Select,
  Choice,
  ChoiceGroup,
  PageHeader,
  DashSection,
  Toolbar,
} from "@/components";
import { KEC_FILTER } from "@/data/kecamatan";

export const metadata: Metadata = {
  title: "Ekspor Laporan",
  description: "Ekspor Laporan",
};

export default function KebijakanEksporPage() {
  return (
    <>
      <PageHeader
        title="Ekspor laporan"
        desc="Buat laporan untuk rapat atau olah lanjut."
      />
      <Form toast="Laporan sedang dibuat. Tautan unduhan muncul di riwayat ekspor.">
        <ChoiceGroup legend="Laporan yang diekspor">
          <Choice
            type="radio"
            name="laporan"
            value="ringkasan"
            title="Ringkasan"
            checked
          />
          <Choice
            type="radio"
            name="laporan"
            value="rasio"
            title="Rasio kursi per kecamatan"
          />
          <Choice
            type="radio"
            name="laporan"
            value="blank"
            title="Peta blank spot"
          />
          <Choice
            type="radio"
            name="laporan"
            value="pendaftar"
            title="Sekolah kelebihan dan kekurangan pendaftar"
          />
        </ChoiceGroup>
        <ChoiceGroup legend="Format" cols2>
          <Choice
            type="radio"
            name="format"
            value="pdf"
            title="PDF"
            desc="Untuk rapat dan dibaca langsung."
            checked
          />
          <Choice
            type="radio"
            name="format"
            value="csv"
            title="Excel atau CSV"
            desc="Untuk diolah lebih lanjut."
          />
        </ChoiceGroup>
        <Toolbar>
          <Select
            id="e-tahun"
            label="Tahun ajaran"
            options={["2027/2028", "2026/2027"]}
          />
          <Select id="e-kec" label="Kecamatan" options={KEC_FILTER} />
        </Toolbar>
        <Alert kind="info" title="Catatan metodologi selalu disertakan">
          Setiap laporan memuat tanggal data dan catatan bahwa minat berasal
          dari simulasi pengguna.
        </Alert>
        <Button variant="primary" block type="submit" iconLeft="download">
          Buat Laporan
        </Button>
      </Form>
      <DashSection title="Riwayat ekspor">
        <Table
          caption="Riwayat ekspor laporan"
          head={["Laporan", "Format", "Tanggal data", "Tindakan"]}
          rows={[
            [
              <>Ringkasan 2027/2028</>,
              <>PDF</>,
              <>12 Okt 2026</>,
              <>
                <Button
                  variant="ghost"
                  sm
                  iconLeft="download"
                  toast={{ message: "Mengunduh laporan.", variant: "info" }}
                >
                  Unduh
                </Button>
              </>,
            ],
            [
              <>Rasio kursi per kecamatan</>,
              <>CSV</>,
              <>5 Okt 2026</>,
              <>
                <Button
                  variant="ghost"
                  sm
                  iconLeft="download"
                  toast={{ message: "Mengunduh laporan.", variant: "info" }}
                >
                  Unduh
                </Button>
              </>,
            ],
          ]}
          compact={false}
        />
      </DashSection>
    </>
  );
}
