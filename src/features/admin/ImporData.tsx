"use client";
import Papa from "papaparse";
import { useState, type ChangeEvent } from "react";
import { Alert, Button, Choice, DashSection, Field, Form, PageHeader, Stats, Table } from "@/components";
import { useToast } from "@/components/toast/Toast";
import { agregasi, type BarisMentah, type HasilAgregasi } from "@/lib/etl/agregasi";
import type { PermintaanImpor, ResponsImpor } from "@/lib/kontrak";
import { SesiAdminBerakhir } from "./SesiAdmin";

const FORM = "form-impor";
const angka = (n: number) => n.toLocaleString("id-ID");

type Berkas = { nama: string; hasil: HasilAgregasi };

/** Baca beberapa CSV klasemen di browser. Isi baris (termasuk NISN) tidak pernah meninggalkan perangkat. */
async function bacaCsv(files: File[]): Promise<Berkas> {
  const baris = (
    await Promise.all(
      files.map(
        (f) =>
          new Promise<BarisMentah[]>((ok, gagal) =>
            Papa.parse<BarisMentah>(f, { header: true, skipEmptyLines: true, complete: (r) => ok(r.data), error: gagal }),
          ),
      ),
    )
  ).flat();
  return { nama: files.map((f) => f.name).join(", "), hasil: agregasi(baris) };
}

