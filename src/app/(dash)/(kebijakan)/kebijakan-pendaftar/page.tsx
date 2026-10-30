import type { Metadata } from "next";
import {
  Badge,
  Alert,
  Tabs,
  Table,
  Select,
  PageHeader,
  Toolbar,
} from "@/components";
import { KebijakanFilters, MethodNote } from "@/features/kebijakan/Filters";

export const metadata: Metadata = {
  title: "Pendaftar Sekolah",
  description: "Pendaftar Sekolah",
};

export default function KebijakanPendaftarPage() {
  return (
    <>
      <PageHeader
        title="Sekolah kelebihan dan kekurangan pendaftar"
        desc="Berdasarkan minat dari simulasi, bukan pendaftaran resmi."
      />
      <KebijakanFilters />
      <MethodNote />
      <Tabs
        label="Jenis daftar"
        tabs={[
          {
            id: "lebih",
            label: "Kelebihan pendaftar",
            content: (
              <>
                <Table
                  caption="Sekolah dengan minat melebihi kursi"
                  head={[
                    "Sekolah",
                    "Kursi",
                    "Minat simulasi",
                    "Rasio minat : kursi",
                  ]}
                  rows={[
                    [
                      <>SMA Negeri 1 Sukamaju</>,
                      <>360</>,
                      <>1.240</>,
                      <>
                        <Badge kind="berisiko">3,4 : 1</Badge>
                      </>,
                    ],
                    [
                      <>SMA Negeri 2 Sukamaju</>,
                      <>320</>,
                      <>960</>,
                      <>
                        <Badge kind="berisiko">3,0 : 1</Badge>
                      </>,
                    ],
                    [
                      <>SMA Negeri 5 Sukamaju</>,
                      <>384</>,
                      <>820</>,
                      <>
                        <Badge kind="bersaing">2,1 : 1</Badge>
                      </>,
                    ],
                    [
                      <>SMA Negeri 9 Sukamaju</>,
                      <>352</>,
                      <>610</>,
                      <>
                        <Badge kind="bersaing">1,7 : 1</Badge>
                      </>,
                    ],
                  ]}
                  num={[1, 2, 3]}
                />
              </>
            ),
          },
          {
            id: "kurang",
            label: "Kekurangan pendaftar",
            content: (
              <>
                <Table
                  caption="Sekolah dengan minat di bawah kursi"
                  head={[
                    "Sekolah",
                    "Kursi",
                    "Minat simulasi",
                    "Potensi kursi kosong",
                  ]}
                  rows={[
                    [
                      <>SMA Negeri 12 Tirta Indah</>,
                      <>288</>,
                      <>142</>,
                      <>146</>,
                    ],
                    [
                      <>SMA Negeri 14 Lembah Hijau</>,
                      <>256</>,
                      <>118</>,
                      <>138</>,
                    ],
                    [
                      <>SMA Negeri 11 Mekar Sari</>,
                      <>320</>,
                      <>246</>,
                      <>74</>,
                    ],
                  ]}
                  num={[1, 2, 3]}
                />
              </>
            ),
          },
        ]}
      />
    </>
  );
}
