import type { Metadata } from "next";
import { Suspense } from "react";
import { Button, Container, PageHeader } from "@/components";
import { homeFor, ROLE_LABEL, rolesFor, type Session } from "@/lib/accounts";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Halaman tidak bisa dibuka" };

const AREA: Record<string, string> = {
  "orang-tua": "orang tua",
  kebijakan: "pembuat kebijakan",
  admin: "admin dinas",
};

const JUDUL = "Halaman ini bukan untuk akun Bapak/Ibu";

type CariParams = Promise<{ dari?: string }>;

export default async function AksesDitolakPage({ searchParams }: { searchParams: CariParams }) {
  const session = await getSession();
  return (
    <Container reading>
      {/* Keterangan bergantung pada ?dari=, jadi dialirkan di balik Suspense; sisanya ikut App Shell. */}
      <Suspense fallback={<PageHeader art="lost" title={JUDUL} />}>
        <Keterangan searchParams={searchParams} session={session} />
      </Suspense>
      <Button variant="primary" lg href={session ? homeFor(session) : "/"} icon="arrow-right">
        {session ? "Kembali ke halaman saya" : "Kembali ke Beranda"}
      </Button>
    </Container>
  );
}

async function Keterangan({ searchParams, session }: { searchParams: CariParams; session: Session | null }) {
  const needed = rolesFor((await searchParams).dari ?? "")?.[0];
  const area = needed ? AREA[needed] : "peran lain";
  return (
    <PageHeader
      art="lost"
      title={JUDUL}
      desc={
        session
          ? `Halaman tersebut khusus untuk ${area}. Bapak/Ibu masuk sebagai ${ROLE_LABEL[session.role]}.`
          : `Halaman tersebut khusus untuk ${area}.`
      }
    />
  );
}
