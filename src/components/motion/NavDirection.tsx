"use client";
import { useEffect } from "react";

/**
 * Tautan dengan data-nav-dir="forward" | "back" menandai arah pindah langkah di <html>, supaya
 * CSS View Transition tahu ke mana isi bergeser. Tanda dihapus setelah langkah baru tampil.
 */
export function NavDirection() {
  useEffect(() => {
    const root = document.documentElement;
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("[data-nav-dir]");
      if (link?.dataset.navDir) root.dataset.navDir = link.dataset.navDir;
    };
    document.addEventListener("click", onClick, true);
    // Komponen ini ikut dibuat ulang di langkah baru: tanda arah dihapus setelah animasi selesai.
    const clear = () => window.setTimeout(() => delete root.dataset.navDir, 700);
    clear();
    return () => {
      document.removeEventListener("click", onClick, true);
      // Keluar dari wizard (misal Kembali di langkah 1): tanda tidak boleh tertinggal.
      clear();
    };
  }, []);
  return null;
}
