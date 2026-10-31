"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ButtonGroup, Choice, ChoiceGroup, Dialog, ExternalLink, Field, Form, HelpLink, PageHeader, Select } from "@/components";
import { HomePicker } from "@/features/cek-cepat/HomePicker";
import { setBaruDisimpan } from "@/features/cek-cepat/draft-store";
import { WIZARD_TOTAL_ORTU } from "@/lib/accounts";
import type { AnakRingkas, PermintaanPeluang, ResponsPeluang } from "@/lib/kontrak";
import {
  KECAMATAN_KK,
  MAPEL,
  parseNumber,
  SEMESTER_COUNT,
  toRequest,
  validateInput,
  type QuickCheckInput,
  type Titik,
} from "@/lib/quick-check";
import { bacaIsian, ISIAN_KOSONG, simpanIsian, type Isian } from "./isian";
import { segarkanOrtu, tandaiUsang, useOrtu, type AnakOrtu } from "./store";
import { GagalMuat, Memuat, SesiBerakhir } from "./Wadah";

const LANGKAH = [
  { title: "Data anak", desc: "Nama, NISN, dan jenjang tujuan." },
  { title: "Nilai", desc: "Nilai rapor, TKA, atau nilai mapel. Boleh dikosongkan dulu dan dilengkapi nanti." },
  { title: "Kondisi keluarga", desc: "Menentukan apakah Jalur Afirmasi dan Jalur Mutasi ikut dihitung." },
  { title: "Titik rumah", desc: "Untuk menghitung jarak ke sekolah. Titik ini dipakai untuk menghitung, lalu dibuang." },
] as const;

const FORM = "isi-data-form";
const href = (n: number) => `/isi-data/${n}`;
const teks = (v: number | null) => (v === null ? "" : String(v).replace(".", ","));
const angka = (raw: FormDataEntryValue | null) => {
  const v = parseNumber(String(raw ?? ""));
  return v === null || Number.isNaN(v) ? null : v;
};
const bacaForm = () => new FormData(document.getElementById(FORM) as HTMLFormElement);
const POLA_NILAI = "[0-9]{1,3}([,.][0-9]{1,2})?";

/**
 * Isi data anak untuk akun Google, 4 langkah: data anak, nilai, kondisi keluarga, titik rumah.
 * Langkah 1 membuat anak di server (POST /api/ortu/anak). Isian langkah berikutnya disimpan di perangkat
 * (features/ortu/isian) agar bisa dilanjutkan, lalu langkah terakhir menghitung dan menyimpan hasil
 * (POST /api/peluang dengan anakId) dan membuka /hasil/[token].
 */
export function WizardOrtu({ n, baru }: { n: number; baru: boolean }) {
  const router = useRouter();
  const { status, aktif } = useOrtu();

  useEffect(() => {
    if (n > WIZARD_TOTAL_ORTU) router.replace(href(WIZARD_TOTAL_ORTU));
  }, [n, router]);

  if (n > WIZARD_TOTAL_ORTU || status === "memuat") return <Memuat teks="Memuat data anak…" />;
  if (status === "belum-masuk") return <SesiBerakhir />;
  if (status === "galat") return <GagalMuat />;
  if (n === 1 && (baru || !aktif)) return <AnakBaru />;
  if (!aktif) {
    return (
      <Alert
        kind="info"
        title="Pilih anak dulu"
        action={
          <ButtonGroup>
            <Button variant="primary" href="/isi-data/1?baru=1">
              Tambah anak
            </Button>
            <Button variant="secondary" href="/anak-saya">
              Data Anak
            </Button>
          </ButtonGroup>
        }
      >
        Belum ada anak yang dipilih untuk diisi datanya.
      </Alert>
    );
  }
  // Kunci per anak dan langkah: tiap langkah membaca isian terbaru anak itu.
  return <LangkahAnak key={`${aktif.id}-${n}`} n={n} anak={aktif} />;
}

