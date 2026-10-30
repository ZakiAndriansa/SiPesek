import type { Metadata } from "next";
import {
  Badge,
  Button,
  Alert,
  Stats,
  Table,
  Select,
  PageHeader,
  DashSection,
  Toolbar,
} from "@/components";
import { fmt, KECAMATAN } from "@/data/kecamatan";
import { KebijakanFilters, MethodNote } from "@/features/kebijakan/Filters";

export const metadata: Metadata = {
  title: "Ringkasan",
  description: "Ringkasan",
};

export default function KebijakanRingkasanPage() {
  return (
    <>
      <PageHeader
        title="Ringkasan"
        desc="Gambaran singkat untuk rapat dan laporan."
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft="download"
              toast={{
                message: "Ringkasan sedang disiapkan.",
                variant: "info",
              }}
            >
              Ekspor Ringkasan
            </Button>
          </>
        }
      />
      <KebijakanFilters />
      <Stats
        items={[
          ["Pengguna aktif", "12.480", "Data contoh, simulasi orang tua"],
          ["Total simulasi", "31.902", "Data contoh"],
          [
            "Anak dengan minimal 1 pilihan Peluang Besar",
            "71%",
            "Dari simulasi yang selesai",
          ],
          ["Kecamatan tanpa sekolah negeri", "1", "Bukit Asri"],
        ]}
      />
      <MethodNote />
      <DashSection
        title="Sampel pengguna per kecamatan"
        desc="Pastikan sampel cukup mewakili sebelum menyimpulkan."
      >
        <Table
          caption="Pengguna per kecamatan"
          head={["Kecamatan", "Pengguna", "Lulusan SMP", "Cakupan sampel"]}
          rows={KECAMATAN.map((k) => [
            k.name,
            k.pengguna === null ? (
              <span className="table__muted">Disamarkan (&lt; 10)</span>
            ) : (
              fmt(k.pengguna)
            ),
            fmt(k.lulusan),
            k.pengguna === null ? (
              <Badge kind="berisiko">Sangat rendah</Badge>
            ) : (
              "Tinggi"
            ),
          ])}
          num={[1, 2]}
        />
      </DashSection>
    </>
  );
}
