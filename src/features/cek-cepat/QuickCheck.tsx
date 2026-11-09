"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ambil, pesanGagal } from "@/lib/ambil";
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
  isianUntukJalur,
  isValidNisn,
  JALUR_UTAMA,
  KECAMATAN_KK,
  kurangUntukJalur,
  MAPEL,
  parseNumber,
  saringJalur,
  SEMESTER_COUNT,
  toRequest,
  validateInput,
  type JalurPilihan,
  type QuickCheckInput,
  type Titik,
} from "@/lib/quick-check";
import { HasilCepat } from "./HasilCepat";
import { HomePicker } from "./HomePicker";
import { setDraft } from "./draft-store";

// Dua jalan. Orang tua yang sudah tahu jalurnya memilih satu dari empat jalur, lalu hanya mengisi yang dipakai
// jalur itu dan melihat hasil jalur itu saja. Yang belum tahu mengisi tempat tinggal dan kondisi, lalu nilai
// (boleh dilewati), dan mesin menilai semua jalur yang terbuka. Kebingungan memilih jalur adalah masalah yang
// diselesaikan SiPesek, jadi jalan "belum tahu" tetap ada dan hasil satu jalur selalu menawarkan cek semua jalur.
type Phase = "jalur" | "nisn" | "isian" | "nilai" | "hasil";
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
const TANPA_NILAI = { nilai: EMPTY.nilai, tkaBin: null, tkaMtk: null, mapel: EMPTY.mapel } satisfies Partial<QuickCheckInput>;

/** Empat jalur yang bisa dipilih langsung, dengan syarat singkat dalam bahasa sehari-hari. */
const PILIHAN_JALUR: [JalurPilihan, string, string][] = [
  ["DOMISILI", "Domisili (dekat rumah)", "Diurutkan dari rumah terdekat. SMA memakai rayon sesuai kecamatan di Kartu Keluarga."],
  ["AFIRMASI", "Afirmasi (KETM atau disabilitas)", "Untuk keluarga terdaftar di DTSEN desil 1 sampai 5, atau anak penyandang disabilitas."],
  ["PRESTASI", "Prestasi (nilai rapor)", "Diurutkan dari skor rapor, ditambah nilai TKA untuk SMA."],
  ["MUTASI", "Mutasi (orang tua pindah tugas)", "Untuk anak yang orang tuanya pindah tugas ke Depok, dengan surat penugasan."],
];
const NAMA_JALUR = Object.fromEntries(JALUR_UTAMA) as Record<JalurPilihan, string>;
/** Nama singkat tiap langkah untuk bar langkah (tooltip dan pembaca layar). */
const NAMA_LANGKAH: Record<Phase, string> = { nisn: "NISN", jalur: "Jalur", isian: "Data anak", nilai: "Nilai rapor", hasil: "Hasil" };

const dateText = () =>
  new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const teksNilai = (v: number | null) => (v === null ? "" : String(v).replace(".", ","));
const angkaAtauNull = (raw: string) => {
  const v = parseNumber(raw);
  return v === null || Number.isNaN(v) ? null : v;
};

/** Nilai rapor, TKA, dan 5 mapel dari formulir yang memuat isian nilai. */
function nilaiDari(data: FormData): Pick<QuickCheckInput, "nilai" | "tkaBin" | "tkaMtk" | "mapel"> {
  const text = (k: string) => String(data.get(k) ?? "");
  return {
    nilai: Array.from({ length: SEMESTER_COUNT }, (_, i) => angkaAtauNull(text(`nilai-${i + 1}`))),
    tkaBin: angkaAtauNull(text("tka-bin")),
    tkaMtk: angkaAtauNull(text("tka-mtk")),
    mapel: Object.fromEntries(MAPEL.map(([k]) => [k, angkaAtauNull(text(`mapel-${k}`))])) as QuickCheckInput["mapel"],
  };
}

