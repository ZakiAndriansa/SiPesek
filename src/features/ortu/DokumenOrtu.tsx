"use client";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { Badge, Button, Table } from "@/components";
import type { ResponsPeluang } from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";
import { jalurUtama, namaLabel } from "@/lib/quick-check";
import { useBerkas, usePilihan } from "./pilihan";
import { DenganHasil, JudulOrtu, LanjutOrtu, tanggalCek, type DataTahap } from "./Wadah";

const JENJANG = { SMA: "SMA", SMK: "SMK", SEMUA: "SMA dan SMK" } as const;

/** `catatan`: keterangan singkat di kanan baris; penjelasan lengkap ada di juknis SPMB. */
type Berkas = { value: string; title: string; catatan?: string };

const BERKAS_UMUM: Berkas[] = [
  { value: "kk", title: "Kartu Keluarga", catatan: "Menentukan rayon Domisili" },
  { value: "akta", title: "Akta kelahiran" },
  { value: "rapor", title: "Rapor semester 1 sampai 5", catatan: "Untuk Jalur Prestasi" },
  { value: "skl", title: "Surat keterangan lulus atau ijazah SMP" },
  { value: "nisn", title: "Bukti NISN", catatan: "Cek di situs resmi NISN" },
];

/** Berkas tambahan untuk jalur yang ikut dihitung di hasil cek (artinya kondisinya dipilih saat cek). */
function berkasJalur(jalur: Set<string>): Berkas[] {
  const tambahan: Berkas[] = [];
  if (jalur.has("AFIRMASI")) {
    tambahan.push({ value: "afirmasi", title: "Bukti KETM atau keterangan disabilitas", catatan: "DTSEN, kartu bansos, atau surat dokter" });
  }
  if (jalur.has("MUTASI")) {
    tambahan.push({ value: "mutasi", title: "Surat penugasan atau pindah tugas orang tua", catatan: "Dari instansi atau perusahaan" });
  }
  tambahan.push({ value: "sertifikat", title: "Sertifikat lomba", catatan: "Bila ada" });
  return tambahan;
}

/** Daftar berkas untuk satu hasil cek: berkas umum ditambah berkas jalur yang ikut dihitung. Dipakai juga Data Anak. */
export function daftarBerkasUntuk(hasil: ResponsPeluang): Berkas[] {
  const jalurDihitung = new Set(
    hasil.hasil.flatMap((h) => h.jalur.filter((j) => j.label !== "TIDAK_DIHITUNG").map((j) => jalurUtama(j.subJalurKode) ?? "")),
  );
  return [...BERKAS_UMUM, ...berkasJalur(jalurDihitung)];
}

/** Dokumen untuk akun Google: ringkasan strategi siap cetak dan centang berkas, dari data tersimpan. */
export function DokumenOrtu() {
  return <DenganHasil>{(data) => <Isi {...data} />}</DenganHasil>;
}

