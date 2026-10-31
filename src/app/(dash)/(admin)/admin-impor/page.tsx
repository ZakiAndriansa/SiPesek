import type { Metadata } from "next";
import { ImporData } from "@/features/admin/ImporData";

export const metadata: Metadata = {
  title: "Impor Data Seleksi",
  description: "Impor CSV klasemen SPMB sebagai statistik agregat untuk mesin peluang dan dashboard.",
};

export default function AdminImporPage() {
  return <ImporData />;
}
