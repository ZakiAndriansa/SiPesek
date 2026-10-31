"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Choice,
  ChoiceGroup,
  CtaBand,
  Dialog,
  Field,
  Form,
  HelpLink,
  RankList,
  SchoolCard,
  Select,
  Stepper,
} from "@/components";
import { Disclaimer } from "@/components/alert/Disclaimer";
import { KEC_NAMES } from "@/data/kecamatan";
import {
  isValidNisn,
  parseNumber,
  PRESTASI,
  SEMESTER_COUNT,
  type QuickCheckInput,
  type QuickCheckResult,
  estimate,
  validateInput,
} from "@/lib/quick-check";
import type { GeoPoint } from "@/data/geo";
import { nearestKecamatan } from "@/data/geo";
import { HomePicker } from "./HomePicker";
import { setDraft } from "./draft-store";

type Phase = "nisn" | "isian" | "hasil";
type Props = { loggedIn: boolean; canSave: boolean; parentName?: string };

const EMPTY: QuickCheckInput = {
  jenjang: "sma",
  nilai: Array(SEMESTER_COUNT).fill(null),
  ketm: "tidak",
  prestasi: "",
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

/** Cek Cepat tamu. NISN hanya diperiksa di sini lalu dibuang; tidak ada yang disimpan di browser maupun server. */
export function QuickCheck({ loggedIn, canSave, parentName }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("nisn");
  const [input, setInput] = useState<QuickCheckInput>(EMPTY);
  // Titik rumah: hanya di memori tab. Tidak masuk draf, server, atau akun.
  const [lokasi, setLokasi] = useState<GeoPoint | null>(null);
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
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
    // NISN dibuang di sini: tidak masuk state, draf, atau server.
    setPhase("isian");
  }

  function submitIsian() {
    const form = document.getElementById("isian-form") as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? "");
    const next: QuickCheckInput = {
      jenjang: text("jenjang") as QuickCheckInput["jenjang"],
      nilai: Array.from({ length: SEMESTER_COUNT }, (_, i) => parseNumber(text(`nilai-${i + 1}`))).map((v) =>
        v === null || Number.isNaN(v) ? null : v,
      ),
      ketm: text("ketm") as QuickCheckInput["ketm"],
      prestasi: text("prestasi") as QuickCheckInput["prestasi"],
      kecamatan: lokasi ? nearestKecamatan(lokasi) : text("kecamatan"),
      lokasi,
    };
    setInput(next);
    setError("");
    // Dihitung di browser: titik rumah tidak pernah dikirim ke server.
    const invalid = validateInput(next);
    if (invalid) return setError(invalid);
    setResult(estimate(next));
    setPhase("hasil");
  }

  function save() {
    setDraft({ input: { ...input, lokasi: null } });
    setLeaving(true);
    router.push(canSave ? "/cek-cepat/simpan" : "/masuk?next=%2Fcek-cepat%2Fsimpan");
  }

  function restart() {
    setInput(EMPTY);
    setLokasi(null);
    setResult(null);
    setError("");
    setPhase("nisn");
  }

  const nilaiOf = (i: number) => (input.nilai[i] === null ? "" : String(input.nilai[i]).replace(".", ","));

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
          Cek Cepat tidak menambah data anak. Bila ingin menyimpan hasilnya, tekan Simpan di akhir.
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
                desc="NISN dan titik rumah hanya diproses di perangkat ini dan tidak dikirim ke mana pun."
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
                  pattern="[0-9]{2,3}([,.][0-9]{1,2})?"
                  defaultValue={nilaiOf(i)}
                />
              ))}
            </fieldset>
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
            <Select
              id="prestasi"
              label="Prestasi lomba tertinggi"
              options={PRESTASI.filter(Boolean)}
              placeholder="Tidak ada / belum ada"
              selected={input.prestasi}
              optional
            />
            <HomePicker value={lokasi} onChange={setLokasi} />
            {lokasi ? (
              <p className="text-secondary">Kecamatan terdekat dari titik rumah: {nearestKecamatan(lokasi)}.</p>
            ) : (
              <Select
                id="kecamatan"
                label="Kecamatan tempat tinggal"
                options={KEC_NAMES}
                placeholder="Pilih kecamatan"
                hint="Dipakai bila titik rumah belum ditandai. Jarak ke sekolah jadi kasar."
                selected={input.kecamatan}
                required
                errorRequired="Tandai rumah di peta atau pilih kecamatan."
              />
            )}
            {error && (
              <Alert kind="danger" title="Belum bisa dihitung">
                {error}
              </Alert>
            )}
            <ButtonGroup>
              <Button variant="primary" block type="submit" icon="arrow-right">
                Lihat Hasil
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
              KETM adalah Keluarga Ekonomi Tidak Mampu. Biasanya ditandai kepemilikan KIP, PKH, atau terdaftar di DTKS. Bila belum yakin, pilih Belum yakin.
            </p>
          </Dialog>
        </div>
      )}

      {phase === "hasil" && result && (
        <Hasil
          result={result}
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

function Hasil({
  result,
  loggedIn,
  canSave,
  onSave,
  onEdit,
  onRestart,
  date,
}: {
  result: QuickCheckResult;
  loggedIn: boolean;
  canSave: boolean;
  onSave: () => void;
  onEdit: () => void;
  onRestart: () => void;
  date: string;
}) {
  return (
    <div className="stack quick__result" data-reveal-live="">
      <p className="print-only quick__print-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo-lofi.svg" alt="" width={32} height={32} />
        SiPesek · Cek Cepat · {date}. Hasil perkiraan, bukan keputusan resmi.
      </p>
      <Alert kind="warning" title="Hasil ini tidak disimpan">
        Menutup tab atau memuat ulang halaman menghapus hasil. Cetak bila ingin menyimpannya.
      </Alert>
      {result.notes.map((note) => (
        <Alert key={note} kind="info">
          {note}
        </Alert>
      ))}

      <section className="stack" aria-labelledby="q-jalur">
        <h2 className="text-heading-md" id="q-jalur">Jalur yang cocok</h2>
        <div className="quick__routes" data-reveal-group="">
          {result.routes.map((r) => (
            <div key={r.name} className="card">
              <p className="card__title">{r.name}</p>
              <p className="card__text">
                <strong>{r.status === "memenuhi" ? "Memenuhi syarat" : r.status === "mungkin" ? "Mungkin memenuhi" : "Belum memenuhi"}</strong>
              </p>
              <p className="card__text">{r.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="q-sekolah" data-reveal-group="">
        <h2 className="text-heading-md" id="q-sekolah">Hasil Sekolah</h2>
        {result.schools.map((s) => (
          <SchoolCard key={s.id} name={s.name} kec={s.kec} jalur={s.jalur} kind={s.kind} range={s.range} facts={s.facts} reason={s.reason}>
            <p className="text-secondary">Detail sekolah tersedia setelah masuk.</p>
          </SchoolCard>
        ))}
      </section>

      <section className="stack" aria-labelledby="q-strategi" data-reveal="">
        <h2 className="text-heading-md" id="q-strategi">Strategi 3 pilihan</h2>
        <RankList items={result.strategy} />
      </section>

      <Disclaimer />

      {canSave && (
        <CtaBand title="Mau menyimpan hasil ini?" text="Isian dipindahkan ke akun Bapak/Ibu sebagai data anak baru, setelah Bapak/Ibu setuju di langkah berikutnya.">
          <Button variant="primary" lg icon="arrow-right" onClick={onSave}>
            Simpan hasil ini ke akun
          </Button>
        </CtaBand>
      )}
      {!loggedIn && (
        <CtaBand title="Mau menyimpan hasil ini?" text="Masuk dulu. Setelah masuk, Bapak/Ibu bisa memindahkan isian ini ke akun. Tanpa masuk, hasil tidak tersimpan.">
          <Button variant="primary" lg icon="arrow-right" onClick={onSave}>
            Masuk & simpan hasil ini
          </Button>
        </CtaBand>
      )}

      <div className="no-print">
        <ButtonGroup>
          <Button variant="secondary" print iconLeft="download">
            Cetak
          </Button>
          <Button variant="ghost" onClick={onEdit}>
            Ubah isian
          </Button>
          <Button variant="ghost" onClick={onRestart}>
            Cek anak lain
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
