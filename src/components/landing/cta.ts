import { continueFor } from "@/components/shell/Shell";
import { homeFor, type Session } from "@/lib/accounts";
import type { LandingCta } from "./LandingPage";

/** Ajakan utama sesuai sesi, dipakai beranda dan Panduan: tamu ke Cek Cepat atau Masuk, orang tua ke tahap berikutnya anaknya. */
export function ctaUntuk(session: Session | null): LandingCta {
  if (session?.role === "orang-tua") {
    const c = continueFor(session);
    return { href: c.href, label: c.label, ctaLabel: c.label };
  }
  if (session) return { href: homeFor(session), label: "Buka Dashboard", ctaLabel: "Buka Dashboard" };
  return {
    href: "/cek-cepat",
    label: "Cek Peluang Sekarang",
    ctaLabel: "Cek Peluang Sekarang",
    secondary: { href: "/masuk", label: "Masuk dengan Google" },
    hint: "Siapkan NISN anak (ada di rapor atau kartu pelajar).",
    trust: "Gratis  •  Cek Cepat tanpa akun & tidak disimpan  •  Masuk untuk menyimpan riwayat",
  };
}
