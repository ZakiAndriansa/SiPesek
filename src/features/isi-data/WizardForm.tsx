"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Form } from "@/components";
import { saveStep } from "@/lib/session-actions";

/** Form wizard: simpan progres langkah (autosave tiruan) lalu pindah ke langkah berikutnya. */
export function WizardForm({ step, next, children }: { step: number; next: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Form
      onValid={async () => {
        const name = document.querySelector<HTMLInputElement>("#nama")?.value;
        await saveStep(step, name);
        router.push(next);
        router.refresh();
      }}
    >
      {children}
    </Form>
  );
}
