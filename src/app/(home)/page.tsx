import type { Metadata } from "next";
import { continueFor } from "@/components/shell/Shell";
import { LandingPage, type LandingCta } from "@/components/landing/LandingPage";
import { homeFor } from "@/lib/accounts";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Perkiraan peluang anak masuk SMA/SMK negeri di Kota Depok per jalur SPMB, berdasarkan hasil SPMB tahun lalu, beserta alternatif sekolah swasta terdekat.",
};

export default async function IndexPage() {
  const session = await getSession();
  let cta: LandingCta = {
    href: "/cek-cepat",
    label: "Cek Cepat dengan NISN",
    ctaLabel: "Cek Cepat dengan NISN",
    secondary: { href: "/masuk", label: "Masuk & Simpan Progres" },
    trust: "Gratis\u00a0 • \u00a0Cek Cepat tanpa akun, tidak disimpan\u00a0 • \u00a0Masuk untuk menyimpan progres",
  };
  if (session?.role === "orang-tua") {
    const c = continueFor(session);
    cta = { href: c.href, label: c.label, ctaLabel: c.label };
  } else if (session) {
    cta = { href: homeFor(session), label: "Buka Dashboard", ctaLabel: "Buka Dashboard" };
  }
  return <LandingPage cta={cta} />;
}
