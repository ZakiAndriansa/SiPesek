import type { Metadata } from "next";
import { RingkasanKebijakan } from "@/features/kebijakan/RingkasanKebijakan";

export const metadata: Metadata = {
  title: "Ringkasan Dashboard Kebijakan",
  description: "Ringkasan daya tampung dan persaingan SMA dan SMK negeri Kota Depok dari data hasil SPMB.",
};

export default function KebijakanRingkasanPage() {
  return <RingkasanKebijakan />;
}
