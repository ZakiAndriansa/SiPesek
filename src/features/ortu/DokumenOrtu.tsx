"use client";
import type { ChangeEvent } from "react";
import { Badge, Button, ButtonGroup, ChoiceGroup, Choice, NextStep, PageHeader, Table } from "@/components";
import { formatJarak } from "@/lib/peluang/jarak";
import { jalurUtama, namaLabel } from "@/lib/quick-check";
import { useBerkas, usePilihan } from "./pilihan";
import { DenganHasil, tanggalCek, type DataTahap } from "./Wadah";

const JENJANG = { SMA: "SMA", SMK: "SMK", SEMUA: "SMA dan SMK" } as const;

type Berkas = { value: string; title: string; desc: string };

const BERKAS_UMUM: Berkas[] = [
  { value: "kk", title: "Kartu Keluarga", desc: "Alamat di KK menentukan rayon Jalur Domisili. Cek syarat lama terbitnya di juknis." },
  { value: "akta", title: "Akta kelahiran", desc: "Untuk memastikan usia calon siswa." },
  { value: "rapor", title: "Rapor semester 1 sampai 5", desc: "Dipakai untuk Jalur Prestasi nilai rapor." },
  { value: "skl", title: "Surat keterangan lulus atau ijazah SMP", desc: "Dari SMP atau MTs asal." },
  { value: "nisn", title: "Bukti NISN", desc: "Pastikan NISN sama dengan yang tercatat di situs resmi NISN." },
];

/** Berkas tambahan untuk jalur yang ikut dihitung di hasil cek (artinya kondisinya dipilih saat cek). */
function berkasJalur(jalur: Set<string>): Berkas[] {
  const tambahan: Berkas[] = [];
  if (jalur.has("AFIRMASI")) {
    tambahan.push({
      value: "afirmasi",
      title: "Bukti KETM atau keterangan disabilitas",
      desc: "Misalnya bukti terdaftar di DTSEN atau kartu bantuan sosial, atau surat keterangan dari dokter atau psikolog.",
    });
  }
  if (jalur.has("MUTASI")) {
    tambahan.push({ value: "mutasi", title: "Surat penugasan atau pindah tugas orang tua", desc: "Dari instansi atau perusahaan tempat orang tua bekerja." });
  }
  tambahan.push({ value: "sertifikat", title: "Sertifikat lomba (bila ada)", desc: "Untuk Jalur Prestasi hasil lomba." });
  return tambahan;
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
  const jalurDihitung = new Set(
    hasil.hasil.flatMap((h) => h.jalur.filter((j) => j.label !== "TIDAK_DIHITUNG").map((j) => jalurUtama(j.subJalurKode) ?? "")),
  );
  const daftarBerkas = [...BERKAS_UMUM, ...berkasJalur(jalurDihitung)];
  const siap = daftarBerkas.filter((b) => berkas.siap.includes(b.value)).length;
  const hariIni = tanggalCek(new Date().toISOString());

  return (
    <>
      <PageHeader art="docs" title={`Dokumen ${nama}`} desc="Ringkasan strategi siap cetak dan daftar berkas yang perlu disiapkan." />
      <div className="stack stack--lg">
        <section className="stack" aria-labelledby="d-ringkasan">
          <div className="block-head no-print">
            <h2 className="text-heading-md" id="d-ringkasan">
              Ringkasan strategi
            </h2>
            <p className="text-secondary">Satu halaman untuk dibawa saat berdiskusi dengan keluarga atau saat mendaftar.</p>
          </div>

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

          <div className="no-print">
            <ButtonGroup>
              <Button variant="primary" iconLeft="print" print>
                Cetak atau simpan PDF
              </Button>
              <Button variant="secondary" href="/strategi">
                Ubah pilihan
              </Button>
            </ButtonGroup>
            <p className="text-caption text-secondary">Untuk menyimpan PDF, pilih &quot;Simpan sebagai PDF&quot; di jendela cetak.</p>
          </div>
        </section>

        <section className="stack no-print" aria-labelledby="d-berkas">
          <div className="block-head">
            <h2 className="text-heading-md" id="d-berkas">
              Berkas yang perlu disiapkan
            </h2>
            <p className="text-secondary">
              {siap} dari {daftarBerkas.length} siap. Centang yang sudah ada di rumah; tanda centang tersimpan di perangkat ini.
              Daftar resmi ada di juknis SPMB.
            </p>
          </div>
          <div
            onChange={(e: ChangeEvent<HTMLDivElement>) => {
              const t = e.target as unknown as HTMLInputElement;
              if (t.type === "checkbox") berkas.ubah(t.value, t.checked);
            }}
          >
            <ChoiceGroup legend="Berkas pendaftaran">
              {daftarBerkas.map((b) => (
                <Choice key={b.value} type="checkbox" name="berkas" value={b.value} title={b.title} desc={b.desc} checked={berkas.siap.includes(b.value)} />
              ))}
            </ChoiceGroup>
          </div>
        </section>
      </div>
      <NextStep
        step="Semua tahap selesai"
        title="Strategi siap dibawa"
        text="Simpan ringkasan ini, siapkan berkasnya, lalu daftar lewat situs SPMB resmi. Bapak/Ibu bisa kembali kapan saja untuk melihat anak lain."
        href="/anak-saya"
        label="Kembali ke Data Anak"
      />
    </>
  );
}
