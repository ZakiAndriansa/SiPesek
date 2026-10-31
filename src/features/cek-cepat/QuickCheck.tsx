"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Choice,
  ChoiceGroup,
  Dialog,
  Field,
  Form,
  HelpLink,
  Select,
  Stepper,
} from "@/components";
import type { ResponsPeluang } from "@/lib/kontrak";
import {
  isValidNisn,
  KECAMATAN_KK,
  MAPEL,
  parseNumber,
  SEMESTER_COUNT,
  toRequest,
  validateInput,
  type QuickCheckInput,
  type Titik,
} from "@/lib/quick-check";
import { HasilCepat } from "./HasilCepat";
import { HomePicker } from "./HomePicker";
import { setDraft } from "./draft-store";

type Phase = "nisn" | "isian" | "hasil";
type Props = { loggedIn: boolean; canSave: boolean; parentName?: string };

const EMPTY: QuickCheckInput = {
  jenjang: "sma",
  nilai: Array(SEMESTER_COUNT).fill(null),
  tkaBin: null,
  tkaMtk: null,
  mapel: { bin: null, mtk: null, ipa: null, ips: null, bing: null },
  ketm: "tidak",
  disabilitas: false,
  pindahTugas: false,
  kecamatan: "",
  lokasi: null,
};
const PHASE_NO: Record<Phase, number> = { nisn: 1, isian: 2, hasil: 3 };
const PHASE_TITLE: Record<Phase, string> = {
  nisn: "Masukkan NISN anak",
  isian: "Isi data anak",
  hasil: "Hasil perkiraan",
};
const dateText = () =>
  new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const teksNilai = (v: number | null) => (v === null ? "" : String(v).replace(".", ","));
const angkaAtauNull = (raw: string) => {
  const v = parseNumber(raw);
  return v === null || Number.isNaN(v) ? null : v;
};

/**
 * Cek Cepat tamu. Isian dikirim ke mesin peluang (POST /api/peluang mode tamu), dihitung, lalu dibuang:
 * server tidak menyimpan NISN, titik rumah, maupun hasilnya. Di browser, semuanya hanya ada di memori tab.
 */
