import type { Metadata } from "next";
import {
  Button,
  Alert,
  Table,
  Upload,
  Dialog,
  PageHeader,
  DashSection,
} from "@/components";

export const metadata: Metadata = {
  title: "Impor Data Seleksi",
  description: "Impor Data Seleksi",
};

export default function AdminImporPage() {
  return (
    <>
      <PageHeader
        title="Impor data seleksi tahun lalu"
        desc="Unggah, periksa, lalu proses. Tidak ada data yang diproses sebelum Anda konfirmasi."
      />
      <DashSection
        title="1. Unggah file"
        desc="Format CSV atau Excel. Pakai template agar kolom sesuai."
      >
        <Upload
          title="Pilih file CSV atau Excel"
          hint="Maksimal 10 MB. Contoh: seleksi-2026.xlsx"
          accept=".csv,.xlsx"
          label="Pilih file seleksi"
        />
        <Button
          variant="secondary"
          iconLeft="download"
          toast={{ message: "Template sedang diunduh.", variant: "info" }}
        >
          Unduh Template
        </Button>
      </DashSection>
      <DashSection
        title="2. Pratinjau (5 dari 20 baris pertama)"
        desc="File: seleksi-2026.xlsx · 4.280 baris"
      >
        <Table
          caption="Pratinjau data seleksi"
          head={[
            "Sekolah",
            "Tahun",
            "Jalur",
            "Kuota",
            "Pendaftar",
            "Batas diterima",
          ]}
          rows={[
            [
              <>SMA Negeri 1 Sukamaju</>,
              <>2026</>,
              <>Domisili</>,
              <>144</>,
              <>512</>,
              <>1,4 km</>,
            ],
            [
              <>SMA Negeri 1 Sukamaju</>,
              <>2026</>,
              <>Prestasi</>,
              <>108</>,
              <>630</>,
              <>91,2</>,
            ],
            [
              <>SMA Negeri 2 Sukamaju</>,
              <>2026</>,
              <>Domisili</>,
              <>128</>,
              <>401</>,
              <>1,9 km</>,
            ],
            [
              <>SMA Negeri 5 Sukamaju</>,
              <>2026</>,
              <>Domisili</>,
              <>154</>,
              <>342</>,
              <>1,8 km</>,
            ],
            [
              <>SMA Negeri 9 Sukamaju</>,
              <>2026</>,
              <>Domisili</>,
              <>141</>,
              <>290</>,
              <>2,6 km</>,
            ],
          ]}
          num={[3, 4]}
        />
      </DashSection>
      <DashSection title="3. Hasil validasi">
        <Alert kind="danger" title="12 baris bermasalah dari 4.280">
          4.268 baris valid. Perbaiki 12 baris bermasalah di file, atau proses
          hanya baris yang valid.
        </Alert>
        <Table
          caption="Baris bermasalah"
          head={["Baris", "Kolom", "Masalah"]}
          rows={[
            [<>214</>, <>Batas diterima</>, <>Berisi teks, harusnya angka</>],
            [
              <>981</>,
              <>Sekolah</>,
              <>Nama tidak dikenali: SMA N 05 Sukamaju</>,
            ],
            [<>1.402</>, <>Kuota</>, <>Kosong</>],
          ]}
          num={[0]}
          compact={true}
        />
        <div className="button-group">
          <Button
            variant="secondary"
            iconLeft="download"
            toast={{
              message: "Laporan baris bermasalah diunduh.",
              variant: "info",
            }}
          >
            Unduh Baris Bermasalah
          </Button>
          <Button variant="primary" opens="dlg-proses">
            Proses Baris Valid
          </Button>
        </div>
      </DashSection>
      <Dialog
        id="dlg-proses"
        title="Proses 4.268 baris valid?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button
              variant="primary"
              closes
              toast={{
                message:
                  "4.268 baris diproses. Hitung ulang peluang untuk melihat dampaknya.",
                variant: "success",
              }}
            >
              Ya, proses
            </Button>
          </>
        }
      >
        <p>
          12 baris bermasalah dilewati dan tidak ikut diproses. Setelah itu
          peluang perlu dihitung ulang. Data lama tersimpan di riwayat.
        </p>
      </Dialog>
    </>
  );
}
