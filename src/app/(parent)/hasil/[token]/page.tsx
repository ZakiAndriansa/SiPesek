import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components";
import { HasilTersimpan } from "@/features/cek-cepat/HasilTersimpan";

export const metadata: Metadata = {
  title: "Hasil Tersimpan",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

// Token ada di URL, jadi dibaca di balik Suspense; datanya diambil di klien agar cookie sesi ikut terkirim.
export default function HasilPage({ params }: Props) {
  return (
    <Container reading>
      <Suspense fallback={<div className="card" aria-busy="true" />}>
        <IsiHasil params={params} />
      </Suspense>
    </Container>
  );
}

async function IsiHasil({ params }: Props) {
  const { token } = await params;
  return <HasilTersimpan token={token} />;
}
