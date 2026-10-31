"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, type ChangeEvent } from "react";
import { Alert, Badge, Button, Dialog, Disclaimer, HelpLink, MapLegend, NextStep, PageHeader, SchoolCard, Select, Toolbar } from "@/components";
import type { HasilJalur, HasilSekolah, LabelPeluang } from "@/lib/kontrak";
import { badgeText, catatanHasil, faktaSekolah, JALUR_UTAMA, jalurUtama, KIND, namaJalur, namaLabel } from "@/lib/quick-check";
import { MAKS_PILIHAN, usePilihan } from "./pilihan";
import { HapusHasil } from "./HapusHasil";
import { DenganHasil, SumberHasil, type DataTahap } from "./Wadah";

const PetaHasil = dynamic(() => import("./PetaHasil"), {
  ssr: false,
  loading: () => <div className="quick__map quick__map--memuat">Memuat peta…</div>,
});

const SEMUA_JALUR = "Semua jalur";
const SEMUA_JENJANG = "SMA dan SMK";
const SEMUA_LABEL = "Semua label";
const LABEL: LabelPeluang[] = ["PELUANG_BESAR", "MASIH_MUNGKIN", "PELUANG_KECIL", "TIDAK_DIHITUNG"];

/** Hasil Sekolah untuk akun Google: semua sekolah negeri dari hasil cek terakhir anak aktif. */
export function HasilSekolahOrtu() {
  return <DenganHasil>{(data) => <Isi {...data} />}</DenganHasil>;
}

/** Baris jalur yang mewakili sekolah: jalur terbaik, atau jalur terbaik dalam jalur yang difilter. */
function barisUntuk(h: HasilSekolah, kodeJalur: string | null): HasilJalur | null {
  if (!kodeJalur) return h.jalur[0];
  return h.jalur.find((j) => jalurUtama(j.subJalurKode) === kodeJalur) ?? null;
}

