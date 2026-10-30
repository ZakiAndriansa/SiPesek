import type { ReactNode } from "react";
import { LandingChrome } from "@/components/shell/Shell";
export default function HomeLayout({ children }: { children: ReactNode }) {
  return <LandingChrome>{children}</LandingChrome>;
}
