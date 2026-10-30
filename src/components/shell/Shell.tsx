import type { ReactNode } from "react";
import { Footer } from "../footer/Footer";
import { Navbar } from "../navbar/Navbar";
const SkipLink = () => (
  <a className="skip-link" href="#konten">
    Lewati ke konten
  </a>
);
/** Cangkang halaman publik: navbar, isi, footer. Tidak ada login untuk orang tua. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="konten">{children}</main>
      <Footer />
    </>
  );
}
/** Cangkang beranda: navbar, isi, dan footer di lembar krem dengan latar gradien oranye. */
export function LandingChrome({ children }: { children: ReactNode }) {
  return (
    <div className="landing-page">
      <div className="landing-sheet">
        <SkipLink />
        <Navbar />
        <main id="konten">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
