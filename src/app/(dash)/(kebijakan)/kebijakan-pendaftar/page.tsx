import type { Metadata } from "next";
import { PendaftarKebijakan } from "@/features/kebijakan/PendaftarKebijakan";

export const metadata: Metadata = {
  title: "Tekanan Pendaftar",
  description: "Pendaftar pilihan pertama per kursi, daya tampung, dan kuota belum terisi tiap sekolah negeri.",
};

export default function KebijakanPendaftarPage() {
  return <PendaftarKebijakan />;
}