/** Jam lokal (misalnya "23.45") saat batas cek tamu terbuka lagi, dari header Retry-After dalam detik. */
function jamCobaLagi(res: Response): string | null {
  const detik = Number(res.headers.get("Retry-After"));
  if (!Number.isFinite(detik) || detik <= 0) return null;
  return new Date(Date.now() + detik * 1000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Cek Cepat tamu. Isian dikirim ke mesin peluang (POST /api/peluang mode tamu), dihitung, lalu dibuang:
 * server tidak menyimpan NISN, titik rumah, maupun hasilnya. Di browser, semuanya hanya ada di memori tab.
 */
export function QuickCheck({ loggedIn, canSave, parentName }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("nisn");
  // Jalur pilihan orang tua; null berarti belum tahu, sehingga semua jalur dinilai.
  const [jalur, setJalur] = useState<JalurPilihan | null>(null);
  // Jawaban "sudah tahu jalur?" di langkah 1, agar daftar empat jalur muncul begitu "Sudah tahu" dipilih.
  const [tahu, setTahu] = useState<"ya" | "belum" | null>(null);
  const [input, setInput] = useState<QuickCheckInput>(EMPTY);
  // Jenjang yang sedang dipilih di langkah isian; menentukan kotak TKA (SMA) dan 5 mapel (SMK) di Jalur Prestasi.
  const [jenjang, setJenjang] = useState<QuickCheckInput["jenjang"]>(EMPTY.jenjang);
  const [afirmasi, setAfirmasi] = useState<"ketm" | "disabilitas" | "tidak" | null>(null);
  const [lokasi, setLokasi] = useState<Titik | null>(null);
  const [result, setResult] = useState<ResponsPeluang | null>(null);
  const [error, setError] = useState("");
  // Batas Cek Cepat tamu tercapai (429): pesan server dan jam boleh mencoba lagi tanpa akun.
  const [batas, setBatas] = useState<{ pesan: string; jam: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // NISN hanya di memori tab: dikirim untuk diperiksa server, dan ikut draf simpan bila orang tua menekan Simpan.
  const [nisnAnak, setNisnAnak] = useState("");
  const focusRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  // Penjaga klik ganda: state `busy` baru berubah setelah render, jadi dua klik cepat bisa sama-sama lolos.
  const mengirim = useRef(false);
  // Langkah terjauh yang sudah dicapai (indeks di `urutan`): bar langkah boleh dibuka sampai sini.
  const [terjauh, setTerjauh] = useState(0);
  // Sidik isian yang menghasilkan `result`. Langkah Hasil hanya bisa dibuka lagi bila isiannya belum berubah,
  // agar hasil yang tampil tidak pernah berasal dari isian lama.
  const [kunciHasil, setKunciHasil] = useState<string | null>(null);

  // Nomor langkah: jalan "sudah tahu" tidak punya langkah nilai terpisah (Prestasi mengisi nilai di langkah isian).
  // NISN diisi paling awal, agar pindah jalur (Ganti jalur, atau Cek semua jalur) tidak perlu mengetik NISN lagi.
  // Sebelum jalur dipastikan, jumlah langkah langsung mengikuti jawaban yang sedang dipilih.
  const jalanSingkat = phase === "nisn" || phase === "jalur" ? tahu === "ya" : jalur !== null;
  const urutan: Phase[] = jalanSingkat ? ["nisn", "jalur", "isian", "hasil"] : ["nisn", "jalur", "isian", "nilai", "hasil"];
  const judul: Record<Phase, string> = {
    jalur: "Sudah tahu jalurnya?",
    nisn: "Masukkan NISN anak",
    isian: jalur ? `Data untuk ${NAMA_JALUR[jalur]}` : "Tempat tinggal dan kondisi anak",
    nilai: "Nilai rapor (boleh dilewati)",
    hasil: "Hasil perkiraan",
  };
  // Isian yang benar-benar dikirim: pada jalur pilihan, isian jalur lain dikosongkan.
  const isianEfektif = jalur ? isianUntukJalur(input, jalur) : input;
  const kunciDari = (isian: QuickCheckInput, titik: Titik | null, n: string, j: JalurPilihan | null) =>
    JSON.stringify([j ? isianUntukJalur(isian, j) : isian, j === "PRESTASI" ? null : titik, n, j]);

  // Catat langkah terjauh yang pernah dibuka (disesuaikan saat render, pola yang dianjurkan React).
  const indeksSekarang = urutan.indexOf(phase);
  if (indeksSekarang > terjauh) setTerjauh(indeksSekarang);

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

  function submitJalur() {
    const form = document.getElementById("jalur-form") as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const dipilih = data.get("tahu") === "ya" ? ((data.get("jalur") as JalurPilihan | null) ?? null) : null;
    // Jalur berganti: langkah sesudahnya harus dilalui lagi lewat Lanjut.
    if (dipilih !== jalur) setTerjauh(1);
    setJalur(dipilih);
    setAfirmasi(null);
    setError("");
    setBatas(null);
    setJenjang(input.jenjang);
    setPhase("isian");
  }

  function submitNisn() {
    const value = document.querySelector<HTMLInputElement>("#nisn")?.value ?? "";
    if (!isValidNisn(value)) return;
    setNisnAnak(value);
    setPhase("jalur");
  }

  /** Isian langkah isian tanpa validasi: tempat tinggal, lalu kondisi atau nilai sesuai jalur. */
  function bacaIsian(): QuickCheckInput {
    const form = document.getElementById("isian-form") as HTMLFormElement | null;
    if (!form) return input;
    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? "");
    const dasar: QuickCheckInput = {
      ...input,
      jenjang: text("jenjang") as QuickCheckInput["jenjang"],
      kecamatan: text("kecamatan"),
      lokasi,
    };
    let next: QuickCheckInput = dasar;
    if (jalur === null) {
      next = {
        ...dasar,
        ketm: text("ketm") as QuickCheckInput["ketm"],
        disabilitas: data.get("disabilitas") === "ya",
        pindahTugas: data.get("pindah-tugas") === "ya",
      };
    } else if (jalur === "AFIRMASI") {
      const a = text("afirmasi");
      next = { ...dasar, ketm: a === "ketm" ? "ya" : "tidak", disabilitas: a === "disabilitas" };
    } else if (jalur === "MUTASI") {
      next = { ...dasar, pindahTugas: data.get("pindah-tugas") === "ya" };
    } else if (jalur === "PRESTASI") {
      next = { ...dasar, ...nilaiDari(data) };
    }
    return next;
  }

  /** Langkah isian. Isian lain yang sudah ada tetap disimpan. */
  function submitIsian() {
    const next = bacaIsian();
    setInput(next);
    setError("");
    setBatas(null);
    const invalid = validateInput(next);
    if (invalid) return setError(invalid);
    // Titik rumah wajib, kecuali Jalur Prestasi yang tidak menanyakannya.
    if (!lokasi && jalur !== "PRESTASI") {
      return setError("Tandai titik rumah di peta, atau tekan Gunakan lokasi saya. Jarak ke sekolah dihitung dari titik ini.");
    }
    if (jalur === null) return setPhase("nilai");
    const kurang = kurangUntukJalur(next, jalur);
    if (kurang) return setError(kurang);
    void hitung(isianUntukJalur(next, jalur));
  }

  /** Nilai dari formulir langkah nilai (jalan "belum tahu"), digabung dengan isian sebelumnya. */
  function bacaNilai(): QuickCheckInput {
    const form = document.getElementById("nilai-form") as HTMLFormElement | null;
    return form ? { ...input, ...nilaiDari(new FormData(form)) } : input;
  }

  function kembaliKeIsian() {
    setInput(bacaNilai());
    setError("");
    setBatas(null);
    setJenjang(input.jenjang);
    setPhase("isian");
  }

  /** Langkah nilai: hitung dengan nilai yang diisi, atau tanpa nilai bila orang tua menekan Lewati. */
  function hitungDariNilai(lewati: boolean) {
    const next = lewati ? { ...input, ...TANPA_NILAI } : bacaNilai();
    setInput(next);
    setError("");
    setBatas(null);
    const invalid = validateInput(next);
    if (invalid) return setError(invalid);
    void hitung(next);
  }

  async function hitung(dikirim: QuickCheckInput) {
    if (mengirim.current) return;
    mengirim.current = true;
    setBusy(true);
    try {
      const res = await ambil("/api/peluang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Titik rumah ikut isian yang dikirim; Jalur Prestasi tidak pernah mengirimnya (lihat isianUntukJalur).
        body: JSON.stringify(toRequest(dikirim, nisnAnak, dikirim.lokasi)),
      });
      const body = await res.json().catch(() => null);
      if (res.status === 429 && !loggedIn) return setBatas({ pesan: body?.galat ?? "", jam: jamCobaLagi(res) });
      if (!res.ok) return setError(body?.galat ?? body?.pesan ?? "Hasil belum bisa dihitung. Coba lagi sebentar lagi.");
      const r = body as ResponsPeluang;
      setResult(jalur ? saringJalur(r, jalur) : r);
      setKunciHasil(kunciDari(dikirim, lokasi, nisnAnak, jalur));
      setPhase("hasil");
    } catch (e) {
      setError(pesanGagal(e));
    } finally {
      mengirim.current = false;
      setBusy(false);
    }
  }

  /** Dari hasil satu jalur, atau dari Afirmasi yang tidak memenuhi syarat: pindah ke jalan "belum tahu". */
  function cekSemuaJalur() {
    setJalur(null);
    setTahu("belum");
    setTerjauh(2);
    setResult(null);
    setError("");
    setBatas(null);
    setJenjang(input.jenjang);
    setPhase("isian");
  }

  function save() {
    // Titik rumah ikut draf karena server menghitung ulang hasilnya saat menyimpan (titiknya tetap tidak disimpan).
    setDraft({ input: { ...isianEfektif, lokasi: jalur === "PRESTASI" ? null : lokasi }, nisn: nisnAnak });
    setLeaving(true);
    router.push(canSave ? "/cek-cepat/simpan" : "/masuk?next=%2Fcek-cepat%2Fsimpan");
  }

  function restart() {
    setNisnAnak("");
    setInput(EMPTY);
    setJalur(null);
    setTahu(null);
    setAfirmasi(null);
    setLokasi(null);
    setResult(null);
    setError("");
    setBatas(null);
    setTerjauh(0);
    setKunciHasil(null);
    setPhase("nisn");
  }

  /** Bar langkah: mundur ke langkah mana pun, maju hanya ke langkah yang sudah pernah dicapai. */
  function bisaDibuka(nomor: number): boolean {
    const tujuan = urutan[nomor - 1];
    if (!tujuan || tujuan === phase) return false;
    if (tujuan === "hasil") return result !== null && kunciHasil === kunciDari(input, lokasi, nisnAnak, jalur);
    return nomor - 1 <= terjauh;
  }

  /**
   * Pindah lewat bar langkah. Isian di langkah yang ditinggalkan disimpan tanpa validasi agar tidak hilang;
   * validasi tetap terjadi saat menekan Lanjut atau Lihat Hasil. Bila isian berubah, Hasil tidak dibuka
   * dan orang tua diminta menghitung ulang.
   */
  function pindahKeLangkah(nomor: number) {
    let tujuan = urutan[nomor - 1];
    if (!tujuan || !bisaDibuka(nomor)) return;
    let isianBaru = input;
    let nisnBaru = nisnAnak;
    let jalurBaru = jalur;
    if (phase === "nisn") {
      const v = document.querySelector<HTMLInputElement>("#nisn")?.value ?? "";
      if (isValidNisn(v)) nisnBaru = v;
    } else if (phase === "isian") {
      isianBaru = bacaIsian();
    } else if (phase === "nilai") {
      isianBaru = bacaNilai();
    } else if (phase === "jalur") {
      const form = document.getElementById("jalur-form") as HTMLFormElement | null;
      const data = form ? new FormData(form) : null;
      const jawab = data?.get("tahu");
      const pilih = (data?.get("jalur") ?? null) as JalurPilihan | null;
      // Jawaban jalur yang sudah lengkap ikut dipakai; bila jalurnya berubah, lanjut ke isian jalur itu.
      if (jawab === "belum") jalurBaru = null;
      else if (jawab === "ya" && pilih) jalurBaru = pilih;
      if (jalurBaru !== jalur) {
        setJalur(jalurBaru);
        setAfirmasi(null);
        setTerjauh(1);
        if (nomor > 2) tujuan = "isian";
      }
    }
    setNisnAnak(nisnBaru);
    setInput(isianBaru);
    setError("");
    setBatas(null);
    if (tujuan === "hasil" && kunciHasil !== kunciDari(isianBaru, lokasi, nisnBaru, jalurBaru)) {
      return setError("Isian sudah berubah sejak hasil dihitung. Tekan Lihat Hasil untuk menghitung ulang.");
    }
    if (tujuan === "isian") setJenjang(isianBaru.jenjang);
    setPhase(tujuan);
  }

  const pesanGalat = error && (
    <Alert kind="danger" title="Belum bisa dihitung">
      {error}
    </Alert>
  );
  const pesanBatas = batas && (
    <Alert
      kind="info"
      title="Batas cek tanpa akun tercapai"
      action={
        <Button variant="primary" icon="arrow-right" onClick={save}>
          Masuk dengan Google untuk lanjut
        </Button>
      }
    >
      {batas.pesan || "Cek Cepat tanpa akun dibatasi per jam. Masuk dengan Google untuk lanjut sekarang."}
      {batas.jam && ` Tanpa akun, Cek Cepat bisa dipakai lagi pukul ${batas.jam}.`}
    </Alert>
  );

  /** Isian nilai, dipakai di langkah nilai (boleh dilewati) dan di Jalur Prestasi (wajib). */
  const isianNilai = (wajib: boolean, jenjangNilai: QuickCheckInput["jenjang"]) => (
    <>
      <fieldset className="quick__nilai">
        <legend className="choice-group__legend">Rata-rata nilai rapor per semester</legend>
        <p className="field__hint">
          {wajib ? "Isi paling sedikit satu semester; makin lengkap makin tepat. " : ""}
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

      {jenjangNilai !== "smk" && (
        <fieldset className="quick__nilai">
          <legend className="choice-group__legend">Nilai TKA (untuk Jalur Prestasi SMA)</legend>
          <p className="field__hint">
            {wajib && jenjangNilai === "sma"
              ? "Wajib untuk Jalur Prestasi SMA, karena skornya dihitung dari rapor dan TKA."
              : "Boleh dikosongkan bila belum ada. Tanpa TKA, Jalur Prestasi SMA belum bisa dihitung."}
          </p>
          <Field id="tka-bin" label="TKA Bahasa Indonesia" optional={!(wajib && jenjangNilai === "sma")} placeholder="Contoh: 78" inputMode="decimal" pattern="[0-9]{1,3}([,.][0-9]{1,2})?" errorPattern="Nilai ditulis dengan angka, misalnya 78." defaultValue={teksNilai(input.tkaBin)} />
          <Field id="tka-mtk" label="TKA Matematika" optional={!(wajib && jenjangNilai === "sma")} placeholder="Contoh: 72,5" inputMode="decimal" pattern="[0-9]{1,3}([,.][0-9]{1,2})?" errorPattern="Nilai ditulis dengan angka, misalnya 72,5." defaultValue={teksNilai(input.tkaMtk)} />
        </fieldset>
      )}

      {jenjangNilai !== "sma" && (
        <fieldset className="quick__nilai">
          <legend className="choice-group__legend">Rata-rata 5 mapel selama 5 semester (untuk Kelas Industri SMK)</legend>
          <p className="field__hint">Boleh dikosongkan. Isi kelimanya agar jalur Kelas Industri SMK bisa dihitung.</p>
          {MAPEL.map(([k, label]) => (
            <Field key={k} id={`mapel-${k}`} label={label} optional placeholder="Contoh: 84" inputMode="decimal" pattern="[0-9]{1,3}([,.][0-9]{1,2})?" errorPattern="Nilai ditulis dengan angka, misalnya 84." defaultValue={teksNilai(input.mapel[k])} />
          ))}
        </fieldset>
      )}
    </>
  );

  const dialogRapor = (
    <Dialog id="dlg-rapor-cepat" title="Di mana nilai ada di rapor?">
      <p>
        Buka halaman terakhir rapor tiap semester, lalu cari baris <strong>Nilai rata-rata</strong>. Tulis angkanya apa adanya, misalnya 85,5. Semester yang belum ada boleh dikosongkan.
      </p>
    </Dialog>
  );
  const dialogKetm = (
    <Dialog id="dlg-ketm-cepat" title="Apa itu KETM?">
      <p>
        KETM adalah Keluarga Ekonomi Tidak Mampu. Syarat Jalur Afirmasi adalah terdaftar di DTSEN (Data Tunggal Sosial dan Ekonomi Nasional) pada desil 1 sampai 5. Keluarga ini biasanya juga menerima PKH atau KIP. Bila belum yakin, pilih Belum yakin.
      </p>
    </Dialog>
  );

  const afirmasiAwal = input.ketm === "ya" ? "ketm" : input.disabilitas ? "disabilitas" : null;

  return (
    <div className="quick">
      <div className="no-print">
        <Stepper
          step={indeksSekarang + 1}
          total={urutan.length}
          labels={urutan.map((ph) => NAMA_LANGKAH[ph])}
          bisaDibuka={bisaDibuka}
          onPilih={pindahKeLangkah}
        />
      </div>
      <div ref={focusRef} tabIndex={-1} className="quick__focus">
        <h1 className="text-heading-lg quick__title">{judul[phase]}</h1>
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

      {phase === "jalur" && (
        <div className="card quick__card">
          <Form id="jalur-form" onValid={submitJalur}>
            <div
              onChange={(e: ChangeEvent<HTMLDivElement>) => {
                const t = e.target as unknown as HTMLInputElement;
                if (t.name === "tahu") setTahu(t.value as "ya" | "belum");
              }}
            >
              <ChoiceGroup legend="Apakah Bapak/Ibu sudah tahu ingin mendaftar lewat jalur apa?" errorName="tahu">
                <Choice type="radio" name="tahu" value="ya" title="Sudah tahu" desc="Pilih jalurnya, isiannya jadi lebih singkat." checked={tahu === "ya"} required errorRequired="Pilih salah satu jawaban dulu." />
                <Choice type="radio" name="tahu" value="belum" title="Belum tahu, bantu pilihkan" desc="SiPesek menilai semua jalur yang terbuka untuk anak, lalu menyarankan yang paling aman." checked={tahu === "belum"} required errorRequired="Pilih salah satu jawaban dulu." />
              </ChoiceGroup>
            </div>

            {tahu === "ya" && (
              <ChoiceGroup legend="Pilih jalur" errorName="jalur">
                {PILIHAN_JALUR.map(([kode, title, desc]) => (
                  <Choice key={kode} type="radio" name="jalur" value={kode} title={title} desc={desc} checked={jalur === kode} required errorRequired="Pilih jalur yang ingin dicek." />
                ))}
              </ChoiceGroup>
            )}

            <ButtonGroup>
              <Button variant="primary" block type="submit" icon="arrow-right">
                Lanjut
              </Button>
              <Button variant="secondary" block iconLeft="chevron-left" onClick={() => setPhase("nisn")}>
                Kembali
              </Button>
            </ButtonGroup>
          </Form>
        </div>
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
              defaultValue={nisnAnak}
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
                checked={nisnAnak !== ""}
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
            <div
              onChange={(e: ChangeEvent<HTMLDivElement>) => {
                const t = e.target as unknown as HTMLInputElement;
                if (t.name === "jenjang") setJenjang(t.value as QuickCheckInput["jenjang"]);
              }}
            >
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

            {/* Kecamatan hanya dipakai rayon Domisili SMA: diminta untuk Domisili dan jalan "belum tahu". */}
            {(jalur === null || jalur === "DOMISILI") && (
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
            )}
            {/* Jalur Prestasi diurutkan dari skor, jadi tidak menanyakan titik rumah sama sekali. */}
            {jalur !== "PRESTASI" && <HomePicker value={lokasi} onChange={setLokasi} />}

            {jalur === null && (
              <>
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
              </>
            )}

            {jalur === "AFIRMASI" && (
              <div
                onChange={(e: ChangeEvent<HTMLDivElement>) => {
                  const t = e.target as unknown as HTMLInputElement;
                  if (t.name === "afirmasi") setAfirmasi(t.value as "ketm" | "disabilitas" | "tidak");
                }}
              >
                <ChoiceGroup
                  legend="Anak mendaftar Afirmasi sebagai apa?"
                  hint={<HelpLink opens="dlg-ketm-cepat">Apa itu KETM?</HelpLink>}
                  errorName="afirmasi"
                >
                  <Choice type="radio" name="afirmasi" value="ketm" title="Keluarga kurang mampu (KETM)" desc="Terdaftar di DTSEN pada desil 1 sampai 5." checked={afirmasiAwal === "ketm"} required errorRequired="Pilih salah satu jawaban dulu." />
                  <Choice type="radio" name="afirmasi" value="disabilitas" title="Anak penyandang disabilitas" desc="Anak berkebutuhan khusus." checked={afirmasiAwal === "disabilitas"} required errorRequired="Pilih salah satu jawaban dulu." />
                  <Choice type="radio" name="afirmasi" value="tidak" title="Bukan keduanya, atau belum yakin" required errorRequired="Pilih salah satu jawaban dulu." />
                </ChoiceGroup>
              </div>
            )}
            {jalur === "AFIRMASI" && afirmasi === "tidak" && (
              <Alert
                kind="warning"
                title="Anak belum memenuhi syarat Jalur Afirmasi"
                action={
                  <Button variant="secondary" icon="arrow-right" onClick={cekSemuaJalur}>
                    Bantu pilihkan jalur
                  </Button>
                }
              >
                Jalur Afirmasi hanya untuk keluarga KETM atau anak penyandang disabilitas. SiPesek bisa menilai semua jalur
                lain yang terbuka untuk anak, tanpa mengisi ulang.
              </Alert>
            )}

            {jalur === "MUTASI" && (
              <ChoiceGroup legend="Syarat Jalur Mutasi" errorName="pindah-tugas">
                <Choice
                  type="checkbox"
                  name="pindah-tugas"
                  value="ya"
                  title="Orang tua pindah tugas ke Depok"
                  desc="Perlu surat penugasan dari instansi. Jalur Mutasi untuk anak guru belum bisa dicek di Cek Cepat."
                  checked={input.pindahTugas}
                  required
                  errorRequired="Centang bila orang tua memang pindah tugas. Bila tidak, tekan Ganti jalur."
                />
              </ChoiceGroup>
            )}

            {jalur === "PRESTASI" && isianNilai(true, jenjang)}

            {pesanGalat}
            {pesanBatas}
            <ButtonGroup>
              <Button variant="primary" block type="submit" icon="arrow-right">
                {jalur === null ? "Lanjut" : busy ? "Menghitung…" : "Lihat Hasil"}
              </Button>
              <Button variant="secondary" block iconLeft="chevron-left" onClick={() => setPhase("jalur")}>
                Ganti jalur
              </Button>
            </ButtonGroup>
          </Form>
          {dialogKetm}
          {dialogRapor}
        </div>
      )}

      {phase === "nilai" && (
        <div className="card quick__card">
          <Form id="nilai-form" onValid={() => hitungDariNilai(false)}>
            <Alert kind="info" title="Langkah ini boleh dilewati">
              Nilai hanya dipakai untuk Jalur Prestasi. Bila dilewati, hasil tetap menampilkan jalur lain yang terbuka untuk anak,
              seperti Jalur Domisili. Peluang Jalur Prestasi baru bisa dihitung bila nilai diisi.
            </Alert>

            {isianNilai(false, input.jenjang)}

            {pesanGalat}
            {pesanBatas}
            <ButtonGroup>
              <Button variant="primary" block type="submit" icon="arrow-right">
                {busy ? "Menghitung…" : "Lihat Hasil"}
              </Button>
              <Button variant="secondary" block icon="arrow-right" onClick={() => hitungDariNilai(true)}>
                Lewati, lihat hasil tanpa nilai
              </Button>
              <Button variant="ghost" block iconLeft="chevron-left" onClick={kembaliKeIsian}>
                Kembali
              </Button>
            </ButtonGroup>
          </Form>
          {dialogRapor}
        </div>
      )}

      {phase === "hasil" && result && (
        <HasilCepat
          result={result}
          input={isianEfektif}
          loggedIn={loggedIn}
          canSave={canSave}
          onSave={save}
          onEdit={() => {
            setJenjang(input.jenjang);
            setPhase("isian");
          }}
          onRestart={restart}
          jalurDipilih={jalur}
          onCekSemuaJalur={cekSemuaJalur}
          date={dateText()}
        />
      )}
    </div>
  );
}
