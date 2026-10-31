"use client";
import { animate, inView } from "motion";
import { useEffect } from "react";

// Reveal saat scroll untuk halaman server tanpa mengubah DOM:
//   data-reveal              elemen naik 12px dan muncul sekali saat masuk layar
//   data-reveal="draw-y"     garis tergambar dari atas (scaleY)
//   data-reveal="draw-x"     bar tergambar dari kiri (scaleX)
//   data-reveal-group        setiap anak langsung muncul berurutan
// Elemen yang sudah terlihat saat dipindai tidak dianimasikan, supaya isi di atas lipatan tidak
// tertunda. Pengecualian: elemen di dalam [data-reveal-live] (hasil yang baru muncul karena aksi).
// Tanpa JS atau dengan "kurangi gerak", semua langsung terlihat.

const SELECTOR = "[data-reveal], [data-reveal-group] > *";
const MAX_STAGGER_STEPS = 5;

type Kind = "rise" | "draw-y" | "draw-x";

function token(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value / 1000 : value;
}

const kindOf = (el: HTMLElement): Kind => {
  const v = el.dataset.reveal;
  return v === "draw-y" || v === "draw-x" ? v : "rise";
};

const HIDDEN: Record<Kind, Record<string, string | number>> = {
  rise: { opacity: 0, y: 12 },
  "draw-y": { scaleY: 0, transformOrigin: "top" },
  "draw-x": { scaleX: 0, transformOrigin: "left" },
};
const SHOWN: Record<Kind, Record<string, number>> = {
  rise: { opacity: 1, y: 0 },
  "draw-y": { scaleY: 1 },
  "draw-x": { scaleX: 1 },
};

export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duration = token("--duration-reveal", 0.5);
    const stagger = token("--stagger", 0.06);
    const done = new WeakSet<Element>();
    const stops: VoidFunction[] = [];
    let queue: HTMLElement[] = [];
    let flushFrame = 0;

    // Elemen yang masuk layar di frame yang sama muncul berurutan, maksimal 6 langkah jeda.
    const flush = () => {
      flushFrame = 0;
      queue.forEach((el, i) => {
        const kind = kindOf(el);
        animate(el, SHOWN[kind], {
          duration,
          delay: Math.min(i, MAX_STAGGER_STEPS) * stagger,
          ease: [0.2, 0, 0, 1],
        });
      });
      queue = [];
    };

    const scan = () => {
      const fold = window.innerHeight;
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (done.has(el)) return;
        done.add(el);
        if (el.getBoundingClientRect().top < fold && !el.closest("[data-reveal-live]")) return;
        const kind = kindOf(el);
        animate(el, HIDDEN[kind], { duration: 0 });
        stops.push(
          inView(
            el,
            () => {
              queue.push(el);
              if (!flushFrame) flushFrame = requestAnimationFrame(flush);
            },
            { amount: kind === "rise" ? 0.15 : 0.5 },
          ),
        );
      });
    };

    scan();
    // Konten yang mengalir belakangan (Suspense, pindah halaman, hasil Cek Cepat) ikut dipindai.
    let scanFrame = 0;
    const mutations = new MutationObserver(() => {
      if (!scanFrame)
        scanFrame = requestAnimationFrame(() => {
          scanFrame = 0;
          scan();
        });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      cancelAnimationFrame(scanFrame);
      cancelAnimationFrame(flushFrame);
      stops.forEach((stop) => stop());
    };
  }, []);
  return null;
}
