import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Alert,
  Badge,
  Button,
  Container,
  Dialog,
  Disclaimer,
  HelpLink,
  MapLegend,
  MapSchools,
  NextStep,
  PageHeader,
  Select,
  Toolbar,
} from "@/components";
import { SCHOOLS } from "@/data/schools";
import { getSession } from "@/lib/session";
import { SchoolResultCard } from "@/features/sekolah/SchoolResultCard";

export const metadata: Metadata = {
  title: "Hasil Sekolah",
  description: "Eksplorasi peta zonasi dan peluang masuk SMA/SMK negeri di sekitar tempat tinggal.",
};

export default async function PetaSekolahPage({
  searchParams,
}: {
  searchParams: Promise<{ selesai?: string }>;
}) {
  const session = await getSession();
  const name = session?.child?.name ?? "anak";
  const first = name.split(" ")[0];
  const pins = SCHOOLS.map((s) => ({
    x: s.pin[0],
    y: s.pin[1],
    kind: s.kind,
    name: s.name,
  }));

  return (
    <>
      <Container>
        <PageHeader
        art="map"
          title="Hasil Sekolah"
          desc={`Peluang ${name} di sekolah sekitar rumah · Jalur dekat rumah (Domisili) dan Jalur nilai rapor & prestasi (Prestasi).`}
          actions={
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button variant="primary" sm href="/strategi" icon="arrow-right">
                Lihat Rekomendasi Strategi
              </Button>
              <Button variant="secondary" sm href="/isi-data/1">
                Ubah Data
              </Button>
            </div>
          }
        />

        <div className="stack">
          {/* Hanya pesan ini yang bergantung pada URL; sisanya ikut App Shell. */}
          <Suspense>
            <PesanSelesai searchParams={searchParams} first={first} />
          </Suspense>
          <Alert kind="warning" title="Aturan resmi SPMB tahun ini belum terbit">
            Hasil simulasi memakai acuan daya tampung tahun lalu dan akan otomatis diperbarui begitu petunjuk teknis dinas pendidikan resmi disahkan.
          </Alert>
          <Disclaimer />
        </div>

        <div className="split" style={{ marginTop: "var(--space-6)" }}>
          {/* Map Column */}
          <div className="split__map">
            <MapSchools
              pins={pins}
              home={[50, 62]}
              label={`Peta sekolah sekitar rumah ${first}`}
            />
            <div style={{ marginTop: "16px", padding: "16px 20px", background: "var(--color-surface)", borderRadius: "18px", border: "1px solid var(--color-border-subtle)" }}>
              <MapLegend />
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-border-subtle)" }}>
                <HelpLink opens="dlg-label">Apa arti label Peluang besar, Masih mungkin, dan Peluang kecil?</HelpLink>
              </div>
            </div>
          </div>

          {/* School Results Column */}
          <div className="stack" data-reveal-group="">
            <div className="block-head block-head--row">
              <h2 className="text-heading-md">{`${SCHOOLS.length} Sekolah Ditemukan`}</h2>
              <span className="block-head__aside">
                Radius hingga 5 km
              </span>
            </div>

            <Toolbar>
              <Select
                id="f-jalur"
                label="Jalur"
                options={["Semua jalur", "Jalur dekat rumah (Domisili)", "Jalur nilai dan prestasi (Prestasi)"]}
              />
              <Select
                id="f-jarak"
                label="Jarak Maksimal"
                options={["Semua jarak", "Sampai 2 km", "Sampai 5 km"]}
              />
              <Select
                id="f-jenjang"
                label="Jenjang"
                options={["SMA dan SMK", "SMA", "SMK"]}
              />
              <Select
                id="f-label"
                label="Tingkat Peluang"
                options={["Semua label", "Peluang besar", "Masih mungkin", "Peluang kecil"]}
              />
            </Toolbar>

            {SCHOOLS.map((school) => (
              <SchoolResultCard key={school.id} school={school} />
            ))}
          </div>
        </div>
        <NextStep
          step="Tahap 3 dari 4"
          title="Susun urutan pilihan sekolah"
          text={`Kami sudah menyiapkan kombinasi pilihan untuk ${first}: satu ambisius, satu seimbang, dan satu aman.`}
          href="/strategi"
          label="Lihat Strategi"
        />
      </Container>

      <Dialog id="dlg-label" title="Arti Status Peluang di SiPesek">
        <div className="stack" style={{ gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Badge kind="aman" />
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Peluang besar:</strong> Berdasarkan data kuota dan batas jarak/nilai tahun lalu, berkas anak berada dalam batas aman. Tetap lakukan pendaftaran tepat waktu di hari pertama.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Badge kind="bersaing" />
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Masih mungkin:</strong> Peluang berimbang (45-60%). Hasilnya sangat bergantung pada fluktuasi pendaftar tahun berjalan. Bagus untuk satu pilihan ambisius.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <Badge kind="berisiko" />
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Peluang kecil:</strong> Kuota tahun lalu terlampaui pada jarak atau nilai di atas anak. Disarankan tidak menjadi satu-satunya pilihan sekolah.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}

async function PesanSelesai({
  searchParams,
  first,
}: {
  searchParams: Promise<{ selesai?: string }>;
  first: string;
}) {
  if ((await searchParams).selesai !== "1") return null;
  return (
    <Alert kind="success" title={`Data ${first} lengkap. Ini hasilnya.`}>
      Lihat label tiap sekolah di bawah, lalu lanjut ke Strategi untuk urutan pilihan yang disarankan.
    </Alert>
  );
}
