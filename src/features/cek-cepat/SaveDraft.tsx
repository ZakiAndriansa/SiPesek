"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ButtonGroup, Choice, ChoiceGroup, Field, Form } from "@/components";
import { ambil, pesanGagal } from "@/lib/ambil";
import type { PermintaanSimpanCek, ResponsSimpanCek } from "@/lib/kontrak";
import { toRequest, type QuickDraft } from "@/lib/quick-check";
import { lupakanSesi } from "@/lib/session-actions";
import { simpanIsian } from "@/features/ortu/isian";
import { simpanHasilBaru, tandaiUsang, tungguHasilBaru } from "@/features/ortu/store";
import { WIZARD_TOTAL_ORTU } from "@/lib/accounts";
import { clearDraft, getDraft, setBaruDisimpan } from "./draft-store";

const JENJANG = { sma: "SMA", smk: "SMK", belum: "Belum tahu (SMA dan SMK)" } as const;
const KETM = { ya: "KETM", tidak: "Bukan KETM", ragu: "Belum yakin KETM" } as const;

type Galat = { pesan: string; masukLagi?: boolean };

/**
 * Simpan hasil Cek Cepat ke riwayat anak di akun (POST /api/ortu/simpan-cek), sekali, dengan persetujuan.
 * Draf (termasuk NISN dan titik rumah) hanya ada di memori tab dan baru dibuang setelah tersimpan,
 * jadi bila gagal orang tua bisa mencoba lagi tanpa mengulang Cek Cepat.
 */
