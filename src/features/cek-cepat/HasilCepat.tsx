"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Alert, Badge, Button, ButtonGroup, CtaBand, Icon, RankList } from "@/components";
import type { HasilSekolah, ResponsPeluang } from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";
import {
  badgeText,
  catatanHasil,
  faktaSekolah,
  jalurLain,
  KIND,
  namaJalur,
  namaLabel,
  ringkasan,
  ringkasJalur,
  strategi,
  type QuickCheckInput,
} from "@/lib/quick-check";

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

      <section className="card hasil-ringkas" aria-labelledby="q-ringkas">
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