export function QuickCheck({ loggedIn, canSave, parentName }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("nisn");
  const [input, setInput] = useState<QuickCheckInput>(EMPTY);
  const [jenjang, setJenjang] = useState<QuickCheckInput["jenjang"]>(EMPTY.jenjang);
  const [lokasi, setLokasi] = useState<Titik | null>(null);
  const [result, setResult] = useState<ResponsPeluang | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // NISN hanya di memori tab: dikirim untuk diperiksa server, dan ikut draf simpan bila orang tua menekan Simpan.
  const nisn = useRef("");
  const focusRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Pindahkan fokus ke judul tiap pindah langkah (pembaca layar + keyboard).
  useEffect(() => {
    if (first.current) return void (first.current = false);
    focusRef.current?.focus();
  }, [phase]);

  // Peringatan sebelum hasil hilang karena tutup tab atau muat ulang.
  useEffect(() => {
    if (phase !== "hasil" || leaving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase, leaving]);

  function submitNisn() {
    const value = document.querySelector<HTMLInputElement>("#nisn")?.value ?? "";
    if (!isValidNisn(value)) return;
    nisn.current = value;
    setPhase("isian");
  }

  async function submitIsian() {
    const form = document.getElementById("isian-form") as HTMLFormElement | null;
    if (!form || busy) return;
    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? "");
    const next: QuickCheckInput = {
      jenjang: text("jenjang") as QuickCheckInput["jenjang"],
      nilai: Array.from({ length: SEMESTER_COUNT }, (_, i) => angkaAtauNull(text(`nilai-${i + 1}`))),
      tkaBin: angkaAtauNull(text("tka-bin")),
      tkaMtk: angkaAtauNull(text("tka-mtk")),
      mapel: Object.fromEntries(MAPEL.map(([k]) => [k, angkaAtauNull(text(`mapel-${k}`))])) as QuickCheckInput["mapel"],
      ketm: text("ketm") as QuickCheckInput["ketm"],
      disabilitas: data.get("disabilitas") === "ya",
      pindahTugas: data.get("pindah-tugas") === "ya",
      kecamatan: text("kecamatan"),
      lokasi,
    };
    setInput(next);
    setError("");
    const invalid = validateInput(next);
    if (invalid) return setError(invalid);
    if (!lokasi) return setError("Tandai titik rumah di peta, atau tekan Gunakan lokasi saya. Jarak ke sekolah dihitung dari titik ini.");

    setBusy(true);
    try {
      const res = await fetch("/api/peluang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toRequest(next, nisn.current, lokasi)),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) return setError(body?.galat ?? body?.pesan ?? "Hasil belum bisa dihitung. Coba lagi sebentar lagi.");
      setResult(body as ResponsPeluang);
      setPhase("hasil");
    } catch {
      setError("Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    // Titik rumah ikut draf karena server menghitung ulang hasilnya saat menyimpan (titiknya tetap tidak disimpan).
    setDraft({ input: { ...input, lokasi }, nisn: nisn.current });
    setLeaving(true);
    router.push(canSave ? "/cek-cepat/simpan" : "/masuk?next=%2Fcek-cepat%2Fsimpan");
  }

  function restart() {
    nisn.current = "";
    setInput(EMPTY);
    setJenjang(EMPTY.jenjang);
    setLokasi(null);
    setResult(null);
    setError("");
    setPhase("nisn");
  }

  return (
    <div className="quick">
      <div className="no-print">
        <Stepper step={PHASE_NO[phase]} total={3} />
      </div>
      <div ref={focusRef} tabIndex={-1} className="quick__focus">
        <h1 className="text-heading-lg quick__title">{PHASE_TITLE[phase]}</h1>
      </div>

      {loggedIn && !canSave && (
        <Alert kind="info" title="Anda masuk sebagai petugas">
          Cek Cepat tetap bisa dicoba, tetapi hasilnya tidak bisa disimpan ke akun petugas.
        </Alert>
      )}
      {canSave && phase !== "hasil" && (
        <Alert kind="info" title={`Anda masuk sebagai ${parentName ?? "orang tua"}`}>
          Hasil Cek Cepat tidak otomatis tersimpan. Bila ingin menyimpannya ke riwayat anak, tekan Simpan di akhir.
        </Alert>
      )}

      {phase === "nisn" && (
        <div className="card quick__card">
          <Form id="nisn-form" onValid={submitNisn}>
            <Field
              id="nisn"
              label="NISN (Nomor Induk Siswa Nasional)"
              hint="10 angka. Ada di rapor atau kartu pelajar."
              required
              errorRequired="NISN belum diisi. Tulis 10 angka dari rapor atau kartu pelajar."
              errorPattern="NISN harus 10 angka, tanpa spasi atau tanda baca."
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              autoComplete="off"
              placeholder="Contoh: 0012345678"
            />
            <ChoiceGroup legend="Sebelum mulai" errorName="mengerti">
              <Choice
                type="checkbox"
                name="mengerti"
                value="ya"
                title="Saya mengerti hasil ini hanya perkiraan dan tidak disimpan"
                desc="NISN dan titik rumah dikirim ke server SiPesek hanya untuk dihitung, lalu dibuang. Tidak ada yang disimpan, kecuali Bapak/Ibu memilih menyimpan hasilnya ke akun."
                required
                errorRequired="Centang ini untuk melanjutkan."
              />
            </ChoiceGroup>
            <ButtonGroup>
              <Button variant="primary" block type="submit" icon="arrow-right">
                Lanjut
              </Button>
            </ButtonGroup>
          </Form>
        </div>
      )}

      {phase === "isian" && (
        <div className="card quick__card">
          <Form id="isian-form" onValid={submitIsian}>
            <div onChange={(e: ChangeEvent<HTMLDivElement>) => {
              const t = e.target as unknown as HTMLInputElement;
              if (t.name === "jenjang") setJenjang(t.value as QuickCheckInput["jenjang"]);
            }}>
              <ChoiceGroup legend="Jenjang tujuan" errorName="jenjang">
                {(
                  [
                    ["sma", "SMA"],
                    ["smk", "SMK"],
                    ["belum", "Belum tahu"],
                  ] as const
                ).map(([value, title]) => (
                  <Choice key={value} type="radio" name="jenjang" value={value} title={title} checked={input.jenjang === value} required errorRequired="Pilih jenjang tujuan." />
                ))}
              </ChoiceGroup>
            </div>

            <Select
              id="kecamatan"
              label="Kecamatan sesuai Kartu Keluarga"
              options={KECAMATAN_KK}
              placeholder="Pilih kecamatan"
              hint="Menentukan rayon Jalur Domisili SMA. Pilih Lainnya bila KK di luar daftar."
              selected={input.kecamatan}
              required
              errorRequired="Pilih kecamatan sesuai Kartu Keluarga."
            />
            <HomePicker value={lokasi} onChange={setLokasi} />

            <fieldset className="quick__nilai">
              <legend className="choice-group__legend">Rata-rata nilai rapor per semester</legend>
              <p>
                <HelpLink opens="dlg-rapor-cepat">Di mana nilai ada di rapor?</HelpLink>
              </p>
              {Array.from({ length: SEMESTER_COUNT }, (_, i) => (
                <Field
                  key={i}
                  id={`nilai-${i + 1}`}
                  label={`Semester ${i + 1}`}
                  optional
                  placeholder="Contoh: 85,5"
                  errorPattern="Nilai ditulis dengan angka, misalnya 85,5."
                  inputMode="decimal"
                  pattern="[0-9]{1,3}([,.][0-9]{1,2})?"
                  defaultValue={teksNilai(input.nilai[i])}
                />
              ))}
            </fieldset>

            {jenjang !== "smk" && (
              <fieldset className="quick__nilai">
                <legend className="choice-group__legend">Nilai TKA (untuk Jalur Prestasi SMA)</legend>
                <p className="field__hint">Boleh dikosongkan bila belum ada. Tanpa TKA, Jalur Prestasi SMA belum bisa dihitung.</p>
                <Field id="tka-bin" label="TKA Bahasa Indonesia" optional placeholder="Contoh: 78" inputMode="decimal" pattern="[0-9]{1,3}([,.][0-9]{1,2})?" errorPattern="Nilai ditulis dengan angka, misalnya 78." defaultValue={teksNilai(input.tkaBin)} />
                <Field id="tka-mtk" label="TKA Matematika" optional placeholder="Contoh: 72,5" inputMode="decimal" pattern="[0-9]{1,3}([,.][0-9]{1,2})?" errorPattern="Nilai ditulis dengan angka, misalnya 72,5." defaultValue={teksNilai(input.tkaMtk)} />
              </fieldset>
            )}

            {jenjang !== "sma" && (
              <fieldset className="quick__nilai">
                <legend className="choice-group__legend">Rata-rata 5 mapel selama 5 semester (untuk Kelas Industri SMK)</legend>
                <p className="field__hint">Boleh dikosongkan. Isi kelimanya agar jalur Kelas Industri SMK bisa dihitung.</p>
                {MAPEL.map(([k, label]) => (
                  <Field key={k} id={`mapel-${k}`} label={label} optional placeholder="Contoh: 84" inputMode="decimal" pattern="[0-9]{1,3}([,.][0-9]{1,2})?" errorPattern="Nilai ditulis dengan angka, misalnya 84." defaultValue={teksNilai(input.mapel[k])} />
                ))}
              </fieldset>
            )}

            <ChoiceGroup
              legend="Apakah keluarga termasuk kurang mampu (KETM)?"
              hint={<HelpLink opens="dlg-ketm-cepat">Apa ini?</HelpLink>}
              errorName="ketm"
            >
              {(
                [
                  ["ya", "Ya"],
                  ["tidak", "Tidak"],
                  ["ragu", "Belum yakin"],
                ] as const
              ).map(([value, title]) => (
                <Choice key={value} type="radio" name="ketm" value={value} title={title} checked={input.ketm === value} required errorRequired="Pilih salah satu jawaban dulu. Bila belum yakin, pilih Belum yakin." />
              ))}
            </ChoiceGroup>
            <ChoiceGroup legend="Kondisi lain (bila ada)">
              <Choice type="checkbox" name="disabilitas" value="ya" title="Anak penyandang disabilitas" desc="Membuka Jalur Afirmasi untuk anak berkebutuhan khusus." checked={input.disabilitas} />
              <Choice type="checkbox" name="pindah-tugas" value="ya" title="Orang tua pindah tugas ke Depok" desc="Membuka Jalur Mutasi. Perlu surat penugasan dari instansi." checked={input.pindahTugas} />
            </ChoiceGroup>

            {error && (
              <Alert kind="danger" title="Belum bisa dihitung">
                {error}
              </Alert>
            )}
            <ButtonGroup>
              <Button variant="primary" block type="submit" icon="arrow-right">
                {busy ? "Menghitung…" : "Lihat Hasil"}
              </Button>
              <Button variant="secondary" block iconLeft="chevron-left" onClick={() => setPhase("nisn")}>
                Kembali
              </Button>
            </ButtonGroup>
          </Form>
          <Dialog id="dlg-rapor-cepat" title="Di mana nilai ada di rapor?">
            <p>
              Buka halaman terakhir rapor tiap semester, lalu cari baris <strong>Nilai rata-rata</strong>. Tulis angkanya apa adanya, misalnya 85,5. Semester yang belum ada boleh dikosongkan.
            </p>
          </Dialog>
          <Dialog id="dlg-ketm-cepat" title="Apa itu KETM?">
            <p>
              KETM adalah Keluarga Ekonomi Tidak Mampu. Syarat Jalur Afirmasi adalah terdaftar di DTSEN (Data Tunggal Sosial dan Ekonomi Nasional) pada desil 1 sampai 5. Keluarga ini biasanya juga menerima PKH atau KIP. Bila belum yakin, pilih Belum yakin.
            </p>
          </Dialog>
        </div>
      )}

      {phase === "hasil" && result && (
        <HasilCepat
          result={result}
          input={input}
          loggedIn={loggedIn}
          canSave={canSave}
          onSave={save}
          onEdit={() => setPhase("isian")}
          onRestart={restart}
          date={dateText()}
        />
      )}
    </div>
  );
}