/** Kerangka satu langkah: judul, kartu form, tombol Simpan & Lanjut dan Kembali. */
function Kerangka({
  n,
  anak,
  onValid,
  galat,
  busy,
  children,
}: {
  n: number;
  anak?: AnakOrtu;
  onValid: () => void;
  galat: string;
  busy: boolean;
  children: ReactNode;
}) {
  const terakhir = n === WIZARD_TOTAL_ORTU;
  return (
    <>
      <PageHeader art="profile" title={LANGKAH[n - 1].title} desc={LANGKAH[n - 1].desc} />
      {anak && (
        <p className="text-secondary wizard-ortu__anak">
          Untuk <strong>{anak.nama}</strong> (NISN berakhiran {anak.nisnAkhir}).{" "}
          <Link className="link" href="/anak-saya">
            Ganti anak
          </Link>
        </p>
      )}
      <div className="card wizard__card">
        <Form id={FORM} onValid={onValid}>
          {children}
          {galat && (
            <Alert kind="danger" title="Belum bisa disimpan">
              {galat}
            </Alert>
          )}
          <div className="wizard__actions">
            <ButtonGroup>
              <Button variant="primary" block type="submit" icon={terakhir ? undefined : "arrow-right"}>
                {busy ? (terakhir ? "Menghitung…" : "Menyimpan…") : terakhir ? "Lihat peluang" : "Simpan & lanjut"}
              </Button>
              <Button variant="secondary" block href={n === 1 ? "/anak-saya" : href(n - 1)} iconLeft="chevron-left">
                Kembali
              </Button>
            </ButtonGroup>
          </div>
        </Form>
      </div>
      <p className="text-caption text-secondary wizard-ortu__catatan">
        Isian tersimpan di perangkat ini agar bisa dilanjutkan nanti, dan terhapus saat Bapak/Ibu keluar. NISN dan titik rumah
        tidak ikut disimpan.
      </p>
    </>
  );
}

const JENJANG = [
  ["sma", "SMA", "Sekolah umum, lanjut ke perguruan tinggi."],
  ["smk", "SMK", "Sekolah kejuruan, siap kerja."],
  ["belum", "Belum tahu", "Kami hitung SMA dan SMK."],
] as const;

function PilihJenjang({ nilai }: { nilai: Isian["jenjang"] }) {
  return (
    <ChoiceGroup legend="Mau mendaftar ke mana?" errorName="jenjang">
      {JENJANG.map(([v, title, desc]) => (
        <Choice key={v} type="radio" name="jenjang" value={v} title={title} desc={desc} checked={nilai === v} required errorRequired="Pilih jenjang tujuan." />
      ))}
    </ChoiceGroup>
  );
}

/** Langkah 1 untuk anak baru: membuat anak di server dengan nama, NISN, dan persetujuan orang tua. */
function AnakBaru() {
  const router = useRouter();
  const [galat, setGalat] = useState("");
  const [busy, setBusy] = useState(false);

  async function simpan() {
    if (busy) return;
    const f = bacaForm();
    const jenjang = String(f.get("jenjang")) as Isian["jenjang"];
    setBusy(true);
    setGalat("");
    try {
      const res = await fetch("/api/ortu/anak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: String(f.get("nama") ?? "").trim(), nisn: String(f.get("nisn") ?? "").trim(), setuju: true }),
      });
      const isi = await res.json().catch(() => null);
      if (!res.ok) {
        const tambahan = res.status === 409 && /daftar anak Anda/.test(isi?.galat ?? "") ? " Pilih anak itu di halaman Data Anak untuk melanjutkan." : "";
        setGalat((isi?.galat ?? "Data anak belum bisa disimpan. Coba lagi sebentar lagi.") + tambahan);
        return setBusy(false);
      }
      const anak = isi as AnakRingkas;
      simpanIsian(anak.id, { jenjang, langkah: 1 });
      tandaiUsang(anak.id);
      await segarkanOrtu();
      router.push(href(2));
    } catch {
      setGalat("Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.");
      setBusy(false);
    }
  }

  return (
    <Kerangka n={1} onValid={simpan} galat={galat} busy={busy}>
      <Field id="nama" label="Nama lengkap anak" hint="Tulis seperti di akta kelahiran." required errorRequired="Nama belum diisi." autoComplete="off" maxLength={80} />
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
      />
      <p className="text-secondary">
        Belum yakin NISN-nya? <ExternalLink href="https://nisn.data.kemendikdasmen.go.id/">Cek di situs resmi NISN</ExternalLink>
      </p>
      <PilihJenjang nilai="sma" />
      <ChoiceGroup legend="Persetujuan" errorName="setuju">
        <Choice
          type="checkbox"
          name="setuju"
          value="ya"
          title="Saya orang tua atau wali anak ini dan setuju datanya disimpan"
          desc="Nama dan NISN tersandi disimpan di akun ini. Bisa dihapus kapan saja di halaman Data Anak."
          required
          errorRequired="Centang persetujuan untuk melanjutkan."
        />
      </ChoiceGroup>
    </Kerangka>
  );
}

