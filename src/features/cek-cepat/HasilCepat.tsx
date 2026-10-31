"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Alert, Badge, Button, ButtonGroup, CtaBand, Icon, RankList } from "@/components";
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
  const r = ringkasan(result.hasil);
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

      {result.skorAnak && result.skorAnak.length > 0 && (
        <SkorAkhir skor={result.skorAnak} hasil={result.hasil} tahun={result.tahunAcuan} onEdit={onEdit} />
      )}

      <section className="card hasil-ringkas" aria-labelledby="q-ringkas">
        <p className="hasil-skor__langkah">Peluang di sekolah negeri</p>
        <h2 className="hasil-ringkas__judul" id="q-ringkas">{r.judul}</h2>
        {r.jumlah.length > 0 && (
          <ul className="hasil-ringkas__jumlah" aria-label="Jumlah sekolah per label">
            {r.jumlah.map((j) => (
              <li key={j.label}>
                <Badge kind={KIND[j.label]}>{`${namaLabel(j.label)}: ${j.n}`}</Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="hasil-ringkas__catatan">
          Perkiraan dari hasil SPMB {result.tahunAcuan}, bukan jaminan diterima. Hasil tidak disimpan; cetak bila ingin menyimpannya.
        </p>
      </section>

      {catatanHasil(result, input).map((note) => (
        <Alert key={note} kind="info">
          {note}
        </Alert>
      ))}

      {pilihan.length > 0 && (
        <section className="stack" aria-labelledby="q-strategi">
          <div>
            <h2 className="text-heading-md" id="q-strategi">Rekomendasi 3 pilihan</h2>
            <p className="text-secondary">Satu pilihan ambisius dan dua pilihan aman. Urutannya bisa digeser.</p>
          </div>
          <RankList items={pilihan} />
        </section>
      )}

      <section className="stack" aria-labelledby="q-sekolah">
        <div>
          <h2 className="text-heading-md" id="q-sekolah">Semua sekolah negeri ({result.hasil.length})</h2>
          <p className="text-secondary">Ketuk nama sekolah untuk melihat alasannya.</p>
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
        <Lipat judul="Cara membaca hasil ini">
          <ul className="hasil-lipat__daftar">
            <li>
              <strong>Peluang besar</strong>
              <span>Jarak atau nilai anak sama atau lebih baik dari separuh siswa yang diterima tahun {result.tahunAcuan}. Cocok sebagai pilihan aman.</span>
            </li>
            <li>
              <strong>Masih mungkin</strong>
              <span>Masih di dalam rentang siswa yang diterima, tapi di bawah separuhnya. Cocok untuk satu pilihan ambisius.</span>
            </li>
            <li>
              <strong>Peluang kecil</strong>
              <span>Di luar rentang siswa yang diterima. Sebaiknya bukan satu-satunya pilihan.</span>
            </li>
          </ul>
          <p>
            Jarak dihitung garis lurus dari titik rumah. Keputusan akhir ada pada panitia SPMB.{" "}
            <Link href="/panduan#cara-hitung">Baca cara SiPesek menghitung peluang</Link>.
          </p>
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
 * Skor akhir anak ditampilkan sebelum peluang: angka, bagian penyusunnya, posisinya terhadap skor terendah
 * yang diterima, dan cara membacanya. Skor lain (mis. Kelas Industri SMK) tampil sebagai baris ringkas.
 */
function SkorAkhir({ skor, hasil, tahun, onEdit }: { skor: SkorAnak[]; hasil: HasilSekolah[]; tahun: number; onEdit: () => void }) {
  const utama = skor.find((s) => s.nilai !== null) ?? skor[0];
  const lain = skor.filter((s) => s !== utama);
  const posisi = posisiSkor(utama, hasil);
  return (
    <section className="card hasil-skor" aria-labelledby="q-skor">
      <p className="hasil-skor__langkah">Skor akhir anak</p>
      <h2 className="hasil-skor__jalur" id="q-skor">{judulSkor(utama)}</h2>

      {utama.nilai === null ? (
        <>
          <p className="hasil-skor__kosong">
            Skor belum bisa dihitung karena {gabung(utama.kurang)} belum diisi. Peluang di bawah dihitung dari jarak rumah dan kondisi keluarga.
          </p>
          <div>
            <Button variant="secondary" sm onClick={onEdit}>
              Lengkapi nilai
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="hasil-skor__angka">
            <strong>{angkaSkor(utama.nilai)}</strong>
            <span>dari {angkaSkor(utama.maks)}</span>
          </p>
          {utama.terendahDiterima && (
            <SkalaSkor nilai={utama.nilai} rentang={utama.terendahDiterima} />
          )}
          <ul className="hasil-skor__rincian">
            {utama.rincian.map((b) => (
              <li key={b.label}>
                {b.label} <strong>{angkaSkor(b.nilai)}</strong> dari {angkaSkor(b.maks)}
              </li>
            ))}
          </ul>
          <div className="hasil-skor__baca">
            <p className="hasil-skor__baca-judul">Cara membaca</p>
            {utama.terendahDiterima && (
              <p>
                Skor terendah yang diterima tahun {tahun} di {utama.jenjang} negeri Depok berkisar{" "}
                <strong>
                  {angkaSkor(utama.terendahDiterima.dari)} sampai {angkaSkor(utama.terendahDiterima.sampai)}
                </strong>
                , tergantung sekolahnya (bagian hijau pada garis di atas).
                {posisi && ` Skor anak sudah mencapai batas itu di ${posisi.atas} dari ${posisi.total} sekolah.`}
              </p>
            )}
            <p>Makin jauh skor anak di atas batas terendah, makin besar peluangnya. Skor ini hanya dipakai di Jalur Prestasi; Jalur Domisili memakai jarak rumah.</p>
          </div>
        </>
      )}

      {lain.length > 0 && (
        <ul className="hasil-lipat__daftar hasil-skor__lain">
          {lain.map((s) => (
            <li key={`${s.jenjang}-${s.subJalurKode}-${s.kelompok}`}>
              <strong>
                {judulSkor(s)}: {s.nilai === null ? "belum dihitung" : `${angkaSkor(s.nilai)} dari ${angkaSkor(s.maks)}`}
              </strong>
              <span>
                {s.nilai === null
                  ? `Isi ${gabung(s.kurang)} untuk menghitungnya.`
                  : s.terendahDiterima && `Skor terendah yang diterima ${angkaSkor(s.terendahDiterima.dari)} sampai ${angkaSkor(s.terendahDiterima.sampai)}.`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <details className="hasil-baris hasil-lipat hasil-skor__rumus">
        <summary className="hasil-baris__ringkas">
          <strong>Cara skor dihitung</strong>
          <Icon name="chevron-down" className="icon icon--sm hasil-baris__panah" />
        </summary>
        <div className="hasil-baris__isi">
          <ul className="hasil-lipat__daftar">
            {skor.map((s) => (
              <li key={`${s.jenjang}-${s.subJalurKode}-${s.kelompok}`}>
                <strong>{judulSkor(s)}</strong>
                <span>
                  {s.rumus}, paling tinggi {angkaSkor(s.maks)}.
                </span>
              </li>
            ))}
          </ul>
          <p>
            Rumus mengikuti juknis SPMB Jawa Barat. Di tiap sekolah, skor anak dibandingkan dengan siswa yang diterima tahun {tahun}: sama atau di atas
            separuh mereka berarti Peluang besar, di atas skor terendah berarti Masih mungkin, di bawahnya Peluang kecil.
          </p>
        </div>
      </details>
    </section>
  );
}

/**
 * Garis posisi skor, diperbesar di sekitar rentang skor terendah yang diterima agar perbedaannya terlihat.
 * Hijau = rentang skor terendah antarsekolah, titik = skor anak.
 */
function SkalaSkor({ nilai, rentang }: { nilai: number; rentang: { dari: number; sampai: number } }) {
  const lebar = Math.max(rentang.sampai - rentang.dari, 1);
  const bawah = Math.min(rentang.dari, nilai) - lebar * 0.6;
  const atas = Math.max(rentang.sampai, nilai) + lebar * 0.6;
  const pos = (n: number) => `${((n - bawah) / (atas - bawah)) * 100}%`;
  return (
    <div className="hasil-skor__skala">
      <div className="hasil-skor__bar" aria-hidden="true">
        <span className="hasil-skor__rentang" style={{ left: pos(rentang.dari), right: `calc(100% - ${pos(rentang.sampai)})` }} />
        <span className="hasil-skor__titik" style={{ left: pos(nilai) }} />
      </div>
      <ul className="hasil-skor__legenda">
        <li>
          <span className="hasil-skor__tanda hasil-skor__tanda--titik" aria-hidden="true" />
          Skor anak {angkaSkor(nilai)}
        </li>
        <li>
          <span className="hasil-skor__tanda hasil-skor__tanda--rentang" aria-hidden="true" />
          Skor terendah yang diterima di tiap sekolah
        </li>
      </ul>
    </div>
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
