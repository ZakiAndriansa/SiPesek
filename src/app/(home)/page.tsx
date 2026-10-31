import type { Metadata } from "next";
import { ctaUntuk } from "@/components/landing/cta";
import { LandingPage } from "@/components/landing/LandingPage";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Perkiraan peluang anak masuk SMA/SMK negeri di Kota Depok per jalur SPMB, berdasarkan hasil SPMB tahun lalu, beserta alternatif sekolah swasta terdekat.",
};

export default async function IndexPage() {
  return <LandingPage cta={ctaUntuk(await getSession())} />;
}
