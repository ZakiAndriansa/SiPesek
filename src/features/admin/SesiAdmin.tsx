"use client";
import { usePathname } from "next/navigation";
import { Alert, Button } from "@/components";

/** Sesi admin (8 jam) habis saat halaman terbuka: API menjawab 401. */
export function SesiAdminBerakhir() {
  const pathname = usePathname();
  return (
    <Alert
      kind="info"
      title="Sesi admin sudah berakhir"
      action={
        <Button variant="secondary" href={`/masuk-petugas?next=${encodeURIComponent(pathname)}`}>
          Masuk lagi
        </Button>
      }
    >
      Sesi admin berlaku 8 jam. Masuk lagi untuk melanjutkan; perubahan yang belum disimpan perlu diulang.
    </Alert>
  );
}
