"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Alert, Badge, Button, Dialog, HelpLink, Icon, MapLegend, Select } from "@/components";
import { LaporanCetak } from "@/features/cek-cepat/LaporanCetak";
import { MAKS_PILIHAN, usePilihan } from "@/features/ortu/pilihan";
import type { HasilJalur, HasilSekolah, LabelPeluang, ResponsPeluang, SkorAnak } from "@/lib/kontrak";
import { openDialog } from "@/lib/dialog";
import { formatJarak } from "@/lib/peluang/jarak";
import {
  angkaSkor,
  badgeText,
  catatanHasil,
  faktaSekolah,
  jalurLain,
  JALUR_UTAMA,
  jalurUtama,
  judulSkor,
  KIND,
  namaJalur,
  namaLabel,
  posisiSkor,
  ringkasJalur,
  type JalurPilihan,
  type QuickCheckInput,
} from "@/lib/quick-check";
import { catatanPerkiraan, JudulOrtu, LanjutOrtu } from "./Judul";

const PetaHasil = dynamic(() => import("@/features/ortu/PetaHasil"), {
  ssr: false,
  loading: () => <div className="quick__map quick__map--memuat">Memuat peta…</div>,
});

/**
 * pilih: hasil terbaru akun Google (tombol Pilih, nama sekolah ke halaman detail, cadangan di halaman Cadangan).
 * saran: Cek Cepat tamu (kolom Saran berisi 3 rekomendasi, rincian sekolah di dialog, swasta di halaman ini).
 * lama: hasil lama dari riwayat (tanpa kolom pilihan, rincian di dialog, swasta di halaman ini).
 */
export type ModeHasil = "pilih" | "saran" | "lama";

const SEMUA_JALUR = "Semua jalur";
const SEMUA_JENJANG = "SMA dan SMK";
const LABEL: LabelPeluang[] = ["PELUANG_BESAR", "MASIH_MUNGKIN", "PELUANG_KECIL", "TIDAK_DIHITUNG"];
const PER_HALAMAN = 8;
const KELAS_ANGKA: Record<LabelPeluang, string> = {
  PELUANG_BESAR: "aman",
  MASIH_MUNGKIN: "bersaing",
  PELUANG_KECIL: "berisiko",
  TIDAK_DIHITUNG: "info",
};
const ID_BACA = "dlg-baca-hasil";
const ID_RINCI = "dlg-rinci-sekolah";
const ID_SWASTA = "hasil-swasta";

