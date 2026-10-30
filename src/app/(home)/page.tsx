import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Perkiraan peluang anak masuk SMA/SMK negeri di Kota Depok per jalur SPMB, berdasarkan hasil SPMB tahun lalu, beserta alternatif sekolah swasta terdekat.",
};
export default function BerandaPage() {
  return <LandingPage />;
}
