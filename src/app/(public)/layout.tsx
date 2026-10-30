import type { ReactNode } from "react";
import { SiteChrome } from "@/components/shell/Shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <SiteChrome area="public">{children}</SiteChrome>;
}
