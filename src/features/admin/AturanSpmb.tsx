"use client";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Choice, DashSection, Field, Form, PageHeader, Table } from "@/components";
import { useToast } from "@/components/toast/Toast";
import type { Aturan, RumusSkor } from "@/lib/validasi";
import { SesiAdminBerakhir } from "./SesiAdmin";

type TahunSpmb = { tahun: number; aktif: boolean; aturan: Aturan };
type Status = "memuat" | "ada" | "tidak-ada" | "belum-masuk" | "galat";

const FORM = "form-aturan";
const MAPEL = [
  ["bin", "B. Indonesia"],
  ["mtk", "Matematika"],
  ["ipa", "IPA"],
  ["ips", "IPS"],
  ["bing", "B. Inggris"],
] as const;
const SUB_JALUR: Record<string, string> = {
  PRESTASI_AKD_RAPOR: "Prestasi akademik (rapor)",
  PRESTASI_KELAS_INDUSTRI: "Kelas industri",
};
const JENIS: Record<RumusSkor["jenis"], string> = {
  RAPOR_TKA: "Rapor dan TKA berbobot",
  RAPOR: "Rata-rata rapor",
  RAPOR_BOBOT_MAPEL: "Rapor 5 mapel berbobot per bidang",
};

const judulRumus = (kunci: string) => {
  const [jenjang, kode] = kunci.split(":");
  return `${jenjang}, ${SUB_JALUR[kode] ?? kode.toLowerCase().replaceAll("_", " ")}`;
};
const teks = (n: number) => String(n).replace(".", ",");
const angka = (v: FormDataEntryValue | null) => Number(String(v ?? "").trim().replace(",", "."));

/** Baca isian form menjadi aturan baru, mengikuti bentuk aturan lama (jenis rumus tidak diubah di sini). */
function bacaAturan(lama: Aturan, f: FormData): Aturan | string {
  const rumusSkor: Aturan["rumusSkor"] = {};
  for (const [kunci, r] of Object.entries(lama.rumusSkor)) {
    const ambil = (nama: string) => angka(f.get(`${kunci}|${nama}`));
    const skorMaks = ambil("skorMaks");
    if (!(skorMaks > 0)) return `Skor maksimal ${judulRumus(kunci)} harus lebih dari 0.`;
    if (r.jenis === "RAPOR_TKA") {
      const bobotRapor = ambil("bobotRapor");
      const bobotTka = ambil("bobotTka");
      if (!(bobotRapor >= 0 && bobotTka >= 0) || Math.abs(bobotRapor + bobotTka - 1) > 0.001)
        return `Bobot rapor dan TKA ${judulRumus(kunci)} harus berjumlah 1, misalnya 0,5 dan 0,5.`;
      rumusSkor[kunci] = { jenis: r.jenis, bobotRapor, bobotTka, skorMaks };
    } else if (r.jenis === "RAPOR") {
      rumusSkor[kunci] = { jenis: r.jenis, skorMaks };
    } else {
      const bobot: Record<string, Record<(typeof MAPEL)[number][0], number>> = {};
      for (const bidang of Object.keys(r.bobot)) {
        const b = Object.fromEntries(MAPEL.map(([m]) => [m, ambil(`${bidang}|${m}`)])) as Record<(typeof MAPEL)[number][0], number>;
        if (Object.values(b).some((v) => !(v >= 0))) return `Bobot mapel ${bidang.toLowerCase()} harus angka 0 atau lebih.`;
        bobot[bidang] = b;
      }
      rumusSkor[kunci] = { jenis: r.jenis, skorMaks, bobot };
    }
  }
  const minDiterima = angka(f.get("min-diterima"));
  if (!Number.isInteger(minDiterima) || minDiterima < 1) return "Minimal siswa diterima harus bilangan bulat 1 atau lebih.";
  const sumber = String(f.get("sumber") ?? "").trim();
  if (sumber.length < 3) return "Tulis dasar hukum atau sumber aturan.";
  return { ...lama, rumusSkor, minDiterima, sumber };
}

