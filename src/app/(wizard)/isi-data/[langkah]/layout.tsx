import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Container, ExternalLink } from "@/components";
import { FocusChrome } from "@/components/shell/Shell";
import { getStep } from "@/features/isi-data/steps";
import { HELP_URL } from "@/lib/nav";

// Mode fokus: header ringkas berisi progres, tanpa menu utama, footer, atau navigasi bawah.
export default async function WizardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ langkah: string }>;
}) {
  const found = getStep((await params).langkah);
  if (!found) notFound();
  return (
    <FocusChrome step={found.n}>
      <Container reading>
        {children}
        <p className="text-secondary wizard__help">
          Butuh bantuan? <ExternalLink href={HELP_URL}>Chat lewat WhatsApp</ExternalLink>
        </p>
      </Container>
    </FocusChrome>
  );
}
