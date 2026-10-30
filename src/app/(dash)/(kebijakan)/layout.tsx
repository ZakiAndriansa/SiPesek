import type { ReactNode } from "react";
import { DashChrome } from "@/components/shell/Shell";
import { POLICY } from "@/lib/nav";

export default function KebijakanLayout({ children }: { children: ReactNode }) {
  return <DashChrome menu={POLICY}>{children}</DashChrome>;
}
