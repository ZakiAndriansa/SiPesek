import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import "@/styles";
import { Sprite } from "@/components/icon/Sprite";
import { ToastProvider, ToastRegion } from "@/components/toast/Toast";
export const metadata: Metadata = {
  title: {
    default: "SiPesek",
    template: "%s | SiPesek",
  },
  description:
    "Perkiraan peluang anak masuk SMA/SMK negeri di Kota Depok per jalur SPMB, berdasarkan hasil SPMB tahun lalu, beserta alternatif sekolah swasta terdekat.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Ekstensi browser (mis. LanguageTool, ColorZilla) menambah atribut ke <html> dan <body> sebelum
    // React hydrate. suppressHydrationWarning hanya mengabaikan atribut elemen ini, bukan isinya.
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Josefin+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&family=Outfit:wght@400;500;600;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        <Sprite />
        <ToastProvider>
          {/* cacheComponents aktif: halaman yang membaca cookie sesi harus berada di dalam Suspense. */}
          <Suspense fallback={null}>{children}</Suspense>
          <ToastRegion />
        </ToastProvider>
      </body>
    </html>
  );
}