/** ["a", "b", "c"] menjadi "a, b dan c". */
const gabung = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} dan ${xs[xs.length - 1]}`);

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

/** Skor akhir yang sudah dihitung, untuk baris konteks di bawah judul. */
export const skorUtama = (r: ResponsPeluang) => r.skorAnak?.find((s) => s.nilai !== null)?.nilai ?? null;

type Props = {
  hasil: ResponsPeluang;
  mode: ModeHasil;
  judul: string;
  konteks: ReactNode;
  /** Nama depan anak untuk pesan toast tombol Pilih. */
  namaAnak?: string;
  /** Di atas judul: pesan tersimpan, breadcrumb, atau penanda hasil lama. */
  atas?: ReactNode;
  /** Tombol tambahan di kanan judul, setelah Daftar, Peta, dan Cetak. */
  aksiKepala?: ReactNode;
  /** Di atas tabel, sesudah pita cadangan (misal pemberitahuan hasil satu jalur). */
  sebelumTabel?: ReactNode;
  /** Di bawah tabel dan lipatan (misal ajakan masuk dan tombol Cek Cepat). */
  bawah?: ReactNode;
  /** Isian Cek Cepat: untuk catatan hasil dan laporan cetak. null bila tidak ada di tab ini. */
  input?: QuickCheckInput | null;
  jalurDipilih?: JalurPilihan | null;
  /** Tanggal di laporan cetak. */
  tanggalCetak: string;
  /** Tautan penutup, misal Lanjut ke Strategi. Tanpa ini, penutup hanya berisi catatan. */
  lanjut?: { href: string; label: string };
};

/**
 * Satu tampilan hasil untuk semua tempat: Hasil Sekolah, Cek Cepat, dan hasil lama dari riwayat. Urutannya sama:
 * judul dan konteks, angka per label sebagai filter, pita cadangan, tabel atau peta, lalu catatan.
 * Bedanya hanya di kolom terakhir tabel, cara membuka rincian sekolah, dan letak daftar swasta (lihat ModeHasil).
 */
export function TampilanHasil({
  hasil,
  mode,
  judul,
  konteks,
  namaAnak,
  atas,
  aksiKepala,
  sebelumTabel,
  bawah,
  input = null,
  jalurDipilih = null,
  tanggalCetak,
  lanjut,
}: Props) {
  const [jalur, setJalur] = useState(SEMUA_JALUR);
  const [jenjang, setJenjang] = useState(SEMUA_JENJANG);
  const [label, setLabel] = useState<LabelPeluang | null>(null);
  const [tampilan, setTampilan] = useState<"daftar" | "peta">("daftar");
  const [halaman, setHalaman] = useState(0);
  const [rinci, setRinci] = useState<HasilSekolah | null>(null);
  // Mode pilih: susunan orang tua per hasil. Mode lain: tanpa kunci, jadi isinya rekomendasi strategi().
  const pilihan = usePilihan(mode === "pilih" ? hasil.token : null, hasil.hasil);
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
  const swasta = [...hasil.swasta.SMA, ...hasil.swasta.SMK].sort((a, b) => (a.jarakMeter ?? Infinity) - (b.jarakMeter ?? Infinity));
  const adaAman = hasil.hasil.some((h) => h.jalur.some((j) => j.label === "PELUANG_BESAR"));
  const urutSaran = new Map(pilihan.pilihan.map((p, i) => [p.sekolahId, i + 1]));
  const kolomAkhir = mode === "pilih" ? "Pilihan" : mode === "saran" ? "Saran" : null;

  function ubahFilter(e: ChangeEvent<HTMLDivElement>) {
    const t = e.target as unknown as HTMLSelectElement;
    if (t.id === "f-jalur") setJalur(t.value);
    if (t.id === "f-jenjang") setJenjang(t.value);
    setHalaman(0);
  }

  // Akun Google punya halaman Sekolah Cadangan; tamu dan hasil lama membuka daftar swasta di halaman ini.
  const tautanSwasta = (teks: string, kelas: string) =>
    mode === "pilih" ? (
      <Link className={kelas} href="/cadangan">
        {teks}
      </Link>
    ) : (
      <a
        className={kelas}
        href={`#${ID_SWASTA}`}
        onClick={() => {
          const lipat = document.getElementById(ID_SWASTA);
          if (lipat instanceof HTMLDetailsElement) lipat.open = true;
        }}
      >
        {teks}
      </a>
    );

  return (
    <>
      <div className="no-print">
        {atas}
        <JudulOrtu
          judul={judul}
          konteks={konteks}
          aksi={
            <div className="ortu-aksi">
              <div className="ortu-seg" role="tablist" aria-label="Tampilan hasil">
                <button type="button" role="tab" aria-selected={tampilan === "daftar"} onClick={() => setTampilan("daftar")}>
                  Daftar
                </button>
                <button type="button" role="tab" aria-selected={tampilan === "peta"} onClick={() => setTampilan("peta")}>
                  Peta
                </button>
              </div>
              <Button variant="ghost" print iconLeft="download">
                Cetak
              </Button>
              {aksiKepala}
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

          {/* Cadangan selalu ada; penekanannya saja yang berbeda. Belum ada sekolah aman: pita peringatan di sini. */}
          {!adaAman && swasta.length > 0 && (
            <p className="ortu-sorot">
              <span>Belum ada sekolah yang aman. Siapkan cadangan swasta.</span>
              {tautanSwasta(`Lihat ${swasta.length} swasta terdekat →`, "link ortu-sorot__tautan")}
            </p>
          )}
          {sebelumTabel}
          {catatanHasil(hasil, input, jalurDipilih).map((c) => (
            <Alert key={c} kind="info">
              {c}
            </Alert>
          ))}

          <div className="ortu-alat" onChange={ubahFilter}>
            <p className="ortu-meta" aria-live="polite">
              {label ? `${namaLabel(label)}: ${daftar.length} sekolah` : `${daftar.length} sekolah`}
              {mode === "pilih" && ` · Pilihan ${pilihan.pilihan.length} dari ${MAKS_PILIHAN}`}
            </p>
            <div className="ortu-aksi">
              <Select id="f-jalur" label="Jalur" labelTersembunyi options={[SEMUA_JALUR, ...JALUR_UTAMA.map(([, n]) => n)]} selected={jalur} />
              {jenjangAda.length > 1 && (
                <Select id="f-jenjang" label="Jenjang" labelTersembunyi options={[SEMUA_JENJANG, ...jenjangAda]} selected={jenjang} />
              )}
            </div>
          </div>

          {tampilan === "peta" ? (
            <div className="stack">
              <PetaHasil sekolah={titik} />
              <MapLegend />
              <p className="ortu-meta">Titik abu-abu belum dihitung. Titik rumah tidak disimpan, jadi tidak tampil di peta.</p>
            </div>
          ) : daftar.length === 0 ? (
            <p className="text-secondary">
              {hasil.hasil.length === 0
                ? "Belum ada sekolah negeri yang bisa dihitung untuk isian ini."
                : "Tidak ada sekolah yang cocok dengan pilihan ini."}
            </p>
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
                      {kolomAkhir && <th scope="col">{kolomAkhir}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tampil.map(({ h, j }) => (
                      <tr key={h.sekolah.id}>
                        <td>
                          <div className="ortu-tabel__nama">
                            {mode === "pilih" ? (
                              <Link href={`/detail-sekolah/${h.sekolah.id}`}>{h.sekolah.nama}</Link>
                            ) : (
                              <button
                                type="button"
                                className="ortu-tabel__rinci"
                                aria-haspopup="dialog"
                                onClick={(e) => {
                                  setRinci(h);
                                  openDialog(ID_RINCI, e.currentTarget);
                                }}
                              >
                                {h.sekolah.nama}
                              </button>
                            )}
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
                        {mode === "pilih" && (
                          <td>
                            {pilihan.ada(h.sekolah.id) ? (
                              <Button
                                variant="secondary"
                                sm
                                iconLeft="check"
                                onClick={() => pilihan.hapus(h.sekolah.id)}
                                aria-label={`Hapus ${h.sekolah.nama} dari pilihan`}
                              >
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
                                    : { message: `${h.sekolah.nama} ditambahkan ke pilihan${namaAnak ? ` ${namaAnak}` : ""}.`, variant: "success" }
                                }
                              >
                                Pilih
                              </Button>
                            )}
                          </td>
                        )}
                        {mode === "saran" && <td>{urutSaran.has(h.sekolah.id) && <SaranChip no={urutSaran.get(h.sekolah.id)!} label={h.labelTerbaik} />}</td>}
                      </tr>
                    ))}
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
                    <button
                      type="button"
                      className="button button--secondary button--sm"
                      disabled={hal >= totalHalaman - 1}
                      onClick={() => setHalaman(hal + 1)}
                    >
                      Berikutnya
                      <Icon name="chevron-right" className="icon button__icon" />
                    </button>
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Sudah ada sekolah aman: cadangan tetap ditawarkan, sebagai satu baris tenang. */}
          {adaAman && swasta.length > 0 && (
            <p className="ortu-cadangan">
              Mau punya cadangan? {tautanSwasta(`Lihat ${swasta.length} swasta terdekat →`, "link")}
            </p>
          )}

          <div className="card hasil-panel hasil-daftar">
            {mode !== "pilih" && swasta.length > 0 && (
              <Lipat id={ID_SWASTA} judul={`Sekolah swasta terdekat (${swasta.length})`}>
                <ul className="hasil-lipat__daftar">
                  {swasta.map((s) => (
                    <li key={s.sekolah.id}>
                      <strong>{s.sekolah.nama}</strong>
                      <span>
                        {s.sekolah.jenjang} · {s.sekolah.kecamatan}
                        {s.jarakMeter !== null && ` · ${formatJarak(s.jarakMeter)}`} · Biaya: {s.biaya?.ringkas ?? "tanyakan ke sekolah"}
                      </span>
                    </li>
                  ))}
                </ul>
              </Lipat>
            )}
            <Lipat judul={jalurDipilih ? `Ringkasan ${JALUR_UTAMA.find(([k]) => k === jalurDipilih)?.[1] ?? jalurDipilih}` : "Ringkasan per jalur"}>
              <ul className="hasil-lipat__daftar">
                {ringkasJalur(hasil.hasil, input)
                  .filter((j) => !jalurDipilih || j.kode === jalurDipilih)
                  .map((j) => (
                    <li key={j.kode}>
                      <strong>{j.nama}</strong>
                      <span>{j.teks}</span>
                    </li>
                  ))}
              </ul>
            </Lipat>
          </div>
        </div>

        {bawah}

        {lanjut ? (
          <LanjutOrtu
            catatan={
              <>
                {catatanPerkiraan(hasil.tahunAcuan)} <HelpLink opens={ID_BACA}>Cara membaca</HelpLink>
              </>
            }
            href={lanjut.href}
            label={lanjut.label}
          />
        ) : (
          <div className="ortu-lanjut">
            <p className="ortu-lanjut__catatan">
              {catatanPerkiraan(hasil.tahunAcuan)} <HelpLink opens={ID_BACA}>Cara membaca</HelpLink>
            </p>
          </div>
        )}
      </div>

      <DialogBaca hasil={hasil} />
      <Dialog id={ID_RINCI} title={rinci?.sekolah.nama ?? "Rincian sekolah"}>
        {rinci && <RinciSekolah h={rinci} />}
      </Dialog>
      <LaporanCetak result={hasil} input={input} date={tanggalCetak} />
    </>
  );
}

