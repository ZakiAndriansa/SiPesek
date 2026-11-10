"use client";
import { useEffect, useState } from "react";
import { Alert, Button } from "@/components";
import { ambilBaruDisimpan, lupakanBaruDisimpan } from "@/features/cek-cepat/draft-store";
import { TampilanHasil } from "@/features/hasil/TampilanHasil";
import { DenganHasil, KonteksCek, tanggalCek, type DataTahap } from "./Wadah";

/** Hasil Sekolah untuk akun Google: semua sekolah negeri dari hasil cek terakhir anak aktif. */
export function HasilSekolahOrtu() {
  return <DenganHasil>{(data) => <Isi {...data} />}</DenganHasil>;
}

/**
 * Hasil terbaru anak aktif dalam tampilan hasil bersama (mode pilih). Tepat setelah isi data, edit data, atau
 * simpan dari Cek Cepat, orang tua tiba di sini dengan pesan "Hasil tersimpan"; pesan itu hanya muncul sekali.
 */
function Isi({ aktif, terakhir, hasil }: DataTahap) {
  // Dibaca sekali saat halaman dibuka, lalu dilupakan agar tidak muncul lagi saat kembali ke halaman ini.
  const [baru] = useState(() => ambilBaruDisimpan(terakhir.token));
  const [tampilPesan, setTampilPesan] = useState(!!baru);
  useEffect(() => {
    if (baru) lupakanBaruDisimpan();
  }, [baru]);

  return (
    <TampilanHasil
      hasil={hasil}
      mode="pilih"
      judul="Hasil Sekolah"
      konteks={<KonteksCek aktif={aktif} terakhir={terakhir} />}
      namaAnak={aktif.nama.split(" ")[0]}
      atas={
        baru &&
        tampilPesan && (
          <Alert
            kind="success"
            title="Hasil tersimpan"
            action={
              <Button variant="ghost" sm onClick={() => setTampilPesan(false)}>
                Tutup
              </Button>
            }
          >
            {baru.pesan}
          </Alert>
        )
      }
      input={baru?.input ?? null}
      tanggalCetak={tanggalCek(terakhir.dibuatPada)}
      lanjut={{ href: "/strategi", label: "Lanjut ke Strategi" }}
    />
  );
}