export function SaveDraft() {
  const router = useRouter();
  const [draft, setLocal] = useState<QuickDraft | null | undefined>(undefined);
  const [galat, setGalat] = useState<Galat | null>(null);
  const [busy, setBusy] = useState(false);
  // Penjaga klik ganda: menyimpan dua kali membuat dua riwayat dan memakai batas harian dua kali.
  const mengirim = useRef(false);

  useEffect(() => {
    // Draf ada di memori modul: baru bisa dibaca setelah hidrasi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal(getDraft());
  }, []);

  if (draft === undefined) return null;
  if (!draft) {
    return (
      <Alert
        kind="info"
        title="Tidak ada hasil untuk disimpan"
        action={
          <Button variant="secondary" href="/cek-cepat">
            Ulangi Cek Cepat
          </Button>
        }
      >
        Hasil Cek Cepat hanya ada selama tab tetap terbuka, dan hilang bila halaman dimuat ulang. Ulangi pengecekan, lalu
        tekan Simpan.
      </Alert>
    );
  }
  const { input, nisn } = draft;
  const lokasi = draft.input.lokasi ?? null;
  const semester = input.nilai.filter((v) => v !== null).length;

  async function submit() {
    if (mengirim.current) return;
    mengirim.current = true;
    const nama = document.querySelector<HTMLInputElement>("#nama")?.value.trim() ?? "";
    const body: PermintaanSimpanCek = { ...toRequest(input, nisn, lokasi), nisn, nama, setuju: true };
    setBusy(true);
    setGalat(null);
    try {
      const res = await ambil("/api/ortu/simpan-cek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const isi = await res.json().catch(() => null);
      if (res.status === 401) {
        setGalat({ pesan: "Sesi masuk sudah berakhir. Masuk lagi dengan Google; hasil Cek Cepat tadi tetap tersimpan di tab ini.", masukLagi: true });
      } else if (!res.ok) {
        setGalat({ pesan: isi?.galat ?? "Hasil belum bisa disimpan. Coba lagi sebentar lagi." });
      } else {
        const hasil = isi as ResponsSimpanCek;
        const nama = hasil.anak?.nama ?? "Anak";
        setBaruDisimpan({
          result: hasil,
          input,
          pesan: hasil.anakBaru
            ? `${nama} sudah ditambahkan ke akun, dan hasil ini masuk ke riwayatnya.`
            : `NISN ini sudah ada di akun, jadi hasil ini masuk ke riwayat ${nama}.`,
        });
        // Navbar dan halaman tahap memuat ulang daftar anak, dengan anak ini sebagai anak aktif.
        simpanHasilBaru(hasil);
        if (hasil.anak) {
          tungguHasilBaru(hasil.anak.id);
          // Isian Cek Cepat jadi isian anak ini, agar "Cek lagi" membuka isi data yang sudah terisi.
          // Titik rumah tidak ikut, sama seperti isian wizard.
          const { jenjang, nilai, tkaBin, tkaMtk, mapel, ketm, disabilitas, pindahTugas, kecamatan } = input;
          simpanIsian(hasil.anak.id, {
            jenjang, nilai, tkaBin, tkaMtk, mapel, ketm, disabilitas, pindahTugas, kecamatan,
            langkah: WIZARD_TOTAL_ORTU,
          });
        } else tandaiUsang();
        clearDraft();
        // Langsung ke Hasil Sekolah: satu tampilan hasil, dengan pesan sukses di atasnya.
        router.push("/peta-sekolah");
        return;
      }
    } catch (e) {
      setGalat({ pesan: pesanGagal(e) });
    }
    mengirim.current = false;
    setBusy(false);
  }

  async function masukLagi() {
    // Draf tetap di memori karena pindah halaman di dalam aplikasi tidak memuat ulang tab.
    await lupakanSesi();
    router.push("/masuk?next=%2Fcek-cepat%2Fsimpan");
  }

  return (
    <div className="card quick__card">
      <h2 className="card__title">Yang akan disimpan</h2>
      <ul className="quick__summary">
        <li>NISN berakhiran {nisn.slice(-3)}</li>
        <li>Jenjang tujuan: {JENJANG[input.jenjang]}</li>
        {input.kecamatan && <li>Kecamatan sesuai KK: {input.kecamatan}</li>}
        <li>Kondisi keluarga: {KETM[input.ketm]}</li>
        <li>Hasil peluang di tiap sekolah beserta skor akhirnya</li>
      </ul>
      <p className="text-secondary">
        NISN disimpan tersandi; yang bisa dibaca hanya 3 angka terakhirnya. Titik rumah tidak disimpan. Nilai rapor
        {semester > 0 ? ` (${semester} semester)` : ""} tidak disimpan di server; isian ini hanya diingat di perangkat ini agar
        cek berikutnya tidak perlu mengisi ulang, dan terhapus saat Bapak/Ibu keluar.
      </p>
      <Form id="simpan-form" onValid={submit}>
        <Field
          id="nama"
          label="Nama anak"
          hint="Tulis seperti di akta kelahiran. Bila NISN ini sudah ada di akun, hasilnya masuk ke anak itu."
          required
          errorRequired="Nama anak belum diisi."
          autoComplete="off"
          maxLength={80}
        />
        <ChoiceGroup legend="Persetujuan" errorName="setuju-simpan">
          <Choice
            type="checkbox"
            name="setuju-simpan"
            value="ya"
            title="Saya orang tua atau wali anak ini dan setuju datanya disimpan"
            desc="Dipakai untuk riwayat cek di akun ini. Bisa dihapus kapan saja di halaman Data Anak."
            required
            errorRequired="Centang persetujuan untuk menyimpan."
          />
        </ChoiceGroup>
        {galat && (
          <Alert
            kind="danger"
            title="Belum bisa disimpan"
            action={
              galat.masukLagi && (
                <Button variant="secondary" onClick={masukLagi}>
                  Masuk lagi
                </Button>
              )
            }
          >
            {galat.pesan}
          </Alert>
        )}
        <ButtonGroup>
          <Button variant="primary" block type="submit">
            {busy ? "Menyimpan…" : "Simpan ke akun"}
          </Button>
          <Button variant="ghost" block href="/cek-cepat" onClick={() => clearDraft()}>
            Batal
          </Button>
        </ButtonGroup>
      </Form>
    </div>
  );
}
