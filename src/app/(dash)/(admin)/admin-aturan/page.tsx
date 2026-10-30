import type { Metadata } from "next";
import {
  Badge,
  Button,
  Table,
  Dialog,
  Form,
  Field,
  Select,
  Choice,
  ChoiceGroup,
  PageHeader,
  DashSection,
  Toolbar,
} from "@/components";

export const metadata: Metadata = {
  title: "Aturan SPMB per Tahun",
  description: "Aturan SPMB per Tahun",
};

export default function AdminAturanPage() {
  return (
    <>
      <PageHeader
        title="Aturan SPMB per tahun"
        desc="Draf versi 3 · berdasarkan aturan 2026/2027."
        actions={
          <>
            <Button variant="secondary" iconLeft="copy" opens="dlg-duplikasi">
              Duplikasi dari Tahun Lalu
            </Button>
          </>
        }
      />
      <div className="stack">
        <p>
          <Badge kind="bersaing">Draf</Badge>{" "}
          <Badge kind="neutral">Belum dipublikasikan</Badge>
        </p>
      </div>
      <Form>
        <DashSection title="Identitas aturan">
          <Toolbar>
            <Select
              id="ta"
              label="Tahun ajaran"
              options={["2027/2028", "2026/2027"]}
            />
            <Select id="daerah" label="Daerah" options={["Kota Sukamaju"]} />
            <Select
              id="jenjang"
              label="Jenjang"
              options={["SMA dan SMK", "SMA", "SMK"]}
            />
            <Select
              id="maxpilih"
              label="Jumlah pilihan sekolah maksimal"
              options={["1", "2", "3", "4", "5"]}
              selected="3"
            />
          </Toolbar>
        </DashSection>
        <DashSection
          title="Jalur dan kuota"
          desc="Total kuota harus 100%. Isi sesuai petunjuk teknis daerah."
        >
          <Table
            caption="Kuota dan syarat tiap jalur"
            head={["Jalur", "Kuota (%)", "Syarat"]}
            rows={[
              [
                <>Domisili</>,
                <>
                  <input
                    className="field__input"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    defaultValue="40"
                    aria-label="Kuota Domisili (persen)"
                  />
                </>,
                <>
                  <input
                    className="field__input"
                    type="text"
                    defaultValue="Jarak titik rumah dan alamat KK"
                    aria-label="Syarat Domisili"
                  />
                </>,
              ],
              [
                <>Afirmasi</>,
                <>
                  <input
                    className="field__input"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    defaultValue="25"
                    aria-label="Kuota Afirmasi (persen)"
                  />
                </>,
                <>
                  <input
                    className="field__input"
                    type="text"
                    defaultValue="KETM atau disabilitas, ada bukti"
                    aria-label="Syarat Afirmasi"
                  />
                </>,
              ],
              [
                <>Prestasi</>,
                <>
                  <input
                    className="field__input"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    defaultValue="30"
                    aria-label="Kuota Prestasi (persen)"
                  />
                </>,
                <>
                  <input
                    className="field__input"
                    type="text"
                    defaultValue="Rapor semester 1–5 atau juara lomba"
                    aria-label="Syarat Prestasi"
                  />
                </>,
              ],
              [
                <>Mutasi</>,
                <>
                  <input
                    className="field__input"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="100"
                    defaultValue="5"
                    aria-label="Kuota Mutasi (persen)"
                  />
                </>,
                <>
                  <input
                    className="field__input"
                    type="text"
                    defaultValue="Surat penugasan atau anak guru"
                    aria-label="Syarat Mutasi"
                  />
                </>,
              ],
            ]}
          />
          <p>
            <Badge kind="aman">Total kuota 100%</Badge>
          </p>
        </DashSection>
        <DashSection title="Komponen skor">
          <ChoiceGroup legend="Komponen yang dihitung" cols2>
            <Choice
              type="checkbox"
              name="komp"
              value="rapor"
              title="Nilai rapor semester 1–5"
              checked
            />
            <Choice
              type="checkbox"
              name="komp"
              value="jarak"
              title="Jarak rumah ke sekolah"
              checked
            />
            <Choice
              type="checkbox"
              name="komp"
              value="prestasi"
              title="Prestasi lomba"
              checked
            />
            <Choice
              type="checkbox"
              name="komp"
              value="usia"
              title="Usia anak"
            />
          </ChoiceGroup>
        </DashSection>
        <DashSection title="Tanggal penting">
          <Toolbar>
            <Field
              id="t-buka"
              label="Pendaftaran dibuka"
              type="date"
              defaultValue="2027-06-02"
            />
            <Field
              id="t-tutup"
              label="Pendaftaran ditutup"
              type="date"
              defaultValue="2027-06-09"
            />
            <Field
              id="t-umum"
              label="Pengumuman"
              type="date"
              defaultValue="2027-06-20"
            />
            <Field
              id="t-ulang"
              label="Daftar ulang"
              type="date"
              defaultValue="2027-06-24"
            />
          </Toolbar>
        </DashSection>
        <div className="button-group">
          <Button
            variant="secondary"
            toast={{ message: "Draf versi 3 tersimpan.", variant: "success" }}
          >
            Simpan Draf
          </Button>
          <Button variant="primary" opens="dlg-publikasi">
            Publikasikan
          </Button>
        </div>
      </Form>
      <DashSection title="Riwayat versi">
        <Table
          caption="Riwayat versi aturan"
          head={["Versi", "Tanggal", "Oleh", "Perubahan"]}
          rows={[
            [
              <>v3 (draf)</>,
              <>14 Okt 2026</>,
              <>Pak Andi</>,
              <>Kuota prestasi 25% menjadi 30%</>,
            ],
            [
              <>v2</>,
              <>2 Okt 2026</>,
              <>Pak Andi</>,
              <>Tambah komponen usia</>,
            ],
            [
              <>v1</>,
              <>20 Sep 2026</>,
              <>Pak Andi</>,
              <>Salin dari aturan 2026/2027</>,
            ],
          ]}
        />
      </DashSection>
      <Dialog
        id="dlg-duplikasi"
        title="Duplikasi aturan tahun lalu?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button
              variant="primary"
              closes
              toast={{
                message: "Aturan 2026/2027 disalin menjadi draf baru.",
                variant: "success",
              }}
            >
              Ya, duplikasi
            </Button>
          </>
        }
      >
        <p>
          Aturan 2026/2027 akan disalin menjadi draf baru. Draf yang sekarang
          tidak berubah. Anda bisa mengubah hasil salinan sebelum
          dipublikasikan.
        </p>
      </Dialog>
      <Dialog
        id="dlg-publikasi"
        title="Publikasikan aturan ini?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button
              variant="primary"
              closes
              toast={{
                message: "Aturan dipublikasikan sebagai versi 3.",
                variant: "success",
              }}
            >
              Ya, publikasikan
            </Button>
          </>
        }
      >
        <p>
          Setelah dipublikasikan, aturan dipakai untuk menghitung peluang semua
          orang tua. Anda perlu menghitung ulang peluang agar hasilnya
          menyesuaikan.
        </p>
      </Dialog>
    </>
  );
}
