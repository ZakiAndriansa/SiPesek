import type { Metadata } from "next";
import { Container } from "@/components";
import { QuickCheck } from "@/features/cek-cepat/QuickCheck";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cek Cepat dengan NISN · SiPesek",
  description: "Perkirakan peluang masuk SMA tanpa membuat akun. Data tidak disimpan.",
  robots: { index: false, follow: false },
};

export default async function CekCepatPage() {
  const session = await getSession();
  return (
    <Container reading>
      <QuickCheck loggedIn={!!session} canSave={session?.role === "orang-tua"} parentName={session?.name} />
    </Container>
  );
}
