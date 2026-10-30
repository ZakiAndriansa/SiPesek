import type { Metadata } from "next";
import {
  Badge,
  Button,
  Table,
  MapZones,
  MapLegend,
  Select,
  PageHeader,
  DashSection,
  Toolbar,
} from "@/components";
import { fmt, KECAMATAN, rasio, statusRasio } from "@/data/kecamatan";
import { KebijakanFilters } from "@/features/kebijakan/Filters";

const ZONE_KIND = {
  aman: "cukup",
  bersaing: "terbatas",
  berisiko: "kurang",
} as const;

export const metadata: Metadata = {
  title: "Rasio Kursi per Kecamatan",
  description: "Rasio Kursi per Kecamatan",
};

export default function KebijakanRasioPage() {
  return (
    <>
      <PageHeader
        title="Rasio kursi per kecamatan"
        desc="Perbandingan jumlah lulusan SMP dengan kursi SMA/SMK negeri."
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft="download"
              toast={{ message: "Tabel sedang disiapkan.", variant: "info" }}
            >
              Ekspor Tabel
            </Button>
          </>
        }
      />
      <KebijakanFilters />
      <DashSection
        title="Peta rasio"
        desc="Cukup: 55% atau lebih. Terbatas: 35–54%. Kurang: di bawah 35%."
      >
        <MapZones
          zones={KECAMATAN.map((k, i) => ({
            x: [2, 35, 68][i % 3],
            y: i < 3 ? 3 : 52,
            w: 30,
            h: 45,
            kind: ZONE_KIND[statusRasio(rasio(k)).kind],
            name: k.name,
            value: `${rasio(k)}%`,
          }))}
          label="Peta rasio kursi per kecamatan. Rincian ada di tabel di bawah."
        />
        <MapLegend zones />
      </DashSection>
      <DashSection
        title="Tabel rasio"
        desc="Rasio = kursi negeri dibagi lulusan SMP."
      >
        <Table
          caption="Rasio kursi per kecamatan"
          head={["Kecamatan", "Lulusan SMP", "Kursi negeri", "Rasio", "Status"]}
          rows={KECAMATAN.map((k) => {
            const status = statusRasio(rasio(k));
            return [
              k.name,
              fmt(k.lulusan),
              fmt(k.kursi),
              `${rasio(k)}%`,
              <Badge key={k.name} kind={status.kind}>
                {status.label}
              </Badge>,
            ];
          })}
          num={[1, 2, 3]}
        />
      </DashSection>
    </>
  );
}
