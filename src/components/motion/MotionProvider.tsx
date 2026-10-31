"use client";
import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Fitur Motion (termasuk layout dan layoutId) dimuat terpisah setelah halaman tampil.
const loadFeatures = () => import("./features").then((mod) => mod.default);

/** reducedMotion="user": Motion mematikan gerak transform bila pengguna memilih kurangi gerak. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
