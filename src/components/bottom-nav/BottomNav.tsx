"use client";

import { usePathname } from "next/navigation";
import { stageOf } from "@/lib/accounts";
import { StageLink, type StageItem } from "../navbar/StageLink";

/** Navigasi bawah HP (< 600px): 4 tahap yang sama dengan navbar atas. */
export function BottomNav({ stages, lockedHref }: { stages: StageItem[]; lockedHref: string }) {
  const current = stageOf(usePathname());
  return (
    <nav className="bottom-nav" aria-label="Tahap">
      <ul className="bottom-nav__list">
        {stages.map((s) => (
          <li key={s.key}>
            <StageLink stage={s} active={s.key === current} lockedHref={lockedHref} variant="bottom" />
          </li>
        ))}
      </ul>
    </nav>
  );
}
