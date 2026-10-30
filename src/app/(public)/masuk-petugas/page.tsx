import type { Metadata } from "next";
import { Badge, Container, MoreLink, PageHeader } from "@/components";
import { MasukPetugas } from "./MasukPetugas";

export const metadata: Metadata = {
  title: "Masuk Petugas",
  description: "Masuk untuk pembuat kebijakan dan admin dinas pendidikan.",
};

export default function MasukPetugasPage() {
  return (
    <Container reading>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <Badge kind="brand">Khusus petugas dinas</Badge>
      </div>
      <PageHeader
        art="login"
        title="Masuk Petugas"
        desc="Halaman ini untuk pembuat kebijakan dan admin dinas pendidikan. Orang tua masuk lewat halaman Masuk dengan Google."
      />
      <MasukPetugas />
      <p className="text-caption text-secondary" style={{ marginTop: "16px" }}>
        <MoreLink href="/masuk">Saya orang tua</MoreLink>
      </p>
    </Container>
  );
}