/** Impor data seleksi tahun lalu: CSV diringkas di browser, lalu hanya angka agregat dikirim ke POST /api/admin/impor. */
export function ImporData() {
  const { show } = useToast();
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [membaca, setMembaca] = useState(false);
  const [busy, setBusy] = useState(false);
  const [galat, setGalat] = useState("");
  const [hasil, setHasil] = useState<ResponsImpor | null>(null);
  const [sesiHabis, setSesiHabis] = useState(false);

  async function pilih(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    setBerkas(null);
    setHasil(null);
    setGalat("");
    if (files.length === 0) return;
    if (files.some((f) => !f.name.toLowerCase().endsWith(".csv"))) return setGalat("Pilih berkas CSV. Simpan dulu Excel sebagai CSV (UTF-8).");
    setMembaca(true);
    try {
      const b = await bacaCsv(files);
      if (b.hasil.statistik.length === 0) {
        setGalat("Tidak ada baris yang bisa diringkas. Pastikan kolom NPSN, Sub Jalur, Pilihan Ke, dan Status Klasemen ada di berkas.");
      } else {
        setBerkas(b);
      }
    } catch {
      setGalat("Berkas tidak bisa dibaca sebagai CSV.");
    }
    setMembaca(false);
  }

  async function kirim() {
    if (!berkas || busy) return;
    const f = new FormData(document.getElementById(FORM) as HTMLFormElement);
    const tahun = Number(f.get("tahun"));
    if (!Number.isInteger(tahun) || tahun < 2020 || tahun > 2100) return setGalat("Tulis tahun SPMB, misalnya 2026.");
    const permintaan: PermintaanImpor = {
      tahun,
      namaFile: berkas.nama.slice(0, 200),
      jumlahBaris: berkas.hasil.jumlahBaris,
      gantiStatistikKecamatan: f.get("ganti-kecamatan") === "ya",
      statistik: berkas.hasil.statistik,
      kecamatan: berkas.hasil.kecamatan,
    };
    setBusy(true);
    setGalat("");
    try {
      const res = await fetch("/api/admin/impor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permintaan),
      });
      if (res.status === 401) return setSesiHabis(true);
      const isi = await res.json().catch(() => null);
      if (!res.ok) return setGalat(isi?.galat ?? "Impor belum berhasil. Coba lagi sebentar lagi.");
      setHasil(isi as ResponsImpor);
      show(`Data seleksi ${tahun} diimpor.`, "success");
    } catch {
      setGalat("Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (sesiHabis) return <SesiAdminBerakhir />;

  // Ringkasan per sekolah untuk diperiksa sebelum dikirim.
  const perSekolah = berkas
    ? [
        ...berkas.hasil.statistik
          .reduce((m, s) => {
            const a = m.get(s.kodeSekolah) ?? { nama: s.namaSekolah, subJalur: 0, pendaftar: 0, diterima: 0 };
            m.set(s.kodeSekolah, { ...a, subJalur: a.subJalur + 1, pendaftar: a.pendaftar + (s.pendaftar ?? 0), diterima: a.diterima + s.diterima });
            return m;
          }, new Map<string, { nama: string; subJalur: number; pendaftar: number; diterima: number }>())
          .entries(),
      ]
    : [];

  return (
    <>
      <PageHeader
        title="Impor data seleksi"
        desc="Unggah CSV klasemen SPMB tahun lalu. Berkas diringkas di browser ini; yang dikirim ke server hanya angka agregat per sekolah, sub jalur, dan kecamatan, tanpa NISN atau nama siswa."
      />

      <DashSection title="1. Pilih berkas" desc="CSV klasemen dari situs SPMB, boleh beberapa berkas sekaligus (misalnya satu berkas per sekolah).">
        <div className="card">
          <label className="field__label" htmlFor="berkas-impor">
            Berkas CSV
          </label>
          <input id="berkas-impor" type="file" accept=".csv,text/csv" multiple onChange={pilih} />
          <p className="field__hint">Kolom yang dibaca: NPSN, Nama Sekolah, NISN, Nilai Akhir, Sub Jalur, Pilihan Ke, Kecamatan, Status Klasemen, dan untuk SMK Program serta Bidang Keahlian.</p>
          {membaca && <p className="text-secondary">Membaca dan meringkas berkas…</p>}
        </div>
      </DashSection>

      {galat && !berkas && <Alert kind="danger">{galat}</Alert>}

      {berkas && (
        <>
          <DashSection title="2. Periksa ringkasan" desc={`Dari ${berkas.nama}.`}>
            <Stats
              items={[
                ["Baris dibaca", angka(berkas.hasil.jumlahBaris), "Satu baris = satu pendaftaran"],
                ["Sekolah", angka(berkas.hasil.jumlahSekolah), "NPSN berbeda di berkas"],
                ["Statistik sub jalur", angka(berkas.hasil.statistik.length), "Sekolah, sub jalur, dan program"],
                ["Kecamatan", angka(berkas.hasil.kecamatan.length), "Baris statistik per kecamatan"],
              ]}
            />
            <Table
              caption="Ringkasan per sekolah dari berkas"
              head={["Sekolah", "Kode di berkas", "Sub jalur", "Pendaftar", "Diterima"]}
              rows={perSekolah.map(([kode, s]) => [s.nama, kode, angka(s.subJalur), angka(s.pendaftar), angka(s.diterima)])}
              num={[2, 3, 4]}
            />
          </DashSection>

          <DashSection title="3. Kirim ke server" desc="Statistik tahun yang sama untuk sekolah di berkas ini akan diganti.">
            <div className="card">
              <Form id={FORM} onValid={kirim}>
                <Field id="tahun" label="Tahun SPMB" inputMode="numeric" defaultValue={String(new Date().getFullYear())} required errorRequired="Tulis tahun SPMB." />
                <Choice
                  type="checkbox"
                  name="ganti-kecamatan"
                  value="ya"
                  title="Berkas ini memuat semua sekolah negeri"
                  desc="Statistik per kecamatan tahun ini dihitung ulang dari berkas. Jangan dicentang bila hanya mengimpor sebagian sekolah."
                  checked={berkas.hasil.jumlahSekolah >= 10}
                />
                {galat && <Alert kind="danger">{galat}</Alert>}
                <Button variant="primary" type="submit" iconLeft="upload">
                  {busy ? "Mengirim…" : "Impor sekarang"}
                </Button>
              </Form>
            </div>
          </DashSection>
        </>
      )}

      {hasil && (
        <Alert kind={hasil.peringatan.length ? "warning" : "success"} title={`Impor selesai: ${angka(hasil.jumlahStatistik)} statistik dari ${angka(hasil.jumlahSekolah)} sekolah`}>
          {hasil.peringatan.length ? (
            <>
              Baris berikut dilewati atau perlu diperiksa:
              <ul>
                {hasil.peringatan.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          ) : (
            "Semua baris dikenali. Dashboard dan mesin peluang langsung memakai angka baru."
          )}
        </Alert>
      )}
    </>
  );
}
