"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Alert, Badge, Button, ButtonGroup, CtaBand, Dialog, HelpLink, Icon } from "@/components";
import type { HasilSekolah, ResponsPeluang, SkorAnak } from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";
import {
  angkaSkor,
  badgeText,
  catatanHasil,
  faktaSekolah,
  jalurLain,
  judulSkor,
  KIND,
  namaJalur,
  namaLabel,
  posisiSkor,
  ringkasan,
  ringkasJalur,
  strategi,
  type PilihanStrategi,
  type QuickCheckInput,
} from "@/lib/quick-check";

/** ["a", "b", "c"] menjadi "a, b dan c". */
const gabung = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} dan ${xs[xs.length - 1]}`);

/** Jumlah sekolah yang langsung tampil; sisanya di balik tombol agar halaman tidak penuh. */
const TAMPIL_AWAL = 5;

/**
 * Hasil Cek Cepat, disusun "ringkasan dulu": satu kalimat jawaban, 3 rekomendasi, lalu daftar sekolah
 * berupa baris ringkas yang rinciannya baru muncul saat diketuk. Swasta dan penjelasan dilipat.
 */
export function HasilCepat({
  result,
  input,
  loggedIn,
  canSave,
  onSave,
  onEdit,
  onRestart,
  date,
}: {
  result: ResponsPeluang;
  input: QuickCheckInput;
  loggedIn: boolean;
  canSave: boolean;
  onSave: () => void;
  onEdit: () => void;
  onRestart: () => void;
  date: string;
}) {
  const [semua, setSemua] = useState(false);
  const pilihan = strategi(result.hasil);
  const sekolah = semua ? result.hasil : result.hasil.slice(0, TAMPIL_AWAL);
  const sisa = result.hasil.length - TAMPIL_AWAL;
  const swasta = [...result.swasta.SMA, ...result.swasta.SMK].sort((a, b) => (a.jarakMeter ?? Infinity) - (b.jarakMeter ?? Infinity));

  // Saat dicetak, semua rincian dibuka agar kertasnya lengkap.
  useEffect(() => {
    const buka = () => {
      setSemua(true);
      document.querySelectorAll<HTMLDetailsElement>(".quick__result details").forEach((d) => (d.open = true));
    };
    window.addEventListener("beforeprint", buka);
    return () => window.removeEventListener("beforeprint", buka);
  }, []);

  return (
    <div className="stack quick__result">
      <p className="print-only quick__print-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo-lofi.svg" alt="" width={32} height={32} />
        SiPesek · Cek Cepat · {date}. {result.catatan}
      </p>

      <KartuHasil result={result} onEdit={onEdit} />

      {catatanHasil(result, input).map((note) => (
        <Alert key={note} kind="info">
          {note}
        </Alert>
      ))}

      {pilihan.length > 0 && (
        <section className="stack" aria-labelledby="q-strategi">
          <div>
            <h2 className="text-heading-md" id="q-strategi">Rekomendasi 3 pilihan</h2>
            <p className="text-secondary">Satu ambisius, dua aman.</p>
          </div>
          <ol className="hasil-pilihan">
            {pilihan.map((p, i) => (
              <KartuPilihan key={p.name} p={p} no={i + 1} />
            ))}
          </ol>
        </section>
      )}

      <section className="stack" aria-labelledby="q-sekolah">
        <div>
          <h2 className="text-heading-md" id="q-sekolah">Semua sekolah negeri ({result.hasil.length})</h2>
          <p className="text-secondary">Ketuk sekolah untuk melihat alasannya.</p>
        </div>
        {result.hasil.length === 0 ? (
          <p className="text-secondary">Belum ada sekolah negeri yang bisa dihitung untuk isian ini.</p>
        ) : (
          <div className="hasil-daftar">
            {sekolah.map((h) => (
              <BarisSekolah key={h.sekolah.id} h={h} />
            ))}
          </div>
        )}
        {!semua && sisa > 0 && (
          <Button variant="secondary" block onClick={() => setSemua(true)}>
            Tampilkan {sisa} sekolah lainnya
          </Button>
        )}
      </section>

      <div className="hasil-daftar">
        {swasta.length > 0 && (
          <Lipat judul={`Sekolah swasta terdekat (${swasta.length})`}>
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
        <Lipat judul="Ringkasan per jalur">
          <ul className="hasil-lipat__daftar">
            {ringkasJalur(result.hasil, input).map((j) => (
              <li key={j.kode}>
                <strong>{j.nama}</strong>
                <span>{j.teks}</span>
              </li>
            ))}
          </ul>
        </Lipat>
      </div>

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

/**
 * Kartu jawaban dengan gauge setengah lingkaran: skor akhir anak di tengah busur dengan labelnya tepat di bawah
 * angka, lalu peluang di sekolah negeri. Rincian skor dan arti label ada di dialog "Cara membaca".
 */
function KartuHasil({ result, onEdit }: { result: ResponsPeluang; onEdit: () => void }) {
  const skor = result.skorAnak ?? [];
  const utama = skor.find((s) => s.nilai !== null) ?? skor[0];
  const r = ringkasan(result.hasil);
  return (
    <section className="card hasil-ringkas" aria-labelledby="q-hasil">
      <div className="hasil-ringkas__kepala">
        <h2 className="hasil-ringkas__bagian" id="q-hasil">Hasil anak</h2>
        <HelpLink opens="dlg-baca-hasil">Cara membaca</HelpLink>
      </div>

      {utama &&
        (utama.nilai === null ? (
          <p className="hasil-skor__kosong">
            Skor akhir belum dihitung: isi {gabung(utama.kurang)}.{" "}
            <button type="button" className="link" onClick={onEdit}>
              Lengkapi nilai
            </button>
          </p>
        ) : (
          <Gauge nilai={utama.nilai} maks={utama.maks} />
        ))}

      <div className={utama ? "hasil-ringkas__peluang hasil-ringkas__pemisah" : "hasil-ringkas__peluang"}>
        <p className="hasil-ringkas__judul">
          {r.sorotan ? (
            <>
              <strong className={`hasil-ringkas__label hasil-ringkas__label--${KIND[r.sorotan.label]}`}>{namaLabel(r.sorotan.label)}</strong> di{" "}
              {r.sorotan.n} dari {r.sorotan.total} sekolah negeri
            </>
          ) : (
            "Peluang di sekolah negeri masih kecil. Siapkan sekolah swasta terdekat sebagai cadangan."
          )}
        </p>
        {r.jumlah.length > 0 && (
          <ul className="hasil-ringkas__jumlah" aria-label="Jumlah sekolah per label">
            {r.jumlah.map((j) => (
              <li key={j.label}>
                <Badge kind={KIND[j.label]}>{`${namaLabel(j.label)} ${j.n}`}</Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="hasil-ringkas__catatan">Perkiraan dari SPMB {result.tahunAcuan}, bukan jaminan. Hasil tidak disimpan.</p>
      </div>

      <DialogBaca skor={skor} utama={utama} hasil={result.hasil} tahun={result.tahunAcuan} />
    </section>
  );
}

/** Busur setengah lingkaran dari 0 sampai skor maksimal; angka dan labelnya di tengah busur. */
function Gauge({ nilai, maks }: { nilai: number; maks: number }) {
  const panjang = Math.PI * 130;
  const isi = Math.min(1, Math.max(0, nilai / maks)) * panjang;
  return (
    <div className="hasil-gauge" role="img" aria-label={`Skor akhir anak ${angkaSkor(nilai)} dari ${angkaSkor(maks)}`}>
      <svg viewBox="0 0 300 160" aria-hidden="true">
        <path className="hasil-gauge__jalur" d="M20 150 A130 130 0 0 1 280 150" />
        <path className="hasil-gauge__isi" d="M20 150 A130 130 0 0 1 280 150" strokeDasharray={`${isi} ${panjang}`} />
      </svg>
      <div className="hasil-gauge__tengah" aria-hidden="true">
        <p className="hasil-gauge__angka">
          <strong>{angkaSkor(nilai)}</strong>
          <span>/ {angkaSkor(maks)}</span>
        </p>
        <p className="hasil-gauge__label">Skor akhir anak</p>
      </div>
      <div className="hasil-gauge__ujung" aria-hidden="true">
        <span>0</span>
        <span>{angkaSkor(maks)}</span>
      </div>
    </div>
  );
}

/** Semua penjelasan dalam satu dialog: rincian dan rumus skor, rentang yang diterima, dan arti label. */
function DialogBaca({ skor, utama, hasil, tahun }: { skor: SkorAnak[]; utama?: SkorAnak; hasil: HasilSekolah[]; tahun: number }) {
  const posisi = utama ? posisiSkor(utama, hasil) : null;
  const lain = skor.filter((s) => s !== utama);
  return (
    <Dialog id="dlg-baca-hasil" title="Cara membaca hasil">
      <div className="hasil-baca">
        {utama && utama.nilai !== null && (
          <section>
            <h3>Skor akhir</h3>
            <p>
              {judulSkor(utama)}: {utama.rumus}, paling tinggi {angkaSkor(utama.maks)}.
              {utama.rincian.length > 1 && ` Rinciannya ${utama.rincian.map((b) => `${b.label} ${angkaSkor(b.nilai)}`).join(" dan ")}.`}
            </p>
            {utama.terendahDiterima && (
              <p>
                Skor terendah yang diterima tahun {tahun} di {utama.jenjang} negeri Depok berkisar{" "}
                {angkaSkor(utama.terendahDiterima.dari)} sampai {angkaSkor(utama.terendahDiterima.sampai)}, tergantung sekolahnya{posisi && `. Skor anak sudah mencapai batas itu di ${posisi.atas} dari ${posisi.total} sekolah`}.
              </p>
            )}
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

/** Satu kartu rekomendasi: nomor, peran, sekolah, jalur, label, dan jarak. Ditata tiga kolom di layar lebar. */
function KartuPilihan({ p, no }: { p: PilihanStrategi; no: number }) {
  return (
    <li className="hasil-pilihan__kartu">
      <div className="hasil-pilihan__atas">
        <span className="rank__num" aria-hidden="true">
          {no}
        </span>
        <span className="hasil-pilihan__peran">{p.role}</span>
      </div>
      <p className="hasil-pilihan__nama">{p.name}</p>
      <p className="hasil-pilihan__jalur">{p.jalur}</p>
      <div className="hasil-pilihan__bawah">
        <Badge kind={p.kind} />
        {p.jarakMeter !== null && <span>{formatJarak(p.jarakMeter)}</span>}
      </div>
    </li>
  );
}

/** Satu sekolah sebagai baris ringkas; fakta dan alasan muncul saat dibuka. */
function BarisSekolah({ h }: { h: HasilSekolah }) {
  const lain = jalurLain(h);
  const meta = [`${h.sekolah.jenjang} Negeri`, h.sekolah.kecamatan, h.jarakMeter !== null ? formatJarak(h.jarakMeter) : null].filter(Boolean).join(" · ");
  return (
    <details className="hasil-baris">
      <summary className="hasil-baris__ringkas">
        <span className="hasil-baris__nama">
          <strong>{h.sekolah.nama}</strong>
          <span>{meta}</span>
        </span>
        <Badge kind={KIND[h.labelTerbaik]}>{badgeText(h.labelTerbaik)}</Badge>
        <Icon name="chevron-down" className="icon icon--sm hasil-baris__panah" />
      </summary>
      <div className="hasil-baris__isi">
        <p className="hasil-baris__jalur">{namaJalur(h.jalur[0])}</p>
        {faktaSekolah(h).length > 0 && (
          <dl className="school-card__facts">
            {faktaSekolah(h).map(([label, value]) => (
              <div key={label}>
                <dt className="school-card__fact-label">{label}</dt>
                <dd className="school-card__fact-value">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p>{h.jalur[0].kalimat}</p>
        {lain.length > 0 && <p className="text-secondary">Jalur lain: {lain.join("; ")}.</p>}
      </div>
    </details>
  );
}

function Lipat({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <details className="hasil-baris hasil-lipat">
      <summary className="hasil-baris__ringkas">
        <strong>{judul}</strong>
        <Icon name="chevron-down" className="icon icon--sm hasil-baris__panah" />
      </summary>
      <div className="hasil-baris__isi">{children}</div>
    </details>
  );
}
