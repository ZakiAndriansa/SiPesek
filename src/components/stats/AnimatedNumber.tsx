"use client";
import NumberFlow from "@number-flow/react";
import { inView } from "motion";
import { useEffect, useRef, useState } from "react";

// "12.480", "71%", "1,2 km", "2 cara", "Rp 3.500.000". Teks dengan angka lain di akhiran
// (misal "80–92%") tidak dianimasikan supaya tidak menyesatkan.
const PATTERN = /^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(\D*)$/;

function parse(text: string) {
  const match = PATTERN.exec(text.trim());
  if (!match) return null;
  const [, prefix, whole, fraction = "", suffix] = match;
  return {
    prefix,
    suffix,
    value: Number(`${whole.replaceAll(".", "")}.${fraction || 0}`),
    digits: fraction.length,
  };
}

/**
 * G-01 / B-04: angka bergeser dari 0 ke nilai akhir sekali saat pertama masuk layar, dan hanya
 * digit yang berubah bila nilainya diganti. HTML server sudah berisi nilai akhir; angka yang
 * sudah terlihat saat halaman dibuka tidak dianimasikan. NumberFlow mengikuti "kurangi gerak".
 */
export function AnimatedNumber({ value }: { value: string }) {
  const parsed = parse(value);
  const ref = useRef<HTMLSpanElement>(null);
  const target = parsed?.value ?? 0;
  const [shown, setShown] = useState(target);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || el.getBoundingClientRect().top < window.innerHeight) {
      setShown(target);
      return;
    }
    setShown(0);
    return inView(el, () => setShown(target), { amount: 0.5 });
  }, [target]);

  if (!parsed) return <>{value}</>;
  return (
    <span ref={ref}>
      <NumberFlow
        value={shown}
        locales="id-ID"
        format={{ minimumFractionDigits: parsed.digits, maximumFractionDigits: parsed.digits }}
        prefix={parsed.prefix}
        suffix={parsed.suffix}
      />
    </span>
  );
}
