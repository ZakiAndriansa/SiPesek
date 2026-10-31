"use client";
import { inView } from "motion";
import { useEffect } from "react";

// Reveal saat scroll untuk halaman server tanpa mengubah DOM:
//   data-reveal              elemen naik 12px dan muncul sekali saat masuk layar
//   data-reveal="draw-y"     garis tergambar dari atas (scaleY)
//   data-reveal="draw-x"     bar tergambar dari kiri (scaleX)
//   data-reveal-group        setiap anak langsung muncul berurutan
//   data-reveal-live         (pada elemen itu atau induknya) animasikan juga yang sudah terlihat
// Elemen yang sudah terlihat saat dipindai tidak dianimasikan, supaya isi di atas lipatan tidak
// tertunda. Tanpa JS atau dengan "kurangi gerak", semua langsung terlihat.
//
// Keadaan awal "tersembunyi" dibuat dengan Web Animations API (animasi dijeda di frame pertama),
// bukan dengan style inline atau atribut. Dengan begitu atribut elemen yang dirender server tidak
// pernah berubah, sehingga React tidak melaporkan hydration mismatch walau sebuah batas Suspense
// baru di-hydrate setelah pemindaian ini.

const SELECTOR = "[data-reveal], [data-reveal-group] > *";
const MAX_STAGGER_STEPS = 5;

type Kind = "rise" | "draw-y" | "draw-x";

function token(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

const kindOf = (el: HTMLElement): Kind => {
  const v = el.dataset.reveal;
  return v === "draw-y" || v === "draw-x" ? v : "rise";
};

const FRAMES: Record<Kind, Keyframe[]> = {
  rise: [
    { opacity: 0, translate: "0 12px" },
    { opacity: 1, translate: "0 0" },
  ],
  "draw-y": [
    { scale: "1 0", transformOrigin: "top" },
    { scale: "1 1", transformOrigin: "top" },
  ],
  "draw-x": [
    { scale: "0 1", transformOrigin: "left" },
    { scale: "1 1", transformOrigin: "left" },
  ],
};

export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duration = token("--duration-reveal", 500);
    const stagger = token("--stagger", 60);
    const done = new WeakSet<Element>();
    const stops: VoidFunction[] = [];
    const held: Animation[] = [];
    let queue: Animation[] = [];
    let flushFrame = 0;

    // Elemen yang masuk layar di frame yang sama muncul berurutan, maksimal 6 langkah jeda.
    const flush = () => {
      flushFrame = 0;
      queue.forEach((animation, i) => {
        animation.effect?.updateTiming({ delay: Math.min(i, MAX_STAGGER_STEPS) * stagger });
        animation.onfinish = () => animation.cancel();
        animation.play();
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
        const animation = el.animate(FRAMES[kind], {
          duration,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
          fill: "both",
        });
        animation.pause();
        held.push(animation);
        stops.push(
          inView(
            el,
            () => {
              queue.push(animation);
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
      held.forEach((animation) => animation.cancel());
    };
  }, []);
  return null;
}
