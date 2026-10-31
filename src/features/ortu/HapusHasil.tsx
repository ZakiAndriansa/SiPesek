"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Alert, Button, Dialog } from "@/components";
import { lupakanSesi } from "@/lib/session-actions";
import { hapusHasil } from "./store";

// Dengan jam, agar dua cek di hari yang sama bisa dibedakan.
const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Tombol hapus satu hasil cek beserta dialog konfirmasinya. `ikon` untuk baris riwayat di Data Anak;
 * selain itu tombol berteks. `setelahHapus` dipanggil setelah berhasil (misal pindah dari halaman hasil itu).
 */
export function HapusHasil({
  token,
  nama,
  dibuatPada,
  ikon = false,
  setelahHapus,
}: {
  token: string;
  nama: string;
  dibuatPada: string;
  ikon?: boolean;
  setelahHapus?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [galat, setGalat] = useState<"belum-masuk" | "galat" | null>(null);
  const dialog = `dlg-hapus-hasil-${token}`;
  const kapan = tanggal(dibuatPada);

  async function hapus() {
    setBusy(true);
    setGalat(null);
    const status = await hapusHasil(token);
    setBusy(false);
    if (status === "ok") setelahHapus?.();
    else setGalat(status);
  }

  return (
    <>
      <Button
        variant="ghost"
        sm
        iconOnly={ikon}
        iconLeft="trash"
        opens={dialog}
        aria-label={ikon ? `Hapus hasil cek ${kapan}` : undefined}
      >
        {ikon ? null : busy ? "Menghapus…" : "Hapus hasil ini"}
      </Button>
      <Dialog
        id={dialog}
        title="Hapus hasil ini?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" closes onClick={hapus}>
              Ya, hapus hasil
            </Button>
          </>
        }
      >
        <p>
          Hasil cek {kapan} untuk {nama} terhapus permanen dari riwayat. Data anak dan hasil lainnya tetap ada. Hasil
          Sekolah, Strategi, dan Dokumen memakai hasil sebelumnya bila ada.
        </p>
      </Dialog>
      {galat === "galat" && (
        <Alert kind="danger">Hasil belum bisa dihapus. Periksa internet, lalu coba lagi.</Alert>
      )}
      {galat === "belum-masuk" && (
        <Alert
          kind="info"
          title="Sesi masuk sudah berakhir"
          action={
            <Button
              variant="secondary"
              onClick={async () => {
                await lupakanSesi();
                router.push(`/masuk?next=${encodeURIComponent(pathname)}`);
              }}
            >
              Masuk lagi dengan Google
            </Button>
          }
        >
          Masuk lagi, lalu hapus hasil ini sekali lagi.
        </Alert>
      )}
    </>
  );
}
