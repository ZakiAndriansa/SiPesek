import type { ReactNode } from "react";
import { QuickChrome } from "@/components/shell/Shell";

export default function QuickLayout({ children }: { children: ReactNode }) {
  return <QuickChrome>{children}</QuickChrome>;
}