/** Aturan SPMB per tahun (GET/PUT /api/admin/aturan/[tahun]): rumus skor, ambang data, dan tahun acuan mesin peluang. */
export function AturanSpmb() {
  const { show } = useToast();
  const [tahun, setTahun] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("memuat");
  const [data, setData] = useState<TahunSpmb | null>(null);
  const [galat, setGalat] = useState("");
  const [busy, setBusy] = useState(false);

  // Tahun awal: tahun acuan yang dipakai dashboard.
  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { tahun?: number } | null) => setTahun(d?.tahun ?? new Date().getFullYear()))
      .catch(() => setTahun(new Date().getFullYear()));
  }, []);

  useEffect(() => {
    if (tahun === null) return;
    let batal = false;
    fetch(`/api/admin/aturan/${tahun}`)
      .then(async (res) => {
        if (batal) return;
        if (res.status === 401) return setStatus("belum-masuk");
        if (res.status === 404) {
          setData(null);
          return setStatus("tidak-ada");
        }
        if (!res.ok) return setStatus("galat");
        setData((await res.json()) as TahunSpmb);
        setStatus("ada");
      })
      .catch(() => !batal && setStatus("galat"));
    return () => {
      batal = true;
    };
  }, [tahun]);

  async function simpan(tujuan: number, aturan: Aturan, aktif: boolean) {
    setBusy(true);
    setGalat("");
    try {
      const res = await fetch(`/api/admin/aturan/${tujuan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aturan, aktif }),
      });
      if (res.status === 401) return setStatus("belum-masuk");
      if (!res.ok) return setGalat((await res.json().catch(() => null))?.galat ?? "Aturan belum bisa disimpan.");
      return (await res.json()) as TahunSpmb;
    } catch {
      setGalat("Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function simpanForm() {
    if (!data || busy) return;
    const f = new FormData(document.getElementById(FORM) as HTMLFormElement);
    const aturan = bacaAturan(data.aturan, f);
    if (typeof aturan === "string") return setGalat(aturan);
    const hasil = await simpan(data.tahun, aturan, f.get("aktif") === "ya" || data.aktif);
    if (hasil) {
      setData(hasil);
      show(`Aturan SPMB ${data.tahun} tersimpan.`, "success");
    }
  }

  async function salin() {
    if (!data || busy) return;
    const baru = Number((document.getElementById("tahun-baru") as HTMLInputElement | null)?.value);
    if (!Number.isInteger(baru) || baru < 2020 || baru > 2100 || baru === data.tahun) return setGalat("Tulis tahun baru, misalnya 2027.");
    const hasil = await simpan(baru, data.aturan, false);
    if (hasil) {
      show(`Aturan ${data.tahun} disalin ke ${baru}. Periksa dan sesuaikan dengan juknis ${baru}.`, "success");
      setTahun(baru);
    }
  }

  return (
    <>
      <PageHeader
        title="Aturan SPMB per tahun"
        desc="Rumus skor jalur prestasi dan ambang data yang dipakai mesin peluang. Isi sesuai juknis tahun itu; perubahan langsung berlaku untuk cek berikutnya."
      />
      <div className="card">
        <Form
          onValid={() => {
            const t = Number((document.getElementById("pilih-tahun") as HTMLInputElement).value);
            if (Number.isInteger(t)) setTahun(t);
          }}
        >
          <Field id="pilih-tahun" label="Tahun SPMB" inputMode="numeric" key={tahun ?? 0} defaultValue={tahun ? String(tahun) : ""} />
          <Button variant="secondary" type="submit">
            Buka aturan tahun ini
          </Button>
        </Form>
      </div>

      {status === "memuat" && <p className="text-secondary">Memuat aturan…</p>}
      {status === "belum-masuk" && <SesiAdminBerakhir />}
      {status === "galat" && <Alert kind="danger">Aturan belum bisa dimuat. Periksa internet, lalu muat ulang halaman.</Alert>}
      {status === "tidak-ada" && (
        <Alert kind="info" title={`Belum ada aturan untuk ${tahun}`}>
          Buka tahun yang sudah ada, lalu salin aturannya ke {tahun} dengan tombol Salin ke tahun baru.
        </Alert>
      )}

      {status === "ada" && data && (
        <Form id={FORM} key={`${data.tahun}-${JSON.stringify(data.aturan)}`} onValid={simpanForm}>
          <DashSection title={`Aturan SPMB ${data.tahun}`} desc={data.aktif ? "Tahun ini menjadi acuan mesin peluang." : "Tahun ini belum menjadi acuan mesin peluang."}>
            <p>{data.aktif ? <Badge kind="aman">Acuan aktif</Badge> : <Badge kind="neutral">Belum aktif</Badge>}</p>
            <Field id="sumber" label="Dasar hukum dan sumber" defaultValue={data.aturan.sumber} />
            <Field
              id="min-diterima"
              label="Minimal siswa diterima agar label dihitung"
              inputMode="numeric"
              hint="Jalur sekolah dengan siswa diterima lebih sedikit dari angka ini ditampilkan sebagai Belum dihitung, karena datanya terlalu sedikit."
              defaultValue={String(data.aturan.minDiterima)}
            />
            <p className="text-secondary">
              Batas label: jalur jarak memakai median dan jarak terjauh yang diterima; jalur skor memakai median dan skor terendah yang
              diterima. Ini bagian dari metode mesin peluang dan tidak diubah lewat halaman ini.
            </p>
          </DashSection>

          {Object.entries(data.aturan.rumusSkor).map(([kunci, r]) => (
            <DashSection key={kunci} title={judulRumus(kunci)} desc={JENIS[r.jenis]}>
              <Field id={`${kunci}|skorMaks`} label="Skor maksimal" inputMode="decimal" defaultValue={teks(r.skorMaks)} />
              {r.jenis === "RAPOR_TKA" && (
                <>
                  <Field id={`${kunci}|bobotRapor`} label="Bobot rapor" inputMode="decimal" hint="Bobot rapor dan TKA berjumlah 1." defaultValue={teks(r.bobotRapor)} />
                  <Field id={`${kunci}|bobotTka`} label="Bobot TKA" inputMode="decimal" defaultValue={teks(r.bobotTka)} />
                </>
              )}
              {r.jenis === "RAPOR_BOBOT_MAPEL" && (
                <Table
                  caption={`Bobot mapel ${judulRumus(kunci)}`}
                  head={["Bidang", ...MAPEL.map(([, l]) => l)]}
                  rows={Object.entries(r.bobot).map(([bidang, b]) => [
                    bidang.charAt(0) + bidang.slice(1).toLowerCase(),
                    ...MAPEL.map(([m, l]) => (
                      <input
                        key={m}
                        className="field__input aturan-bobot"
                        name={`${kunci}|${bidang}|${m}`}
                        inputMode="decimal"
                        aria-label={`Bobot ${l} bidang ${bidang.toLowerCase()}`}
                        defaultValue={teks(b[m])}
                      />
                    )),
                  ])}
                />
              )}
            </DashSection>
          ))}

          {!data.aktif && (
            <Choice type="checkbox" name="aktif" value="ya" title="Jadikan acuan mesin peluang" desc="Tahun lain otomatis berhenti menjadi acuan." />
          )}
          {galat && <Alert kind="danger">{galat}</Alert>}
          <div className="button-group">
            <Button variant="primary" type="submit">
              {busy ? "Menyimpan…" : "Simpan aturan"}
            </Button>
          </div>

          <DashSection title="Salin ke tahun baru" desc="Untuk SPMB berikutnya: salin aturan ini, lalu sesuaikan dengan juknis yang baru terbit.">
            <Field id="tahun-baru" label="Tahun baru" optional inputMode="numeric" placeholder={String(data.tahun + 1)} />
            <div className="button-group">
              <Button variant="secondary" onClick={salin}>
                Salin ke tahun baru
              </Button>
            </div>
          </DashSection>
        </Form>
      )}
    </>
  );
}
