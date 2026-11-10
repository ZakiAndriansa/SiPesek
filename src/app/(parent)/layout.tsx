import type { ReactNode } from "react";
import { SiteChrome } from "@/components/shell/Shell";
// Gaya halaman orang tua hanya dimuat di area ini, tidak ikut ke Beranda dan Cek Cepat.
import "@/styles/ortu.css";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return <SiteChrome area="parent">{children}</SiteChrome>;
}
