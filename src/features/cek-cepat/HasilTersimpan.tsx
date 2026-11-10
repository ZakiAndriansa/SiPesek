"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Breadcrumb, Button } from "@/components";
import { HapusHasil } from "@/features/ortu/HapusHasil";
import { pilihAnakAktif, useOrtu } from "@/features/ortu/store";
import { TampilanHasil } from "@/features/hasil/TampilanHasil";
import { ambil } from "@/lib/ambil";
import type { ResponsPeluang } from "@/lib/kontrak";
import { lupakanSesi } from "@/lib/session-actions";

type Status = "memuat" | "ada" | "belum-masuk" | "tidak-ada" | "galat";

const tanggal = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const JENJANG_SEKOLAH = (r: ResponsPeluang) => {
  const ada = new Set(r.hasil.map((h) => h.sekolah.jenjang));
  return ada.size > 1 ? "SMA dan SMK" : ([...ada][0] ?? null);
};

/**
 * Satu hasil dari riwayat anak (dibuka dari Data Anak). Hasil terbaru anak itu langsung diarahkan ke Hasil Sekolah,
 * agar hanya ada satu tempat untuk hasil terkini. Hasil lama memakai tampilan yang sama (mode lama): ada penanda
 * bahwa ini bukan hasil terbaru, dan tanpa tombol Pilih agar rencana pilihan tidak tercampur.
 * Diambil dari GET /api/hasil/[token] di klien agar cookie sesi ikut terkirim; hanya pemilik akun yang mendapat datanya.
 */
export function HasilTersimpan({ token }: { token: string }) {
  const router = useRouter();
  const ortu = useOrtu();
  const [result, setResult] = useState<ResponsPeluang | null>(null);
  const [status, setStatus] = useState<Status>("memuat");
  // Dinaikkan oleh tombol "Coba lagi" untuk mengulang pengambilan.
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    let batal = false;
    ambil(`/api/hasil/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (batal) return;
        if (res.status === 401) return setStatus("belum-masuk");
        if (res.status === 404) return setStatus("tidak-ada");
        if (!res.ok) return setStatus("galat");
        setResult((await res.json()) as ResponsPeluang);
        setStatus("ada");
      })
      .catch(() => !batal && setStatus("galat"));
    return () => {
      batal = true;
    };
  }, [token, percobaan]);

  const anakId = result?.anak?.id;
  const anak = anakId !== undefined ? ortu.anak.find((a) => a.id === anakId) : undefined;
  const terbaru = !!anak && anak.riwayat[0]?.token === token;

  // Hasil terbaru: tampilkan di Hasil Sekolah (anak ini dijadikan anak aktif).
  useEffect(() => {
    if (terbaru && anakId !== undefined) {
      pilihAnakAktif(anakId);
      router.replace("/peta-sekolah");
    }
  }, [terbaru, anakId, router]);

  function keTerbaru() {
    if (anakId !== undefined) pilihAnakAktif(anakId);
    router.push("/peta-sekolah");
  }

  if (status === "memuat" || (status === "ada" && (ortu.status === "memuat" || terbaru))) {
    return (
      <div className="card" aria-busy="true">
        <p className="text-secondary">Memuat hasil…</p>
      </div>
    );
  }
  if (status === "belum-masuk") {
    return (
      <Alert
        kind="info"
        title="Masuk dulu untuk membuka hasil ini"
        action={
          <Button
            variant="secondary"
            onClick={async () => {
              await lupakanSesi();
              router.push(`/masuk?next=${encodeURIComponent(`/hasil/${token}`)}`);
            }}
          >
            Masuk dengan Google
          </Button>
        }
      >
        Hasil cek berisi data anak, jadi hanya bisa dibuka oleh akun yang menyimpannya.
      </Alert>
    );
  }
  if (status === "tidak-ada" || !result) {
    return (
      <Alert
        kind={status === "galat" ? "danger" : "info"}
        title={status === "galat" ? "Hasil belum bisa dimuat" : "Hasil tidak ditemukan"}
        action={
          status === "galat" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setStatus("memuat");
                setPercobaan((n) => n + 1);
              }}
            >
              Coba lagi
            </Button>
          ) : (
            <Button variant="secondary" href="/anak-saya">
              Lihat data anak
            </Button>
          )
        }
      >
        {status === "galat"
          ? "Server SiPesek belum menjawab. Periksa internet, lalu coba lagi."
          : "Hasil ini sudah dihapus, atau disimpan oleh akun lain."}
      </Alert>
    );
  }

  const nama = result.anak?.nama ?? "Anak";
  const tgl = tanggal(result.dibuatPada);
  return (
    <TampilanHasil
      hasil={result}
      mode="lama"
      judul="Hasil Sekolah"
      konteks={[nama, JENJANG_SEKOLAH(result), `dari cek ${tgl}`]
        .filter(Boolean)
        .join(" · ")}
      atas={
        <div className="stack">
          <Breadcrumb items={[["Data Anak", "/anak-saya"], [`Hasil ${tgl}`]]} />
          <Alert
            kind="info"
            title={`Ini hasil lama dari ${tgl}`}
            action={
              <Button variant="secondary" icon="arrow-right" onClick={keTerbaru}>
                Lihat hasil terbaru
              </Button>
            }
          >
            Pilihan sekolah, strategi, dan dokumen memakai hasil terbaru {nama}.
          </Alert>
        </div>
      }
      aksiKepala={anakId !== undefined && <HapusHasil token={token} nama={nama} dibuatPada={result.dibuatPada} setelahHapus={() => router.push("/anak-saya")} />}
      tanggalCetak={tgl}
    />
  );
}
