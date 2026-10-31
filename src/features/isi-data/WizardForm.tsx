"use client";
import { useRouter } from "next/navigation";
import { startTransition, type ReactNode } from "react";
import { Form } from "@/components";
import { saveStep } from "@/lib/session-actions";
/** Form wizard: simpan progres langkah (autosave tiruan) lalu pindah ke langkah berikutnya. */
export function WizardForm({ step, next, children }: { step: number; next: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Form
      onValid={() => {
        const name = document.querySelector<HTMLInputElement>("#nama")?.value;
        // C-04: arah geser dibaca CSS dari atribut ini (lihat StepTransition).
        document.documentElement.dataset.navDir = "forward";
        // Simpan dan pindah dalam satu transisi, supaya View Transition langkah ikut berjalan.
        // refresh() langsung setelah push membatalkan animasi, jadi ditunda sampai animasi selesai.
        startTransition(async () => {
          await saveStep(step, name);
          router.push(next);
          window.setTimeout(() => router.refresh(), 700);
        });
      }}
    >
      {children}
    </Form>
  );
}
