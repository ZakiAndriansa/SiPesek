"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, Badge, Button, Dialog, Field, Form, PageHeader, Select, Table, Toolbar } from "@/components";
import { useToast } from "@/components/toast/Toast";
import type { ResponsAdminSekolah } from "@/lib/kontrak";
import { SesiAdminBerakhir } from "./SesiAdmin";

type Sekolah = ResponsAdminSekolah["sekolah"][number];
type Status = "memuat" | "ada" | "belum-masuk" | "galat";

const STATUS = ["Sekolah negeri", "Sekolah swasta"];
const JENJANG = ["Semua jenjang", "SMA", "SMK"];
const KELENGKAPAN = ["Semua", "Belum ada koordinat", "Belum ada daya tampung atau biaya"];
const BATAS_BARIS = 60;
const DIALOG = "dlg-ubah-sekolah";
const FORM = "form-ubah-sekolah";

// Batas sama dengan PATCH /api/admin/sekolah/[id]: wilayah Depok dan sekitarnya.
const BATAS_LAT = [-6.5, -6.3] as const;
const BATAS_LNG = [106.7, 106.95] as const;

const koordinat = (n: number) => n.toLocaleString("id-ID", { minimumFractionDigits: 5, maximumFractionDigits: 5 });
const angkaDari = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").trim().replace(",", ".");
  return t === "" ? null : Number(t);
};
const teksDari = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").trim();
  return t === "" ? null : t;
};