function Isi({ aktif, terakhir, hasil }: DataTahap) {
  const [jalur, setJalur] = useState(SEMUA_JALUR);
  const [jenjang, setJenjang] = useState(SEMUA_JENJANG);
  const [label, setLabel] = useState(SEMUA_LABEL);
  const pilihan = usePilihan(terakhir.token, hasil.hasil);
  const kodeJalur = JALUR_UTAMA.find(([, nama]) => nama === jalur)?.[0] ?? null;

  const daftar = useMemo(
    () =>
      hasil.hasil.flatMap((h) => {
        const j = barisUntuk(h, kodeJalur);
        if (!j) return [];
        if (jenjang !== SEMUA_JENJANG && h.sekolah.jenjang !== jenjang) return [];
        if (label !== SEMUA_LABEL && namaLabel(j.label) !== label) return [];
        return [{ h, j }];
      }),
    [hasil.hasil, kodeJalur, jenjang, label],
  );
  const titik = useMemo(
    () =>
      daftar.flatMap(({ h, j }) =>
        h.sekolah.lat !== null && h.sekolah.lng !== null
          ? [{ id: h.sekolah.id, nama: h.sekolah.nama, lat: h.sekolah.lat, lng: h.sekolah.lng, label: j.label }]
          : [],
      ),
    [daftar],
  );
  const jenjangAda = [...new Set(hasil.hasil.map((h) => h.sekolah.jenjang))];
  const nama = aktif.nama.split(" ")[0];

  function ubahFilter(e: ChangeEvent<HTMLDivElement>) {
    const t = e.target as unknown as HTMLSelectElement;
    if (t.id === "f-jalur") setJalur(t.value);
    if (t.id === "f-jenjang") setJenjang(t.value);
    if (t.id === "f-label") setLabel(t.value);
  }

  return (
    <>
      <PageHeader
        art="map"
        title="Hasil Sekolah"
        desc={`Peluang ${aktif.nama} di ${hasil.hasil.length} sekolah negeri, dari hasil cek yang tersimpan.`}
        actions={
          <Button variant="primary" sm href="/strategi" icon="arrow-right">
            Lihat Strategi
          </Button>
        }
      />
      <div className="stack">
        <div className="hasil-sekolah__sumber">
          <SumberHasil terakhir={terakhir} hasil={hasil} />
          <HapusHasil token={terakhir.token} nama={aktif.nama} dibuatPada={terakhir.dibuatPada} />
        </div>
        {catatanHasil(hasil, null).map((c) => (
          <Alert key={c} kind="info">
            {c}
          </Alert>
        ))}
        <Disclaimer />
      </div>

      <div className="split hasil-sekolah">
        <div className="split__map">
          <PetaHasil sekolah={titik} />
          <div className="hasil-sekolah__legenda">
            <MapLegend />
            <p className="text-caption text-secondary">Titik abu-abu: belum dihitung, karena data tahun lalu terlalu sedikit atau isiannya belum ada.</p>
            <p className="text-caption text-secondary">Titik rumah tidak disimpan, jadi tidak tampil di peta. Jarak dihitung saat cek.</p>
            <HelpLink opens="dlg-label">Apa arti label Peluang besar, Masih mungkin, dan Peluang kecil?</HelpLink>
          </div>
        </div>

        <div className="stack">
          <div className="block-head block-head--row">
            <h2 className="text-heading-md">{`${daftar.length} sekolah`}</h2>
            <span className="block-head__aside">
              Pilihan: {pilihan.pilihan.length} dari {MAKS_PILIHAN}
            </span>
          </div>

          <div onChange={ubahFilter}>
            <Toolbar>
              <Select id="f-jalur" label="Jalur" options={[SEMUA_JALUR, ...JALUR_UTAMA.map(([, n]) => n)]} selected={jalur} />
              {jenjangAda.length > 1 && <Select id="f-jenjang" label="Jenjang" options={[SEMUA_JENJANG, ...jenjangAda]} selected={jenjang} />}
              <Select id="f-label" label="Label peluang" options={[SEMUA_LABEL, ...LABEL.map(namaLabel)]} selected={label} />
            </Toolbar>
          </div>

          {daftar.length === 0 && <p className="text-secondary">Tidak ada sekolah yang cocok dengan filter ini.</p>}
          {daftar.map(({ h, j }) => {
            const dipilih = pilihan.ada(h.sekolah.id);
            return (
              <SchoolCard
                key={h.sekolah.id}
                name={h.sekolah.nama}
                type={`${h.sekolah.jenjang} · Negeri`}
                kec={h.sekolah.kecamatan}
                jalur={namaJalur(j)}
                kind={KIND[j.label]}
                badgeText={badgeText(j.label)}
                facts={faktaSekolah(h, j)}
                reason={j.kalimat}
              >
                <Button variant="primary" href={`/detail-sekolah/${h.sekolah.id}`}>
                  Lihat detail
                </Button>
                {dipilih ? (
                  <Button variant="secondary" iconLeft="check" onClick={() => pilihan.hapus(h.sekolah.id)}>
                    Di pilihan · Hapus
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    iconLeft="plus"
                    onClick={() => pilihan.tambah(h.sekolah.id)}
                    toast={
                      pilihan.penuh
                        ? { message: `Pilihan sudah ${MAKS_PILIHAN}. Hapus satu dulu di sini atau di Strategi.`, variant: "info" }
                        : { message: `${h.sekolah.nama} ditambahkan ke pilihan ${nama}.`, variant: "success" }
                    }
                  >
                    Tambah ke pilihan
                  </Button>
                )}
              </SchoolCard>
            );
          })}
        </div>
      </div>

      <NextStep
        step="Tahap 3 dari 4"
        title="Susun urutan pilihan sekolah"
        text={`Kami siapkan 3 pilihan untuk ${nama}: satu ambisius dan dua aman. Urutannya bisa diubah.`}
        href="/strategi"
        label="Lihat Strategi"
      />
      <DialogArtiLabel />
    </>
  );
}

/** Arti label, sama dengan yang dipakai mesin peluang. */
export function DialogArtiLabel() {
  return (
    <Dialog id="dlg-label" title="Arti label peluang">
      <ul className="arti-label">
        <li>
          <Badge kind="aman" />
          <span>Jarak atau skor anak sama atau lebih baik dari separuh siswa yang diterima tahun lalu. Cocok sebagai pilihan aman.</span>
        </li>
        <li>
          <Badge kind="bersaing" />
          <span>Masih di dalam rentang siswa yang diterima. Cocok untuk satu pilihan ambisius.</span>
        </li>
        <li>
          <Badge kind="berisiko" />
          <span>Di luar rentang siswa yang diterima. Sebaiknya bukan satu-satunya pilihan.</span>
        </li>
        <li>
          <Badge kind="info">Belum dihitung</Badge>
          <span>Data tahun lalu terlalu sedikit, atau isian untuk jalur ini belum ada.</span>
        </li>
      </ul>
    </Dialog>
  );
}
