import type { Metadata } from "next";
import { Badge, Container, MoreLink, PageHeader } from "@/components";
import { MasukPetugas } from "./MasukPetugas";

export const metadata: Metadata = {
  title: "Masuk Petugas",
  description: "Masuk untuk admin dinas pendidikan yang mengelola data sekolah, impor data seleksi, dan aturan SPMB.",
};

export default function MasukPetugasPage() {
  return (
    <Container reading>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <Badge kind="brand">Khusus admin dinas</Badge>
      </div>
      <PageHeader
        art="login"
        title="Masuk Petugas"
        desc="Untuk admin dinas pendidikan yang mengelola data sekolah, impor data seleksi, dan aturan SPMB. Akun admin dibuat oleh pengelola server."
      />
      <MasukPetugas />
      <p className="text-caption text-secondary" style={{ marginTop: "16px" }}>
        Pembuat kebijakan tidak perlu masuk: <MoreLink href="/kebijakan-ringkasan">buka Dashboard Kebijakan</MoreLink>
      </p>
      <p className="text-caption text-secondary">
        <MoreLink href="/masuk">Saya orang tua</MoreLink>
      </p>
    </Container>
  );
}
