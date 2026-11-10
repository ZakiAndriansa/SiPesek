"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import { Alert, Badge, Button, Dialog, HelpLink, Icon, MapLegend, Select } from "@/components";
import type { HasilJalur, HasilSekolah, LabelPeluang } from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";
import { angkaSkor, badgeText, catatanHasil, JALUR_UTAMA, jalurUtama, KIND, namaJalur, namaLabel } from "@/lib/quick-check";
import { MAKS_PILIHAN, usePilihan } from "./pilihan";
import { catatanPerkiraan, DenganHasil, JudulOrtu, KonteksCek, LanjutOrtu, type DataTahap } from "./Wadah";

const PetaHasil = dynamic(() => import("./PetaHasil"), {
  ssr: false,
  loading: () => <div className="quick__map quick__map--memuat">Memuat peta…</div>,
});

const SEMUA_JALUR = "Semua jalur";
const SEMUA_JENJANG = "SMA dan SMK";
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

/** Batas penerimaan tahun lalu untuk jalur ini: jarak terjauh (jalur jarak) atau skor terendah (jalur skor). */
function batas(j: HasilJalur): string {
  const p = j.pembanding;
  if (j.label === "TIDAK_DIHITUNG" || !p) return "Belum dihitung";
  if (j.satuan === "meter") return p.maks !== null ? `Terjauh ${formatJarak(p.maks)}` : "-";
  return p.min !== null ? `Skor terendah ${angkaSkor(p.min)}` : "-";
}

const PER_HALAMAN = 8;
const KELAS_ANGKA: Record<LabelPeluang, string> = {
  PELUANG_BESAR: "aman",
  MASIH_MUNGKIN: "bersaing",
  PELUANG_KECIL: "berisiko",
  TIDAK_DIHITUNG: "info",
};

/**
 * Hasil Sekolah (usulan B): ringkasan angka per label di atas sebagai filter, lalu Daftar atau Peta bergantian
 * (tidak berdampingan, jadi tidak ada kolom yang memanjang), dan daftar berupa tabel selebar halaman berhalaman.
 */
