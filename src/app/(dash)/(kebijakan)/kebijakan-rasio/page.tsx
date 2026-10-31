import type { Metadata } from "next";
import { KecamatanKebijakan } from "@/features/kebijakan/KecamatanKebijakan";

export const metadata: Metadata = {
  title: "Peluang per Kecamatan",
  description: "Persentase pendaftar yang diterima di sekolah negeri menurut kecamatan Kartu Keluarga.",
};

export default function KebijakanRasioPage() {
  return <KecamatanKebijakan />;
}