/** Langkah 1 (anak sudah ada) sampai langkah terakhir untuk satu anak. */
function LangkahAnak({ n, anak }: { n: number; anak: AnakOrtu }) {
  const router = useRouter();
  const [isian] = useState<Isian>(() => bacaIsian(anak.id) ?? ISIAN_KOSONG);
  const [lokasi, setLokasi] = useState<Titik | null>(null);
  const [galat, setGalat] = useState("");
  const [busy, setBusy] = useState(false);
  const [sesiHabis, setSesiHabis] = useState(false);

  const lanjut = (ubah: Partial<Isian>) => {
    simpanIsian(anak.id, { ...ubah, langkah: n });
    router.push(href(n + 1));
  };

  function simpanLangkah1() {
    lanjut({ jenjang: String(bacaForm().get("jenjang")) as Isian["jenjang"] });
  }

  function simpanNilai() {
    const f = bacaForm();
    const nilai = Array.from({ length: SEMESTER_COUNT }, (_, i) => angka(f.get(`nilai-${i + 1}`)));
    const tkaBin = isian.jenjang === "smk" ? isian.tkaBin : angka(f.get("tka-bin"));
    const tkaMtk = isian.jenjang === "smk" ? isian.tkaMtk : angka(f.get("tka-mtk"));
    const mapel =
      isian.jenjang === "sma"
        ? isian.mapel
        : (Object.fromEntries(MAPEL.map(([k]) => [k, angka(f.get(`mapel-${k}`))])) as Isian["mapel"]);
    const semua = [...nilai, tkaBin, tkaMtk, ...Object.values(mapel)].filter((v): v is number => v !== null);
    if (semua.some((v) => v < 0 || v > 100)) return setGalat("Nilai ditulis 0 sampai 100, misalnya 85,5.");
    lanjut({ nilai, tkaBin, tkaMtk, mapel });
  }

  function simpanKondisi() {
    const f = bacaForm();
    lanjut({
      ketm: String(f.get("ketm")) as Isian["ketm"],
      disabilitas: f.get("disabilitas") === "ya",
      pindahTugas: f.get("pindah-tugas") === "ya",
    });
  }

  async function hitung() {
    if (busy) return;
    const kecamatan = String(bacaForm().get("kecamatan") ?? "");
    const { langkah, ...sisa } = isian;
    void langkah;
    const input: QuickCheckInput = { ...sisa, kecamatan, lokasi };
    const salah = validateInput(input);
    if (salah) return setGalat(salah);
    if (!lokasi) return setGalat("Tandai titik rumah di peta, atau tekan Gunakan lokasi saya.");
    setBusy(true);
    setGalat("");
    simpanIsian(anak.id, { kecamatan });
    const body: PermintaanPeluang = { ...toRequest(input, "", lokasi), anakId: anak.id };
    delete body.nisn;
    try {
      const res = await fetch("/api/peluang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const isi = await res.json().catch(() => null);
      if (res.status === 401) {
        setSesiHabis(true);
        return setBusy(false);
      }
      if (!res.ok) {
        setGalat(isi?.galat ?? "Peluang belum bisa dihitung. Coba lagi sebentar lagi.");
        return setBusy(false);
      }
      const hasil = isi as ResponsPeluang;
      simpanIsian(anak.id, { langkah: WIZARD_TOTAL_ORTU });
      setBaruDisimpan({ result: hasil, input, pesan: `Data ${anak.nama} lengkap, dan hasil ini tersimpan di riwayatnya.` });
      tandaiUsang(anak.id);
      router.push(`/hasil/${hasil.token}`);
    } catch {
      setGalat("Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.");
      setBusy(false);
    }
  }

  if (sesiHabis) return <SesiBerakhir />;

  if (n === 1) {
    return (
      <Kerangka n={1} anak={anak} onValid={simpanLangkah1} galat={galat} busy={busy}>
        <PilihJenjang nilai={isian.jenjang} />
        <p className="text-secondary">
          Mau mengisi untuk anak lain?{" "}
          <Link className="link" href="/isi-data/1?baru=1">
            Tambah anak baru
          </Link>
        </p>
      </Kerangka>
    );
  }

  if (n === 2) {
    return (
      <Kerangka n={2} anak={anak} onValid={simpanNilai} galat={galat} busy={busy}>
        <fieldset className="quick__nilai">
          <legend className="choice-group__legend">Rata-rata nilai rapor per semester</legend>
          <p>
            <HelpLink opens="dlg-rapor-isi">Di mana nilai ada di rapor?</HelpLink>
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
              pattern={POLA_NILAI}
              defaultValue={teks(isian.nilai[i])}
            />
          ))}
        </fieldset>
        {isian.jenjang !== "smk" && (
          <fieldset className="quick__nilai">
            <legend className="choice-group__legend">Nilai TKA (untuk Jalur Prestasi SMA)</legend>
            <p className="field__hint">Tanpa TKA, Jalur Prestasi SMA belum bisa dihitung.</p>
            <Field id="tka-bin" label="TKA Bahasa Indonesia" optional placeholder="Contoh: 78" inputMode="decimal" pattern={POLA_NILAI} errorPattern="Nilai ditulis dengan angka, misalnya 78." defaultValue={teks(isian.tkaBin)} />
            <Field id="tka-mtk" label="TKA Matematika" optional placeholder="Contoh: 72,5" inputMode="decimal" pattern={POLA_NILAI} errorPattern="Nilai ditulis dengan angka, misalnya 72,5." defaultValue={teks(isian.tkaMtk)} />
          </fieldset>
        )}
        {isian.jenjang !== "sma" && (
          <fieldset className="quick__nilai">
            <legend className="choice-group__legend">Rata-rata 5 mapel selama 5 semester (untuk Kelas Industri SMK)</legend>
            <p className="field__hint">Isi kelimanya agar jalur Kelas Industri SMK bisa dihitung.</p>
            {MAPEL.map(([k, label]) => (
              <Field key={k} id={`mapel-${k}`} label={label} optional placeholder="Contoh: 84" inputMode="decimal" pattern={POLA_NILAI} errorPattern="Nilai ditulis dengan angka, misalnya 84." defaultValue={teks(isian.mapel[k])} />
            ))}
          </fieldset>
        )}
        <Dialog id="dlg-rapor-isi" title="Di mana nilai ada di rapor?">
          <p>
            Buka halaman terakhir rapor tiap semester, lalu cari baris <strong>Nilai rata-rata</strong>. Tulis angkanya apa adanya,
            misalnya 85,5. Semester yang belum ada boleh dikosongkan.
          </p>
        </Dialog>
      </Kerangka>
    );
  }

  if (n === 3) {
    return (
      <Kerangka n={3} anak={anak} onValid={simpanKondisi} galat={galat} busy={busy}>
        <ChoiceGroup legend="Apakah keluarga termasuk kurang mampu (KETM)?" hint={<HelpLink opens="dlg-ketm-isi">Apa ini?</HelpLink>} errorName="ketm">
          {(
            [
              ["ya", "Ya", "Terdaftar di DTSEN atau menerima bantuan sosial."],
              ["tidak", "Tidak", "Kami cek jalur lain yang cocok."],
              ["ragu", "Belum yakin", "Jalur Afirmasi belum dihitung sampai statusnya pasti."],
            ] as const
          ).map(([v, title, desc]) => (
            <Choice key={v} type="radio" name="ketm" value={v} title={title} desc={desc} checked={isian.ketm === v} required errorRequired="Pilih salah satu jawaban dulu. Bila belum yakin, pilih Belum yakin." />
          ))}
        </ChoiceGroup>
        <ChoiceGroup legend="Kondisi lain (bila ada)">
          <Choice type="checkbox" name="disabilitas" value="ya" title="Anak penyandang disabilitas" desc="Membuka Jalur Afirmasi untuk anak berkebutuhan khusus." checked={isian.disabilitas} />
          <Choice type="checkbox" name="pindah-tugas" value="ya" title="Orang tua pindah tugas ke Depok" desc="Membuka Jalur Mutasi. Perlu surat penugasan dari instansi." checked={isian.pindahTugas} />
        </ChoiceGroup>
        <ChoiceGroup legend="Persetujuan data sensitif" errorName="setuju-keluarga">
          <Choice
            type="checkbox"
            name="setuju-keluarga"
            value="ya"
            title="Saya mengizinkan data kondisi keluarga dipakai untuk menghitung peluang"
            desc="Hanya dipakai untuk menentukan jalur yang dihitung dan tidak dibagikan."
            checked={isian.langkah >= 3}
            required
            errorRequired="Centang persetujuan ini untuk melanjutkan."
          />
        </ChoiceGroup>
        <Dialog id="dlg-ketm-isi" title="Apa itu KETM?">
          <p>
            KETM adalah Keluarga Ekonomi Tidak Mampu. Syarat Jalur Afirmasi adalah terdaftar di DTSEN (Data Tunggal Sosial dan
            Ekonomi Nasional) pada desil 1 sampai 5. Keluarga ini biasanya juga menerima PKH atau KIP. Bila belum yakin, pilih
            Belum yakin dan tanyakan ke kantor kelurahan.
          </p>
        </Dialog>
      </Kerangka>
    );
  }

  return (
    <Kerangka n={4} anak={anak} onValid={hitung} galat={galat} busy={busy}>
      <Select
        id="kecamatan"
        label="Kecamatan sesuai Kartu Keluarga"
        options={KECAMATAN_KK}
        placeholder="Pilih kecamatan"
        hint="Menentukan rayon Jalur Domisili SMA. Pilih Lainnya bila KK di luar daftar."
        selected={isian.kecamatan}
        required
        errorRequired="Pilih kecamatan sesuai Kartu Keluarga."
      />
      <HomePicker value={lokasi} onChange={setLokasi} />
    </Kerangka>
  );
}
