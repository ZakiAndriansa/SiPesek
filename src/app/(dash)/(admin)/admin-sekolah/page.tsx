import type { Metadata } from "next";
import {
  Button,
  Pagination,
  Table,
  Dialog,
  Form,
  Field,
  Select,
  PageHeader,
  Toolbar,
} from "@/components";
import { KEC_NAMES } from "@/data/kecamatan";

export const metadata: Metadata = {
  title: "Data Sekolah dan Daya Tampung",
  description: "Data Sekolah dan Daya Tampung",
};

export default function AdminSekolahPage() {
  return (
    <>
      <PageHeader
        title="Data sekolah dan daya tampung"
        desc="Nama, lokasi, jenjang, dan kursi tiap jalur."
        actions={
          <>
            <Button variant="primary" iconLeft="plus" opens="dlg-sekolah">
              Tambah Sekolah
            </Button>
          </>
        }
      />
      <Toolbar>
        <Field
          id="cari-sekolah"
          label="Cari sekolah"
          type="search"
          placeholder="Ketik nama sekolah"
        />
        <Select
          id="s-jenjang"
          label="Jenjang"
          options={["Semua jenjang", "SMA", "SMK"]}
        />
      </Toolbar>
      <Table
        caption="Daftar sekolah"
        head={[
          "Sekolah",
          "Jenjang",
          "Kecamatan",
          "Koordinat",
          "Daya tampung",
          "Tindakan",
        ]}
        rows={[
          [
            <>SMA Negeri 1 Sukamaju</>,
            <>SMA</>,
            <>Sukamaju Utara</>,
            <>−6,9500, 107,6200</>,
            <>360</>,
            <>
              <Button
                variant="ghost"
                sm
                iconLeft="edit"
                opens="dlg-sekolah"
                aria-label="Ubah SMA Negeri 1 Sukamaju"
              >
                Ubah
              </Button>
            </>,
          ],
          [
            <>SMA Negeri 2 Sukamaju</>,
            <>SMA</>,
            <>Sukamaju Utara</>,
            <>−6,9540, 107,6310</>,
            <>320</>,
            <>
              <Button
                variant="ghost"
                sm
                iconLeft="edit"
                opens="dlg-sekolah"
                aria-label="Ubah SMA Negeri 2 Sukamaju"
              >
                Ubah
              </Button>
            </>,
          ],
          [
            <>SMA Negeri 5 Sukamaju</>,
            <>SMA</>,
            <>Harapan Jaya</>,
            <>−6,9610, 107,6050</>,
            <>384</>,
            <>
              <Button
                variant="ghost"
                sm
                iconLeft="edit"
                opens="dlg-sekolah"
                aria-label="Ubah SMA Negeri 5 Sukamaju"
              >
                Ubah
              </Button>
            </>,
          ],
          [
            <>SMK Negeri 1 Sukamaju</>,
            <>SMK</>,
            <>Harapan Jaya</>,
            <>−6,9700, 107,6120</>,
            <>432</>,
            <>
              <Button
                variant="ghost"
                sm
                iconLeft="edit"
                opens="dlg-sekolah"
                aria-label="Ubah SMK Negeri 1 Sukamaju"
              >
                Ubah
              </Button>
            </>,
          ],
        ]}
        num={[4]}
      />
      <Pagination label="Halaman daftar sekolah" current={1} total={3} />
      <Dialog
        id="dlg-sekolah"
        title="Data sekolah"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" type="submit" form="form-sekolah">
              Simpan Sekolah
            </Button>
          </>
        }
      >
        <Form id="form-sekolah" toast="Data sekolah tersimpan.">
          <Field
            id="sk-nama"
            label="Nama sekolah"
            required
            errorRequired="Nama sekolah belum diisi."
          />
          <Select id="sk-jenjang" label="Jenjang" options={["SMA", "SMK"]} />
          <Select id="sk-kec" label="Kecamatan" options={KEC_NAMES} />
          <Toolbar>
            <Field
              id="sk-lat"
              label="Lintang"
              required
              placeholder="-6,9500"
              errorRequired="Lintang belum diisi."
              inputMode="decimal"
            />
            <Field
              id="sk-lng"
              label="Bujur"
              required
              placeholder="107,6200"
              errorRequired="Bujur belum diisi."
              inputMode="decimal"
            />
          </Toolbar>
          <Toolbar>
            <Field
              id="sk-dom"
              label="Kursi Domisili"
              type="number"
              inputMode="numeric"
              min="0"
            />
            <Field
              id="sk-afi"
              label="Kursi Afirmasi"
              type="number"
              inputMode="numeric"
              min="0"
            />
            <Field
              id="sk-pre"
              label="Kursi Prestasi"
              type="number"
              inputMode="numeric"
              min="0"
            />
            <Field
              id="sk-mut"
              label="Kursi Mutasi"
              type="number"
              inputMode="numeric"
              min="0"
            />
          </Toolbar>
        </Form>
      </Dialog>
    </>
  );
}
