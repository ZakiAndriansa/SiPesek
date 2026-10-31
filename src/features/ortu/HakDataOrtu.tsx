"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ButtonGroup, Dialog } from "@/components";
import { useToast } from "@/components/toast/Toast";
import type { ResponsAnak, ResponsOrtu, ResponsPeluang, ResponsRiwayat } from "@/lib/kontrak";
import { lupakanSesi } from "@/lib/session-actions";
import { bacaIsian } from "./isian";
import { lupakanDataOrtu, useOrtu } from "./store";

class SesiHabis extends Error {}

async function ambil<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status === 401) throw new SesiHabis();
  if (!res.ok) throw new Error(url);
  return (await res.json()) as T;
}

/**
 * Salinan semua data akun, diambil langsung dari server saat tombol ditekan (bukan dari tampilan yang
 * mungkin belum diperbarui), ditambah isian wizard yang hanya ada di perangkat ini.
 */
async function susunSalinan() {
  const akun = await ambil<ResponsOrtu>("/api/ortu/saya");
  const { anak } = await ambil<ResponsAnak>("/api/ortu/anak");
  return {
    keterangan: "Salinan data akun SiPesek milik orang tua yang mengunduhnya.",
    diunduhPada: new Date().toISOString(),
    akun: { nama: akun.nama, email: akun.email },
    tidakDisimpan:
      "NISN lengkap, titik rumah, dan nilai rapor tidak disimpan di server SiPesek, jadi tidak ada di salinan ini. " +
      "Yang tersimpan dari NISN hanya 3 angka terakhirnya.",
    anak: await Promise.all(
      anak.map(async (a) => {
        const { riwayat } = await ambil<ResponsRiwayat>(`/api/ortu/riwayat?anakId=${a.id}`);
        return {
          nama: a.nama,
          nisnBerakhiran: a.nisnAkhir,
          nisnLazim: a.nisnLazim,
          isianDiPerangkatIni: bacaIsian(a.id),
          riwayatCek: await Promise.all(
            riwayat.map(async (r) => {
              const hasil = await ambil<ResponsPeluang>(`/api/hasil/${encodeURIComponent(r.token)}`);
              return { ...r, hasil: { hasil: hasil.hasil, swasta: hasil.swasta, catatan: hasil.catatan, skorAnak: hasil.skorAnak } };
            }),
          ),
        };
      }),
    ),
  };
}

function unduhBerkas(nama: string, isi: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(isi, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Hak atas data untuk akun Google: unduh salinan data dan hapus akun beserta semua data anak. */
export function HakDataOrtu() {
  const router = useRouter();
  const { show } = useToast();
  const { anak } = useOrtu();
  const [proses, setProses] = useState<"unduh" | "hapus" | null>(null);
  const [galat, setGalat] = useState<"sesi" | "unduh" | "hapus" | null>(null);

  async function unduh() {
    setProses("unduh");
    setGalat(null);
    try {
      // Tanggal lokal (WIB), bukan UTC, agar nama berkas sesuai hari orang tua mengunduh.
      const tanggal = new Date().toLocaleDateString("sv-SE");
      unduhBerkas(`salinan-data-sipesek-${tanggal}.json`, await susunSalinan());
    } catch (e) {
      setGalat(e instanceof SesiHabis ? "sesi" : "unduh");
    }
    setProses(null);
  }

  async function hapusAkun() {
    setProses("hapus");
    setGalat(null);
    const res = await fetch("/api/ortu/akun", { method: "DELETE" }).catch(() => null);
    if (res?.status === 401) {
      setProses(null);
      return setGalat("sesi");
    }
    if (!res?.ok) {
      setProses(null);
      return setGalat("hapus");
    }
    // Akun sudah tidak ada: bersihkan isian di perangkat dan cookie sesi, lalu kembali ke Beranda.
    lupakanDataOrtu({ perangkat: true });
    await lupakanSesi();
    show("Akun dan seluruh data anak sudah dihapus dari SiPesek.", "success");
    router.replace("/");
  }

  const daftarNama = anak.map((a) => a.nama).join(", ");
  return (
    <div className="card">
      <p className="card__text">
        Data anak dan riwayat cek hanya bisa dibuka oleh akun ini. Bapak/Ibu bisa mengunduh salinannya (berkas JSON) atau
        menghapus akun beserta seluruh data anak kapan saja.
      </p>
      <ButtonGroup>
        <Button variant="secondary" iconLeft="download" onClick={proses ? undefined : unduh}>
          {proses === "unduh" ? "Menyiapkan salinan…" : "Unduh Salinan Data"}
        </Button>
        <Button variant="ghost" iconLeft="trash" opens="dlg-hapus-akun">
          {proses === "hapus" ? "Menghapus…" : "Hapus Akun dan Seluruh Data"}
        </Button>
      </ButtonGroup>
      <p className="text-caption text-secondary">
        Salinan data berupa berkas JSON untuk arsip dan hak data Bapak/Ibu, dan tidak bisa diimpor kembali ke SiPesek. Untuk
        ringkasan yang mudah dibaca dan dicetak, buka halaman{" "}
        <Link className="link" href="/unduhan">
          Dokumen
        </Link>
        .
      </p>
      {galat === "unduh" && <Alert kind="danger">Salinan belum bisa disiapkan. Periksa internet, lalu coba lagi.</Alert>}
      {galat === "hapus" && <Alert kind="danger">Akun belum bisa dihapus. Periksa internet, lalu coba lagi.</Alert>}
      {galat === "sesi" && (
        <Alert
          kind="info"
          title="Sesi masuk sudah berakhir"
          action={
            <Button
              variant="secondary"
              onClick={async () => {
                await lupakanSesi();
                router.push("/masuk?next=%2Fanak-saya");
              }}
            >
              Masuk lagi dengan Google
            </Button>
          }
        >
          Masuk lagi, lalu ulangi permintaan ini.
        </Alert>
      )}
      <Dialog
        id="dlg-hapus-akun"
        title="Hapus akun dan seluruh data?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" closes onClick={proses ? undefined : hapusAkun}>
              Ya, hapus permanen
            </Button>
          </>
        }
      >
        <p>
          {anak.length > 0
            ? `Akun ini beserta data ${daftarNama} dan semua riwayat ceknya terhapus permanen dari SiPesek.`
            : "Akun ini terhapus permanen dari SiPesek."}{" "}
          Tindakan ini tidak bisa dibatalkan. Bila perlu, unduh salinan data dulu.
        </p>
      </Dialog>
    </div>
  );
}
