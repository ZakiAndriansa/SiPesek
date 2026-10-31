import type { Metadata } from "next";
import { RayonKebijakan } from "@/features/kebijakan/RayonKebijakan";

export const metadata: Metadata = {
  title: "Rayon dan Sebaran Sekolah",
  description: "Peta sekolah negeri, radius Jalur Domisili, dan rayon tanpa SMAN reguler di Kota Depok.",
};

export default function KebijakanBlankSpotPage() {
  return <RayonKebijakan />;
}
