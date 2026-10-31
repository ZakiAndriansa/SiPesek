import { ViewTransition, type ReactNode } from "react";
import { NavDirection } from "./NavDirection";

/**
 * Isi halaman memudar saat pindah halaman (A-03). Dipasang di template.tsx tiap route group:
 * template dibuat ulang setiap pindah halaman, jadi enter/exit terpicu. Suspense reveal dan
 * router.refresh() tidak beranimasi (default="none"). Browser tanpa View Transitions tetap normal.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * Wizard (C-04): isi langkah bergeser maju/mundur. Arah diambil dari <html data-nav-dir>, bukan
 * dari transitionTypes, karena tipe transisi hilang saat data langkah baru dimuat dari server.
 */
export function StepTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="step" exit="step" default="none">
      <NavDirection />
      {children}
    </ViewTransition>
  );
}