/** Data sekolah dan daya tampung: melengkapi koordinat, alamat, biaya swasta, dan daya tampung sekolah negeri. */
export function DataSekolah() {
  const { show } = useToast();
  const [status, setStatus] = useState<Status>("memuat");
  const [data, setData] = useState<ResponsAdminSekolah | null>(null);
  const [filter, setFilter] = useState({ cari: "", status: STATUS[0], jenjang: JENJANG[0], kelengkapan: KELENGKAPAN[0] });
  const [dipilih, setDipilih] = useState<Sekolah | null>(null);
  const [galat, setGalat] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let batal = false;
    fetch("/api/admin/sekolah")
      .then(async (res) => {
        if (batal) return;
        if (res.status === 401) return setStatus("belum-masuk");
        if (!res.ok) return setStatus("galat");
        setData((await res.json()) as ResponsAdminSekolah);
        setStatus("ada");
      })
      .catch(() => !batal && setStatus("galat"));
    return () => {
      batal = true;
    };
  }, []);

  const negeri = filter.status === STATUS[0];
  const daftar = useMemo(() => {
    const cari = filter.cari.toLowerCase();
    return (data?.sekolah ?? []).filter(
      (s) =>
        (negeri ? s.status === "NEGERI" : s.status !== "NEGERI") &&
        (filter.jenjang === JENJANG[0] || s.jenjang === filter.jenjang) &&
        (!cari || s.nama.toLowerCase().includes(cari) || s.npsn.includes(cari)) &&
        (filter.kelengkapan === KELENGKAPAN[0] ||
          (filter.kelengkapan === KELENGKAPAN[1] ? s.lat === null || s.lng === null : negeri ? s.dayaTampung === null : !s.biayaRingkas)),
    );
  }, [data, filter, negeri]);

  if (status === "memuat") return <Memuat />;
  if (status === "belum-masuk") return <SesiAdminBerakhir />;
  if (status === "galat" || !data) {
    return (
      <Alert kind="danger" title="Data sekolah belum bisa dimuat">
        Tidak tersambung ke server SiPesek. Periksa internet, lalu muat ulang halaman ini.
      </Alert>
    );
  }

  const tanpaTitik = data.sekolah.filter((s) => s.lat === null || s.lng === null).length;

  function ubahFilter(e: FormEvent<HTMLDivElement>) {
    const t = e.target as HTMLInputElement;
    const kunci = { "cari-sekolah": "cari", "f-status": "status", "f-jenjang": "jenjang", "f-lengkap": "kelengkapan" }[t.id];
    if (kunci) setFilter((f) => ({ ...f, [kunci]: t.value }));
  }

  async function simpan() {
    if (!dipilih || busy) return;
    const f = new FormData(document.getElementById(FORM) as HTMLFormElement);
    const lat = angkaDari(f.get("lat"));
    const lng = angkaDari(f.get("lng"));
    if ((lat === null) !== (lng === null)) return setGalat("Isi lintang dan bujur sekaligus, atau kosongkan keduanya.");
    if (lat !== null && (Number.isNaN(lat) || lat < BATAS_LAT[0] || lat > BATAS_LAT[1]))
      return setGalat("Lintang untuk Depok berada di antara -6,5 dan -6,3, misalnya -6,40213.");
    if (lng !== null && (Number.isNaN(lng) || lng < BATAS_LNG[0] || lng > BATAS_LNG[1]))
      return setGalat("Bujur untuk Depok berada di antara 106,7 dan 106,95, misalnya 106,81852.");

    const ubah: Record<string, unknown> = { lat, lng };
    const alamat = teksDari(f.get("alamat"));
    if (alamat) ubah.alamat = alamat;

    let kuota: number | null = null;
    let sumberKuota: string | null = null;
    if (dipilih.status === "NEGERI") {
      kuota = angkaDari(f.get("kuota"));
      sumberKuota = teksDari(f.get("sumber-kuota"));
      if (kuota !== null && (!Number.isInteger(kuota) || kuota < 0 || kuota > 5000))
        return setGalat("Daya tampung ditulis sebagai bilangan bulat, misalnya 360.");
      if (kuota !== null && kuota !== dipilih.dayaTampung && (!sumberKuota || sumberKuota.length < 3))
        return setGalat("Tulis sumber angka daya tampung, misalnya nomor surat keputusan atau situs SPMB.");
      if (kuota !== null && data?.tahun === null) return setGalat("Belum ada tahun acuan. Simpan aturan SPMB dulu.");
    } else {
      ubah.biayaRingkas = teksDari(f.get("biaya"));
      ubah.biayaUrl = teksDari(f.get("biaya-url"));
      ubah.biayaResmi = ubah.biayaRingkas ? f.get("biaya-resmi") === "Situs resmi sekolah" : null;
      if (ubah.biayaRingkas && !ubah.biayaUrl) return setGalat("Biaya hanya ditampilkan bila ada sumbernya. Isi tautan sumber biaya.");
    }

    setBusy(true);
    setGalat("");
    try {
      const res = await fetch(`/api/admin/sekolah/${dipilih.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ubah),
      });
      if (res.status === 401) return setStatus("belum-masuk");
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.galat ?? "");
      if (kuota !== null && kuota !== dipilih.dayaTampung && data?.tahun) {
        const dt = await fetch("/api/admin/daya-tampung", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tahun: data.tahun, sekolahId: dipilih.id, programId: null, kuota, sumber: sumberKuota }),
        });
        if (dt.status === 401) return setStatus("belum-masuk");
        if (!dt.ok) throw new Error("Koordinat dan alamat tersimpan, tetapi daya tampung belum.");
      }
      const baru: Sekolah = {
        ...dipilih,
        ...(ubah as Partial<Sekolah>),
        dayaTampung: kuota !== null ? kuota : dipilih.dayaTampung,
      };
      setData((d) => d && { ...d, sekolah: d.sekolah.map((s) => (s.id === baru.id ? baru : s)) });
      (document.getElementById(DIALOG) as HTMLDialogElement | null)?.close();
      show(`Data ${baru.nama} tersimpan.`, "success");
    } catch (e) {
      setGalat(e instanceof Error && e.message ? e.message : "Belum bisa disimpan. Periksa internet, lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Data sekolah dan daya tampung"
        desc={`Lengkapi koordinat dan alamat, daya tampung sekolah negeri${data.tahun ? ` untuk SPMB ${data.tahun}` : ""}, dan biaya sekolah swasta. Perubahan langsung dipakai mesin peluang dan dashboard.`}
      />
      {tanpaTitik > 0 && (
        <Alert kind="warning" title={`${tanpaTitik} sekolah belum punya koordinat`}>
          Sekolah tanpa koordinat tidak tampil di peta dan jaraknya tidak bisa dihitung. Pilih &quot;Belum ada koordinat&quot; untuk
          melihatnya.
        </Alert>
      )}
      <div onInput={ubahFilter} onChange={ubahFilter}>
        <Toolbar wide>
          <Field id="cari-sekolah" label="Cari sekolah" type="search" placeholder="Nama atau NPSN" />
          <Select id="f-status" label="Status" options={STATUS} selected={filter.status} />
          <Select id="f-jenjang" label="Jenjang" options={JENJANG} selected={filter.jenjang} />
          <Select id="f-lengkap" label="Kelengkapan" options={KELENGKAPAN} selected={filter.kelengkapan} />
        </Toolbar>
      </div>
      <p className="text-secondary" aria-live="polite">
        {daftar.length} sekolah{daftar.length > BATAS_BARIS ? `, ${BATAS_BARIS} pertama ditampilkan; persempit dengan pencarian` : ""}.
      </p>
      <Table
        caption="Daftar sekolah"
        head={["Sekolah", "Jenjang", "Kecamatan", "Koordinat", negeri ? "Daya tampung" : "Biaya", "Tindakan"]}
        rows={daftar.slice(0, BATAS_BARIS).map((s) => [
          <span key="n" className="kebijakan-sekolah">
            <strong>{s.nama}</strong>
            <small>NPSN {s.npsn}</small>
          </span>,
          s.jenjang,
          s.kecamatan,
          s.lat !== null && s.lng !== null ? `${koordinat(s.lat)}, ${koordinat(s.lng)}` : <Badge kind="berisiko">Belum ada</Badge>,
          negeri ? (
            s.dayaTampung ?? <span className="table__muted">Belum diisi</span>
          ) : s.biayaRingkas ? (
            s.biayaRingkas
          ) : (
            <span className="table__muted">Tanyakan ke sekolah</span>
          ),
          <Button
            key="u"
            variant="ghost"
            sm
            iconLeft="edit"
            opens={DIALOG}
            aria-label={`Ubah ${s.nama}`}
            onClick={() => {
              setGalat("");
              setDipilih(s);
            }}
          >
            Ubah
          </Button>,
        ])}
      />

      <Dialog
        id={DIALOG}
        title={dipilih ? `Ubah ${dipilih.nama}` : "Ubah sekolah"}
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" type="submit" form={FORM}>
              {busy ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        {dipilih && (
          <Form id={FORM} key={dipilih.id} onValid={simpan}>
            <p className="text-secondary">
              Koordinat bisa disalin dari Google Maps: klik kanan titik sekolah, lalu klik angka koordinat yang muncul.
            </p>
            <Field id="lat" label="Lintang" optional inputMode="decimal" placeholder="Contoh: -6,40213" defaultValue={dipilih.lat === null ? "" : String(dipilih.lat).replace(".", ",")} />
            <Field id="lng" label="Bujur" optional inputMode="decimal" placeholder="Contoh: 106,81852" defaultValue={dipilih.lng === null ? "" : String(dipilih.lng).replace(".", ",")} />
            <Field id="alamat" label="Alamat" defaultValue={dipilih.alamat} />
            {dipilih.status === "NEGERI" ? (
              <>
                <Field
                  id="kuota"
                  label={`Daya tampung${data.tahun ? ` SPMB ${data.tahun}` : ""}`}
                  optional
                  inputMode="numeric"
                  hint="Jumlah kursi kelas 10 untuk semua jalur."
                  defaultValue={dipilih.dayaTampung === null ? "" : String(dipilih.dayaTampung)}
                />
                <Field id="sumber-kuota" label="Sumber angka daya tampung" optional hint="Wajib bila daya tampung diubah, misalnya nomor SK atau situs SPMB." />
              </>
            ) : (
              <>
                <Field id="biaya" label="Ringkasan biaya" optional placeholder="Contoh: Uang pangkal Rp5 juta, SPP Rp600 ribu per bulan" defaultValue={dipilih.biayaRingkas ?? ""} />
                <Select
                  id="biaya-resmi"
                  label="Sumber biaya"
                  options={["Situs resmi sekolah", "Media atau sumber lain"]}
                  selected={dipilih.biayaResmi === false ? "Media atau sumber lain" : "Situs resmi sekolah"}
                />
                <Field id="biaya-url" label="Tautan sumber biaya" optional type="url" placeholder="https://" defaultValue={dipilih.biayaUrl ?? ""} />
              </>
            )}
            {galat && <Alert kind="danger">{galat}</Alert>}
          </Form>
        )}
      </Dialog>
    </>
  );
}

function Memuat() {
  return (
    <div className="card" aria-busy="true">
      <p className="text-secondary">Memuat data sekolah…</p>
    </div>
  );
}
