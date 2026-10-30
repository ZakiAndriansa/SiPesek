import type { Metadata } from "next";
import { Button, Container, PageHeader } from "@/components";
import { homeFor, ROLE_LABEL, rolesFor } from "@/lib/accounts";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Halaman tidak bisa dibuka" };

const AREA: Record<string, string> = {
  "orang-tua": "orang tua",
  kebijakan: "pembuat kebijakan",
  admin: "admin dinas",
};

export default async function AksesDitolakPage({
  searchParams,
}: {
  searchParams: Promise<{ dari?: string }>;
}) {
  const session = await getSession();
  const from = (await searchParams).dari ?? "";
  const needed = rolesFor(from)?.[0];
  const area = needed ? AREA[needed] : "peran lain";
  return (
    <Container reading>
      <PageHeader
        art="lost"
        title="Halaman ini bukan untuk akun Bapak/Ibu"
        desc={
          session
            ? `Halaman tersebut khusus untuk ${area}. Bapak/Ibu masuk sebagai ${ROLE_LABEL[session.role]}.`
            : `Halaman tersebut khusus untuk ${area}.`
        }
      />
      <Button variant="primary" lg href={session ? homeFor(session) : "/"} icon="arrow-right">
        {session ? "Kembali ke halaman saya" : "Kembali ke Beranda"}
      </Button>
    </Container>
  );
}
