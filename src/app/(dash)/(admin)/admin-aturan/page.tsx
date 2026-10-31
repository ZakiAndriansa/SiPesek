import type { Metadata } from "next";
import { AturanSpmb } from "@/features/admin/AturanSpmb";

export const metadata: Metadata = {
  title: "Aturan SPMB",
  description: "Rumus skor jalur prestasi, ambang data, dan tahun acuan mesin peluang SiPesek.",
};

export default function AdminAturanPage() {
  return <AturanSpmb />;
}