function Isi({ aktif, terakhir, hasil }: DataTahap) {
  const [jalur, setJalur] = useState(SEMUA_JALUR);
  const [jenjang, setJenjang] = useState(SEMUA_JENJANG);
  const [label, setLabel] = useState<LabelPeluang | null>(null);
  const [tampilan, setTampilan] = useState<"daftar" | "peta">("daftar");
  const [halaman, setHalaman] = useState(0);
  const pilihan = usePilihan(terakhir.token, hasil.hasil);
  const kodeJalur = JALUR_UTAMA.find(([, nama]) => nama === jalur)?.[0] ?? null;

  // Sekolah setelah filter jalur dan jenjang; angka per label dihitung dari sini, sebelum filter label.
  const dasar = useMemo(
    () =>
      hasil.hasil.flatMap((h) => {
        const j = barisUntuk(h, kodeJalur);
        if (!j) return [];
        if (jenjang !== SEMUA_JENJANG && h.sekolah.jenjang !== jenjang) return [];
        return [{ h, j }];
      }),
    [hasil.hasil, kodeJalur, jenjang],
  );
  const jumlah = (l: LabelPeluang) => dasar.filter(({ j }) => j.label === l).length;
  // Dimemo: identitas array ini dipakai peta (fitBounds) sebagai dependensi, jadi tidak boleh berubah tiap render.
  const daftar = useMemo(() => (label ? dasar.filter(({ j }) => j.label === label) : dasar), [dasar, label]);
  const totalHalaman = Math.max(1, Math.ceil(daftar.length / PER_HALAMAN));
  const hal = Math.min(halaman, totalHalaman - 1);
  const tampil = daftar.slice(hal * PER_HALAMAN, (hal + 1) * PER_HALAMAN);
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
  const skor = hasil.skorAnak?.find((s) => s.nilai !== null)?.nilai ?? null;
  const swasta = hasil.swasta.SMA.length + hasil.swasta.SMK.length;
  const adaAman = hasil.hasil.some((h) => h.jalur.some((j) => j.label === "PELUANG_BESAR"));

  function ubahFilter(e: ChangeEvent<HTMLDivElement>) {
    const t = e.target as unknown as HTMLSelectElement;
    if (t.id === "f-jalur") setJalur(t.value);
    if (t.id === "f-jenjang") setJenjang(t.value);
    setHalaman(0);
  }

  return (
    <>
      <JudulOrtu
        judul="Hasil Sekolah"
        konteks={<KonteksCek aktif={aktif} terakhir={terakhir} tambahan={skor !== null ? `skor rapor ${angkaSkor(skor)}` : undefined} />}
        aksi={
          <div className="ortu-seg" role="tablist" aria-label="Tampilan hasil">
            <button type="button" role="tab" aria-selected={tampilan === "daftar"} onClick={() => setTampilan("daftar")}>
              Daftar
            </button>
            <button type="button" role="tab" aria-selected={tampilan === "peta"} onClick={() => setTampilan("peta")}>
              Peta
            </button>
          </div>
        }
      />

      <div className="stack">
        <div className="ortu-angka" role="group" aria-label="Saring menurut label peluang">
          {LABEL.map((l) => {
            const n = jumlah(l);
            const aktifkah = label === l;
            return (
              <button
                key={l}
                type="button"
                className={`ortu-angka__tombol ortu-angka__tombol--${KELAS_ANGKA[l]}`}
                aria-pressed={aktifkah}
                disabled={n === 0 && !aktifkah}
                onClick={() => {
                  setLabel(aktifkah ? null : l);
                  setHalaman(0);
                }}
              >
                <b>{n}</b>
                <span>{namaLabel(l)}</span>
              </button>
            );
          })}
        </div>

        {!adaAman && swasta > 0 && (
          <p className="ortu-sorot">
            Belum ada sekolah yang aman. Siapkan cadangan swasta.{" "}
            <Link className="link" href="/cadangan">
              Lihat {swasta} swasta terdekat →
            </Link>
          </p>
        )}
        {catatanHasil(hasil, null).map((c) => (
          <Alert key={c} kind="info">
            {c}
          </Alert>
        ))}

        <div className="ortu-alat" onChange={ubahFilter}>
          <p className="ortu-meta" aria-live="polite">
            {label ? `${namaLabel(label)}: ${daftar.length} sekolah` : `${daftar.length} sekolah`}
            {" · "}Pilihan {pilihan.pilihan.length} dari {MAKS_PILIHAN}
          </p>
          <div className="ortu-aksi">
            <Select id="f-jalur" label="Jalur" options={[SEMUA_JALUR, ...JALUR_UTAMA.map(([, n]) => n)]} selected={jalur} />
            {jenjangAda.length > 1 && <Select id="f-jenjang" label="Jenjang" options={[SEMUA_JENJANG, ...jenjangAda]} selected={jenjang} />}
          </div>
        </div>

        {tampilan === "peta" ? (
          <div className="stack">
            <PetaHasil sekolah={titik} />
            <MapLegend />
            <p className="ortu-meta">Titik abu-abu belum dihitung. Titik rumah tidak disimpan, jadi tidak tampil di peta.</p>
          </div>
        ) : daftar.length === 0 ? (
          <p className="text-secondary">Tidak ada sekolah yang cocok dengan pilihan ini.</p>
        ) : (
          <section className="ortu-tabel" aria-label="Daftar sekolah">
            <div className="ortu-tabel__gulir">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Sekolah</th>
                    <th scope="col">Jarak</th>
                    <th scope="col">Batas {hasil.tahunAcuan}</th>
                    <th scope="col">Peluang</th>
                    <th scope="col">Pilihan</th>
                  </tr>
                </thead>
                <tbody>
                  {tampil.map(({ h, j }) => {
                    const dipilih = pilihan.ada(h.sekolah.id);
                    return (
                      <tr key={h.sekolah.id}>
                        <td>
                          <div className="ortu-tabel__nama">
                            <Link href={`/detail-sekolah/${h.sekolah.id}`}>{h.sekolah.nama}</Link>
                            <span>
                              {h.sekolah.kecamatan} · {namaJalur(j)}
                            </span>
                          </div>
                        </td>
                        <td>{h.jarakMeter !== null ? formatJarak(h.jarakMeter) : "-"}</td>
                        <td>{batas(j)}</td>
                        <td>
                          <Badge kind={KIND[j.label]}>{badgeText(j.label)}</Badge>
                        </td>
                        <td>
                          {dipilih ? (
                            <Button variant="secondary" sm iconLeft="check" onClick={() => pilihan.hapus(h.sekolah.id)} aria-label={`Hapus ${h.sekolah.nama} dari pilihan`}>
                              Dipilih
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              sm
                              iconLeft="plus"
                              onClick={() => pilihan.tambah(h.sekolah.id)}
                              aria-label={`Tambahkan ${h.sekolah.nama} ke pilihan`}
                              toast={
                                pilihan.penuh
                                  ? { message: `Pilihan sudah ${MAKS_PILIHAN}. Hapus satu dulu di sini atau di Strategi.`, variant: "info" }
                                  : { message: `${h.sekolah.nama} ditambahkan ke pilihan ${nama}.`, variant: "success" }
                              }
                            >
                              Pilih
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalHalaman > 1 && (
              <div className="ortu-tabel__kaki">
                <span>
                  {hal * PER_HALAMAN + 1} sampai {hal * PER_HALAMAN + tampil.length} dari {daftar.length} sekolah
                </span>
                <span className="ortu-aksi">
                  <button type="button" className="button button--secondary button--sm" disabled={hal === 0} onClick={() => setHalaman(hal - 1)}>
                    <Icon name="chevron-left" className="icon button__icon" />
                    Sebelumnya
                  </button>
                  <button type="button" className="button button--secondary button--sm" disabled={hal >= totalHalaman - 1} onClick={() => setHalaman(hal + 1)}>
                    Berikutnya
                    <Icon name="chevron-right" className="icon button__icon" />
                  </button>
                </span>
              </div>
            )}
          </section>
        )}
      </div>

      <LanjutOrtu
        catatan={
          <>
            {catatanPerkiraan(hasil.tahunAcuan)} <HelpLink opens="dlg-label">Arti label</HelpLink>
          </>
        }
        href="/strategi"
        label="Lanjut ke Strategi"
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
