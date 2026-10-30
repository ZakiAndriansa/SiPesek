import type { ReactNode } from "react";
import { DashChrome } from "@/components/shell/Shell";
import { ADMIN } from "@/lib/nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashChrome menu={ADMIN}>{children}</DashChrome>;
}
