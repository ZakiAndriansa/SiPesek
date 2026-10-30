import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Container,
  DashSection,
  Disclaimer,
  PageHeader,
  Stats,
  Table,
} from "@/components";
import { getSchool, SCHOOLS, shortName } from "@/data/schools";
import { AddSchoolButton } from "@/features/sekolah/SchoolActions";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SCHOOLS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = getSchool((await params).id);
  return school
    ? {
        title: `${school.name} · Detail & Peluang SPMB`,
        description: `Analisis peluang masuk ${school.name} melalui berbagai jalur SPMB.`,
      }
    : {};
}

export default async function DetailSekolahPage({ params }: Props) {
  const school = getSchool((await params).id);
  if (!school) notFound();
  const { detail } = school;

  return (
    <Container>
      <Breadcrumb items={[["Hasil Sekolah", "/peta-sekolah"], [school.name]]} />

      {/* School Visual Hero Header */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          marginBlock: "24px 32px",
          background: "linear-gradient(135deg, #2b1f1d 0%, #171112 100%)",
          color: "var(--color-on-primary)",
          boxShadow: "0 12px 36px rgba(4, 6, 19, 0.12)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            opacity: 0.5,
          }}
        >
          <Image
            src="/assets/landing-school-photo.png"
            alt={`Gedung ${school.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(23, 17, 18, 0.2) 0%, rgba(23, 17, 18, 0.85) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "28px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-on-primary)",
              }}
            >
              SMA Negeri
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-on-primary)",
              }}
            >
              {school.kec}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(237, 90, 28, 0.9)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-on-primary)",
              }}
            >
              {detail.distance} dari rumah
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 700,
              color: "var(--color-on-primary)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {school.name}
          </h1>
        </div>
      </div>

      <div className="stack stack--lg">
        {/* Featured Probability Card */}
        <div className="card card--featured">
          <div className="card__meta">
            <Badge kind={school.kind} lg />
          </div>
          <h2 className="card__title">{`Peluang sekitar ${school.range} lewat ${school.jalur}`}</h2>
          <p className="card__text" style={{ fontSize: "16px", lineHeight: "1.6" }}>
            {detail.summary}
          </p>
        </div>

        {/* Peluang Per Jalur Table */}
        <DashSection
          title="Peluang per Jalur Pendaftaran"
          desc="Hanya jalur yang memenuhi syarat administrasi dan domisili Dimas yang dihitung secara detail."
        >
          <Table
            caption={`Peluang tiap jalur di ${shortName(school)}`}
            head={["Jalur Pendaftaran", "Status Syarat", "Estimasi Peluang", "Label Kategori"]}
            rows={detail.routes.map((r) => [
              <strong key="j" style={{ color: "var(--color-ink)" }}>
                {r.jalur}
              </strong>,
              r.eligible ? (
                <span key="e" style={{ color: "var(--color-success-text)", fontWeight: 600 }}>
                  Terpenuhi
                </span>
              ) : (
                <span key="e" style={{ color: "var(--color-ink-muted)" }}>
                  Tidak terpenuhi
                </span>
              ),
              r.eligible ? (
                <strong key="p" style={{ fontFamily: 'var(--font-heading)', fontSize: "16px" }}>
                  {r.peluang}
                </strong>
              ) : (
                "—"
              ),
              r.eligible ? (
                <Badge key="k" kind={r.kind!} />
              ) : (
                <Badge key="k" kind="neutral">
                  Tidak berlaku
                </Badge>
              ),
            ])}
            num={[2]}
          />
        </DashSection>

        {/* Stats Data Pembanding */}
        <DashSection
          title="Data Pembanding Daya Tampung & Seleksi Tahun Lalu"
          desc="Dipakai sebagai dasar pemodelan dan perkiraan zonasi."
        >
          <Stats items={detail.stats} />
        </DashSection>

        <Alert
          kind="info"
          title={`Keandalan Data: Berdasarkan ${detail.reliability.years} Tahun Riwayat SPMB`}
        >
          {`Semakin konsisten riwayat data tahun-tahun sebelumnya, semakin akurat perkiraannya. ${detail.reliability.note}`}
        </Alert>

        <Disclaimer />

        {/* Action Buttons */}
        <ButtonGroup>
          <AddSchoolButton school={school} variant="primary" block />
          <Button
            variant="secondary"
            block
            href="/peta-sekolah"
            iconLeft="chevron-left"
          >
            Kembali ke Peta Sekolah
          </Button>
        </ButtonGroup>
      </div>
    </Container>
  );
}

