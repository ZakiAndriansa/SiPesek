"use client";
import { useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Choice, ChoiceGroup, Field, Form } from "@/components";
import { importQuickCheck } from "@/lib/quick-check-actions";
import type { QuickDraft } from "@/lib/quick-check";
import { clearDraft, getDraft } from "./draft-store";
import { useRouter } from "next/navigation";

/** Pindahkan draf Cek Cepat ke akun, sekali, dengan persetujuan. NISN tidak pernah ikut. */
export function SaveDraft() {
  const router = useRouter();
  const [draft, setLocal] = useState<QuickDraft | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Draf ada di penyimpanan browser: baru bisa dibaca setelah hidrasi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal(getDraft());
  }, []);

  if (draft === undefined) return null;
  if (!draft) {
    return (
      <Alert kind="info" title="Tidak ada hasil untuk disimpan">
        Hasil Cek Cepat hanya ada selama tab tetap terbuka. Ulangi pengecekan, lalu tekan Simpan.
      </Alert>
    );
  }
  const { input } = draft;
  const filled = input.nilai.filter((v) => v !== null).length;

  async function submit() {
    const nama = document.querySelector<HTMLInputElement>("#nama")?.value ?? "";
    const setuju = document.querySelector<HTMLInputElement>('input[name="setuju-simpan"]')?.checked ?? false;
    setBusy(true);
    setError("");
    const current = draft!.input;
    clearDraft();
    const reply = await importQuickCheck({ nama, setuju, input: current });
    // Sampai sini hanya bila gagal (sukses mengalihkan halaman).
    if (reply && !reply.ok) {
      setBusy(false);
      setError(reply.error);
      router.refresh();
    }
  }

  return (
    <div className="card quick__card">
      <h2 className="card__title">Yang akan dipindahkan</h2>
      <ul className="quick__summary">
        <li>Jenjang tujuan: {input.jenjang === "belum" ? "Belum tahu" : input.jenjang.toUpperCase()}</li>
        <li>Nilai rapor: {filled} dari 5 semester terisi</li>
        <li>Kecamatan: {input.kecamatan} (titik rumah tidak ikut, tandai lagi di langkah 5)</li>
        <li>Kondisi keluarga: {input.ketm === "ya" ? "KETM" : input.ketm === "tidak" ? "Bukan KETM" : "Belum yakin"}</li>
        <li>Prestasi: {input.prestasi || "Tidak ada"}</li>
      </ul>
      <p className="text-secondary">NISN tidak ikut dipindahkan.</p>
      <Form id="simpan-form" onValid={submit}>
        <Field id="nama" label="Nama anak" hint="Tulis seperti di akta kelahiran." required errorRequired="Nama anak belum diisi." autoComplete="off" maxLength={60} />
        <ChoiceGroup legend="Persetujuan" errorName="setuju-simpan">
          <Choice type="checkbox" name="setuju-simpan" value="ya" title="Saya setuju data ini disimpan di akun saya" desc="Data dipakai untuk melanjutkan pengisian dan perhitungan peluang." required errorRequired="Centang persetujuan untuk menyimpan." />
        </ChoiceGroup>
        {error && (
          <Alert kind="danger" title="Belum bisa disimpan">
            {error}
          </Alert>
        )}
        <ButtonGroup>
          <Button variant="primary" block type="submit">
            {busy ? "Menyimpan…" : "Simpan ke Akun"}
          </Button>
          <Button variant="ghost" block href="/cek-cepat" onClick={() => clearDraft()}>
            Batal
          </Button>
        </ButtonGroup>
      </Form>
    </div>
  );
}