/** Rekomendasi untuk tamu: urutan pilihan dan perannya (ambisius atau aman). */
function SaranChip({ no, label }: { no: number; label: LabelPeluang }) {
  const peran = label === "PELUANG_BESAR" ? "aman" : label === "MASIH_MUNGKIN" ? "ambisius" : "cadangan";
  return <span className="ortu-saran-chip">{`Pilihan ${no} · ${peran}`}</span>;
}

/** Rincian satu sekolah (tamu dan hasil lama): jalur terbaik, fakta, alasan, dan jalur lain. */
function RinciSekolah({ h }: { h: HasilSekolah }) {
  const lain = jalurLain(h);
  const fakta = faktaSekolah(h);
  return (
    <div className="hasil-rinci">
      <p className="ortu-meta">
        {[`${h.sekolah.jenjang} Negeri`, h.sekolah.kecamatan, h.jarakMeter !== null ? formatJarak(h.jarakMeter) : null].filter(Boolean).join(" · ")}
      </p>
      <p>
        <Badge kind={KIND[h.labelTerbaik]}>{badgeText(h.labelTerbaik)}</Badge> {namaJalur(h.jalur[0])}
      </p>
      {fakta.length > 0 && (
        <dl className="school-card__facts">
          {fakta.map(([l, v]) => (
            <div key={l}>
              <dt className="school-card__fact-label">{l}</dt>
              <dd className="school-card__fact-value">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p>{h.jalur[0].kalimat}</p>
      {lain.length > 0 && <p className="text-secondary">Jalur lain: {lain.join("; ")}.</p>}
    </div>
  );
}

function Lipat({ id, judul, children }: { id?: string; judul: string; children: ReactNode }) {
  return (
    <details className="hasil-baris hasil-lipat" id={id}>
      <summary className="hasil-baris__ringkas">
        <strong>{judul}</strong>
        <Icon name="chevron-down" className="icon icon--sm hasil-baris__panah" />
      </summary>
      <div className="hasil-baris__isi">{children}</div>
    </details>
  );
}

/** Semua penjelasan dalam satu dialog: skor akhir (bila ada), rentang yang diterima, dan arti label. */
function DialogBaca({ hasil }: { hasil: ResponsPeluang }) {
  const skor: SkorAnak[] = hasil.skorAnak ?? [];
  const utama = skor.find((s) => s.nilai !== null) ?? skor[0];
  const posisi = utama ? posisiSkor(utama, hasil.hasil) : null;
  const lain = skor.filter((s) => s !== utama);
  const tahun = hasil.tahunAcuan;
  return (
    <Dialog id={ID_BACA} title="Cara membaca hasil">
      <div className="hasil-baca">
        {utama && utama.nilai !== null && (
          <section>
            <h3>Skor akhir</h3>
            <p>
              {judulSkor(utama)}: {angkaSkor(utama.nilai)} dari {angkaSkor(utama.maks)} ({utama.rumus}).
              {utama.rincian.length > 1 && ` Rinciannya ${utama.rincian.map((b) => `${b.label} ${angkaSkor(b.nilai)}`).join(" dan ")}.`}
            </p>
            {utama.terendahDiterima && (
              <p>
                Skor terendah yang diterima tahun {tahun} di {utama.jenjang} negeri Depok berkisar {angkaSkor(utama.terendahDiterima.dari)} sampai{" "}
                {angkaSkor(utama.terendahDiterima.sampai)}, tergantung sekolahnya
                {posisi && `. Skor anak sudah mencapai batas itu di ${posisi.atas} dari ${posisi.total} sekolah`}.
              </p>
            )}
          </section>
        )}
        {utama && utama.nilai === null && (
          <section>
            <h3>Skor akhir</h3>
            <p>Skor akhir belum dihitung: isi {gabung(utama.kurang)}.</p>
          </section>
        )}
        {lain.length > 0 && (
          <section>
            <h3>Skor lain</h3>
            <ul>
              {lain.map((s) => (
                <li key={`${s.jenjang}-${s.subJalurKode}-${s.kelompok}`}>
                  {judulSkor(s)}:{" "}
                  {s.nilai === null
                    ? `belum dihitung, isi ${gabung(s.kurang)}.`
                    : `${angkaSkor(s.nilai)} dari ${angkaSkor(s.maks)}${
                        s.terendahDiterima
                          ? `; skor terendah yang diterima ${angkaSkor(s.terendahDiterima.dari)} sampai ${angkaSkor(s.terendahDiterima.sampai)}`
                          : ""
                      }.`}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section>
          <h3>Arti label</h3>
          <ul>
            <li>
              <strong>Peluang besar:</strong> jarak atau skor anak sama atau lebih baik dari separuh siswa yang diterima. Cocok sebagai pilihan aman.
            </li>
            <li>
              <strong>Masih mungkin:</strong> masih di dalam rentang siswa yang diterima. Cocok untuk satu pilihan ambisius.
            </li>
            <li>
              <strong>Peluang kecil:</strong> di luar rentang itu. Sebaiknya bukan satu-satunya pilihan.
            </li>
            <li>
              <strong>Belum dihitung:</strong> data tahun lalu terlalu sedikit, atau isian untuk jalur ini belum ada.
            </li>
          </ul>
          <p>
            Skor hanya dipakai di Jalur Prestasi; Jalur Domisili memakai jarak garis lurus dari titik rumah.{" "}
            <Link href="/panduan#cara-hitung">Selengkapnya di Panduan</Link>.
          </p>
        </section>
      </div>
    </Dialog>
  );
}
