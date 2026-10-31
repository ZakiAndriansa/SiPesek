import type { Metadata } from "next";
import { DataSekolah } from "@/features/admin/DataSekolah";

export const metadata: Metadata = {
  title: "Data Sekolah dan Daya Tampung",
  description: "Lengkapi koordinat, alamat, daya tampung sekolah negeri, dan biaya sekolah swasta.",
};

export default function AdminSekolahPage() {
  return <DataSekolah />;
}
