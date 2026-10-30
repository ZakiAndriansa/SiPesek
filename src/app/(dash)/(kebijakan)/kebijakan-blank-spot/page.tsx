import type { Metadata } from "next";
import {
  Button,
  Alert,
  Badge,
  Table,
  MapZones,
  Select,
  PageHeader,
  DashSection,
} from "@/components";

export const metadata: Metadata = {
  title: "Peta Blank Spot",
  description: "Peta Blank Spot",
};

export default function KebijakanBlankSpotPage() {
  return (
    <>
      <PageHeader
        title="Peta blank spot"
        desc="Wilayah tanpa sekolah negeri dalam radius tertentu."
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft="download"
              toast={{ message: "Daftar sedang disiapkan.", variant: "info" }}
            >
              Ekspor Daftar
            </Button>
          </>
        }
      />
      <div className="toolbar">
        <Select
          id="radius"
          label="Radius ke sekolah negeri"
          options={["3 km", "5 km", "7 km"]}
          selected="5 km"
          hint="Wilayah dianggap blank spot bila lebih jauh dari ini."
        />
        <Select
          id="bj"
          label="Jenjang"
          options={["SMA dan SMK", "SMA", "SMK"]}
        />
      </div>
      <Alert kind="info" title="Hanya data gabungan">
        Titik rumah per keluarga tidak pernah ditampilkan. Wilayah dengan
        pengguna kurang dari 10 disamarkan.
      </Alert>
      <DashSection
        title="Peta"
        desc="Wilayah bergaris putus-putus adalah blank spot."
      >
        <MapZones
          zones={[
            {
              x: 2,
              y: 3,
              w: 46,
              h: 44,
              kind: "cukup",
              name: "Harapan Jaya",
              value: "Terlayani",
            },
            {
              x: 52,
              y: 3,
              w: 46,
              h: 44,
              kind: "cukup",
              name: "Sukamaju Utara",
              value: "Terlayani",
            },
            {
              x: 2,
              y: 52,
              w: 30,
              h: 45,
              kind: "blank",
              name: "Tirta Timur",
              value: "Blank spot",
            },
            {
              x: 35,
              y: 52,
              w: 30,
              h: 45,
              kind: "blank",
              name: "Bukit Asri",
              value: "Blank spot",
            },
            {
              x: 68,
              y: 52,
              w: 30,
              h: 45,
              kind: "blank",
              name: "Sumber Rejo",
              value: "Blank spot",
            },
          ]}
          label="Peta blank spot. Rincian ada di tabel di bawah."
        />
        <ul className="map-legend" aria-label="Arti warna">
          <li>
            <Badge kind="aman">Terlayani</Badge>
          </li>
          <li>
            <Badge kind="berisiko">Blank spot (garis putus-putus)</Badge>
          </li>
        </ul>
      </DashSection>
      <DashSection title="Daftar wilayah">
        <Table
          caption="Wilayah blank spot"
          head={[
            "Wilayah",
            "Kecamatan",
            "Jarak ke sekolah negeri terdekat",
            "Pengguna",
          ]}
          rows={[
            [
              <>Bukit Asri (seluruh kecamatan)</>,
              <>Bukit Asri</>,
              <>7,8 km</>,
              <>
                <span className="table__muted">Disamarkan</span>
              </>,
            ],
            [<>Tirta Timur</>, <>Tirta Indah</>, <>6,2 km</>, <>412</>],
            [<>Sumber Rejo</>, <>Lembah Hijau</>, <>5,4 km</>, <>286</>],
          ]}
          num={[2, 3]}
        />
      </DashSection>
    </>
  );
}