function Isi({ aktif, terakhir, hasil }: DataTahap) {
  const { pilihan } = usePilihan(terakhir.token, hasil.hasil);
  const berkas = useBerkas(aktif.id);
  const nama = aktif.nama.split(" ")[0];
  const swasta = [...hasil.swasta.SMA, ...hasil.swasta.SMK]
    .sort((a, b) => (a.jarakMeter ?? Infinity) - (b.jarakMeter ?? Infinity))
    .slice(0, 3);
  const daftarBerkas = daftarBerkasUntuk(hasil);
  const siap = daftarBerkas.filter((b) => berkas.siap.includes(b.value)).length;
  const hariIni = tanggalCek(new Date().toISOString());

  return (
    <>
      {/* Dokumen (usulan A): aksi utama (Cetak) langsung di samping judul, bukan di bawah kertas. */}
      <JudulOrtu
        judul={`Dokumen ${nama}`}
        konteks="Ringkasan satu halaman untuk dibawa saat mendaftar."
        aksi={
          <Button variant="primary" iconLeft="print" print>
            Cetak atau simpan PDF
          </Button>
        }
      />
      <div className="stack stack--lg">
        <section className="stack" aria-labelledby="d-ringkasan">
          <h2 className="visually-hidden" id="d-ringkasan">
            Ringkasan strategi
          </h2>

          <article className="paper dokumen">
            <header className="dokumen__kepala">
              <div>
                <h3 className="dokumen__judul">SiPesek · Ringkasan Strategi SPMB</h3>
                <p className="text-caption text-secondary">
                  Acuan hasil SPMB {hasil.tahunAcuan} Kota Depok · Dicetak {hariIni}
                </p>
              </div>
            </header>

            <dl className="dokumen__data">
              <div>
                <dt>Nama anak</dt>
                <dd>{aktif.nama}</dd>
              </div>
              <div>
                <dt>NISN</dt>
                <dd>berakhiran {aktif.nisnAkhir}</dd>
              </div>
              <div>
                <dt>Kecamatan sesuai KK</dt>
                <dd>{terakhir.kecamatan ?? "-"}</dd>
              </div>
              <div>
                <dt>Jenjang tujuan</dt>
                <dd>{JENJANG[terakhir.jenjang]}</dd>
              </div>
              <div>
                <dt>Tanggal cek</dt>
                <dd>{tanggalCek(terakhir.dibuatPada)}</dd>
              </div>
            </dl>

            <Table
              caption="Urutan pilihan sekolah"
              head={["Pilihan", "Sekolah dan jalur", "Label", "Jarak"]}
              rowHead={false}
              rows={
                pilihan.length > 0
                  ? pilihan.map((p, i) => [
                      <strong key="i">Pilihan {i + 1}</strong>,
                      <span key="s">
                        <strong>{p.name}</strong>
                        <span className="table__muted"> {p.jalur}</span>
                      </span>,
                      <Badge key="l" kind={p.kind}>
                        {namaLabel(p.label)}
                      </Badge>,
                      p.jarakMeter === null ? "-" : formatJarak(p.jarakMeter),
                    ])
                  : [["-", "Belum ada sekolah yang dipilih di Strategi.", "-", "-"]]
              }
            />

            {swasta.length > 0 && (
              <div>
                <h4 className="dokumen__subjudul">Cadangan swasta terdekat</h4>
                <ul className="dokumen__daftar">
                  {swasta.map((s) => (
                    <li key={s.sekolah.id}>
                      {s.sekolah.nama} ({s.sekolah.jenjang}
                      {s.jarakMeter !== null && `, ${formatJarak(s.jarakMeter)}`}). Biaya: {s.biaya?.ringkas ?? "tanyakan ke sekolah"}.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-caption text-secondary">
              Perkiraan dari hasil SPMB {hasil.tahunAcuan}, bukan bukti penerimaan. Keputusan akhir ada pada panitia SPMB, dan
              pendaftaran dilakukan lewat situs SPMB resmi Dinas Pendidikan.
            </p>
          </article>

          <p className="ortu-meta no-print">
            <Link className="link" href="/strategi">
              Ubah pilihan di Strategi
            </Link>
            {" · "}Untuk PDF, pilih &quot;Simpan sebagai PDF&quot; di jendela cetak.
          </p>
        </section>

        <section className="ortu-bagian no-print" aria-labelledby="d-berkas">
          <div className="ortu-alat">
            <h2 className="ortu-bagian__judul" id="d-berkas">
              Berkas yang perlu disiapkan
            </h2>
            <span className="ortu-saran__judul" aria-live="polite">
              {siap} dari {daftarBerkas.length} siap
            </span>
          </div>
          <div
            className="ortu-progres"
            role="progressbar"
            aria-label="Berkas siap"
            aria-valuemin={0}
            aria-valuemax={daftarBerkas.length}
            aria-valuenow={siap}
          >
            <span style={{ width: `${(siap / daftarBerkas.length) * 100}%` }} />
          </div>
          <ul
            className="ortu-cek"
            onChange={(e: ChangeEvent<HTMLUListElement>) => {
              const t = e.target as unknown as HTMLInputElement;
              if (t.type === "checkbox") berkas.ubah(t.value, t.checked);
            }}
          >
            {daftarBerkas.map((b) => (
              <li key={b.value}>
                <label>
                  <input type="checkbox" name="berkas" value={b.value} defaultChecked={berkas.siap.includes(b.value)} />
                  {b.title}
                  {b.catatan && <small>{b.catatan}</small>}
                </label>
              </li>
            ))}
          </ul>
          <p className="ortu-meta">Centang tersimpan di perangkat ini. Daftar resmi ada di juknis SPMB.</p>
        </section>
      </div>
      <LanjutOrtu href="/anak-saya" label="Kembali ke Data Anak" />
    </>
  );
}
