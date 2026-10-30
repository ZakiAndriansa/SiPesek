import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Container, ExternalLink } from "@/components";
import { FocusChrome } from "@/components/shell/Shell";
import { getStep } from "@/features/isi-data/steps";
import { HELP_URL } from "@/lib/nav";

// Mode fokus: header ringkas berisi progres, tanpa menu utama, footer, atau navigasi bawah.
export default function WizardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ langkah: string }>;
}) {
  // Promise diteruskan tanpa di-await; FocusChrome membacanya di balik Suspense.
  const step = params.then(({ langkah }) => getStep(langkah)?.n ?? notFound());
  return (
    <FocusChrome step={step}>
      <Container reading>
        {children}
        <p className="text-secondary wizard__help">
          Butuh bantuan? <ExternalLink href={HELP_URL}>Chat lewat WhatsApp</ExternalLink>
        </p>
      </Container>
    </FocusChrome>
  );
}
