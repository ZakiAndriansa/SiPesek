import type { Metadata } from "next";
import { EksporKebijakan } from "@/features/kebijakan/EksporKebijakan";

export const metadata: Metadata = {
  title: "Ekspor Data",
  description: "Unduh data dashboard kebijakan SPMB dalam bentuk CSV.",
};

export default function KebijakanEksporPage() {
  return <EksporKebijakan />;
}
