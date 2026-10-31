"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@/components";
import type { ResponsPeluang } from "@/lib/kontrak";
import type { QuickCheckInput } from "@/lib/quick-check";
import { lupakanSesi } from "@/lib/session-actions";
import { ambilBaruDisimpan } from "./draft-store";
import { HasilCepat } from "./HasilCepat";

type Status = "memuat" | "ada" | "belum-masuk" | "tidak-ada" | "galat";

const tanggal = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

/**
 * Hasil cek yang tersimpan di riwayat anak. Tepat setelah disimpan, hasilnya diambil dari memori tab
 * (lengkap dengan isian untuk laporan cetak). Bila dibuka lagi nanti, diambil dari GET /api/hasil/[token]
 * di klien agar cookie sesi ikut terkirim; hanya pemilik akun yang mendapat datanya.
 */
export function HasilTersimpan({ token }: { token: string }) {
  const router = useRouter();
  // Memori tab kosong saat render di server maupun setelah muat ulang, jadi nilai awal ini selalu sama di keduanya.
  const [baru] = useState(() => ambilBaruDisimpan(token));
  const [result, setResult] = useState<ResponsPeluang | null>(baru?.result ?? null);
  const [input] = useState<QuickCheckInput | null>(baru?.input ?? null);
  const [status, setStatus] = useState<Status>(baru ? "ada" : "memuat");

  useEffect(() => {
    if (baru) return;
    let batal = false;
    fetch(`/api/hasil/${encodeURIComponent(token)}`)
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
  }, [baru, token]);

  if (status === "memuat") {
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
          <Button variant="secondary" href="/anak-saya">
            Lihat data anak
          </Button>
        }
      >
        {status === "galat"
          ? "Tidak tersambung ke server SiPesek. Periksa internet, lalu muat ulang halaman ini."
          : "Hasil ini sudah dihapus, atau disimpan oleh akun lain."}
      </Alert>
    );
  }

  const nama = result.anak?.nama ?? "anak";
  return (
    <div className="stack">
      {baru && (
        <Alert kind="success" title="Hasil tersimpan">
          {baru.anakBaru
            ? `${nama} sudah ditambahkan ke akun, dan hasil ini masuk ke riwayatnya.`
            : `NISN ini sudah ada di akun, jadi hasil ini masuk ke riwayat ${nama}.`}
        </Alert>
      )}
      <div className="no-print">
        <h1 className="text-heading-lg quick__title">Hasil {nama}</h1>
        <p className="text-secondary">
          Dicek {tanggal(result.dibuatPada)} dengan acuan SPMB {result.tahunAcuan}.
        </p>
      </div>
      <HasilCepat result={result} input={input} date={tanggal(new Date().toISOString())}>
        <Button variant="ghost" href="/cek-cepat">
          Cek lagi
        </Button>
        <Button variant="ghost" href="/anak-saya">
          Semua riwayat
        </Button>
      </HasilCepat>
    </div>
  );
}
