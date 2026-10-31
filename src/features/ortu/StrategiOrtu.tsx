"use client";
import { Accordion, Alert, Badge, Button, Disclaimer, Icon, MoreLink, NextStep, PageHeader, Table } from "@/components";
import { formatJarak } from "@/lib/peluang/jarak";
import { namaLabel, ringkasan, ringkasJalur, type PilihanStrategi } from "@/lib/quick-check";
import { MAKS_PILIHAN, usePilihan } from "./pilihan";
import { DenganHasil, SumberHasil, type DataTahap } from "./Wadah";

/** Strategi untuk akun Google: 3 pilihan dari hasil cek terakhir, bisa diurutkan ulang dan diganti. */
export function StrategiOrtu() {
  return <DenganHasil>{(data) => <Isi {...data} />}</DenganHasil>;
}

/** Kalimat penilaian kombinasi pilihan, tanpa persentase: hanya dari label yang dihitung mesin. */
function nilaiKombinasi(pilihan: PilihanStrategi[]) {
  const aman = pilihan.filter((p) => p.label === "PELUANG_BESAR").length;
  const mungkin = pilihan.filter((p) => p.label === "MASIH_MUNGKIN").length;
  if (pilihan.length === 0) return { judul: "Belum ada sekolah yang dipilih", teks: "Tambahkan sekolah dari Hasil Sekolah." };
  if (aman >= 1) {
    return {
      judul: `${aman} dari ${pilihan.length} pilihan berlabel Peluang besar`,
      teks: "Ada pilihan aman sebagai jaring pengaman. Pilihan lain bisa dipakai untuk sekolah yang lebih diinginkan.",
    };
  }
  if (mungkin >= 1) {
    return {
      judul: "Belum ada pilihan berlabel Peluang besar",
      teks: "Semua pilihan masih bersaing. Siapkan sekolah swasta sebagai cadangan, atau ganti satu pilihan dengan sekolah berlabel Peluang besar bila ada.",
    };
  }
  return {
    judul: "Peluang di semua pilihan masih kecil",
    teks: "Sangat disarankan menyiapkan sekolah swasta terdekat sebagai cadangan.",
  };
}

function Isi({ aktif, terakhir, hasil }: DataTahap) {
  const p = usePilihan(terakhir.token, hasil.hasil);
  const nama = aktif.nama.split(" ")[0];
  const nilai = nilaiKombinasi(p.pilihan);
  const r = ringkasan(hasil.hasil);
  const jalur = ringkasJalur(hasil.hasil, null);
  const swasta = hasil.swasta.SMA.length + hasil.swasta.SMK.length;

  return (
    <>
      <PageHeader
        art="strategy"
        title={`Strategi untuk ${nama}`}
        desc={`Paling banyak ${MAKS_PILIHAN} sekolah negeri. Urutan bisa diubah, dan sekolah bisa diganti dari Hasil Sekolah.`}
      />
      <div className="stack stack--lg">
        <SumberHasil terakhir={terakhir} hasil={hasil} />

        <section className="card stack" aria-labelledby="s-nilai">
          <h2 className="card__title" id="s-nilai">
            {nilai.judul}
          </h2>
          <p className="card__text">{nilai.teks}</p>
          {r.sorotan && (
            <p className="text-secondary">
              Dari semua sekolah negeri: {namaLabel(r.sorotan.label)} di {r.sorotan.n} dari {r.sorotan.total} sekolah.
            </p>
          )}
        </section>

        <section className="stack" aria-labelledby="s-pilihan">
          <div className="block-head block-head--row">
            <h2 className="text-heading-md" id="s-pilihan">
              Pilihan sekolah
            </h2>
            {p.disusunSendiri && (
              <Button variant="ghost" sm iconLeft="refresh" onClick={p.kembalikan}>
                Kembalikan ke rekomendasi
              </Button>
            )}
          </div>
          {p.pilihan.length === 0 ? (
            <p className="text-secondary">Belum ada sekolah yang dipilih.</p>
          ) : (
            <ol className="rank">
              {p.pilihan.map((s, i) => (
                <li key={s.sekolahId} className="card rank__item">
                  <span className="rank__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="rank__body">
                    <span className="rank__role">{s.role}</span>
                    <h3 className="card__title">{s.name}</h3>
                    <span className="card__text">
                      {s.jalur}
                      {s.jarakMeter !== null && ` · ${formatJarak(s.jarakMeter)}`}
                    </span>
                    <Badge kind={s.kind}>{namaLabel(s.label)}</Badge>
                  </div>
                  <div className="rank__moves">
                    <button
                      className="button button--ghost button--icon"
                      type="button"
                      aria-label={`Naikkan ${s.name}`}
                      disabled={i === 0}
                      onClick={() => p.geser(i, -1)}
                    >
                      <Icon name="arrow-up" className="icon button__icon" />
                    </button>
                    <button
                      className="button button--ghost button--icon"
                      type="button"
                      aria-label={`Turunkan ${s.name}`}
                      disabled={i === p.pilihan.length - 1}
                      onClick={() => p.geser(i, 1)}
                    >
                      <Icon name="arrow-down" className="icon button__icon" />
                    </button>
                    <button
                      className="button button--ghost button--icon"
                      type="button"
                      aria-label={`Hapus ${s.name} dari pilihan`}
                      onClick={() => p.hapus(s.sekolahId)}
                    >
                      <Icon name="trash" className="icon button__icon" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {!p.penuh && (
            <Button variant="secondary" block href="/peta-sekolah" iconLeft="plus">
              Tambah sekolah dari Hasil Sekolah
            </Button>
          )}
          <p className="text-caption text-secondary">Susunan ini tersimpan di perangkat ini saja, dan ikut tercetak di halaman Dokumen.</p>
        </section>

        <Accordion
          items={[
            [
              "Kenapa satu ambisius dan dua aman?",
              `Satu pilihan berlabel Masih mungkin memberi kesempatan mencoba sekolah yang lebih diinginkan. Dua pilihan berlabel Peluang besar menjaga agar ${nama} tetap mendapat sekolah negeri bila pilihan pertama penuh.`,
            ],
            [
              "Apakah urutan pilihan berpengaruh?",
              "Ya. Pilihan pertama diproses lebih dulu. Taruh sekolah yang paling diinginkan di atas, dan pastikan setidaknya satu pilihan berlabel Peluang besar.",
            ],
          ]}
          openFirst
        />

        <section className="stack" aria-labelledby="s-jalur">
          <div className="block-head">
            <h2 className="text-heading-md" id="s-jalur">
              Peluang per jalur
            </h2>
            <p className="text-secondary">Jumlah sekolah per label di tiap jalur, dari hasil cek {nama}.</p>
          </div>
          <Table
            caption={`Peluang per jalur untuk ${nama}`}
            head={["Jalur", "Hasil"]}
            rows={jalur.map((j) => [<strong key="n">{j.nama}</strong>, <span key="t" className={j.terhitung ? undefined : "table__muted"}>{j.teks}</span>])}
          />
        </section>

        {swasta > 0 && (
          <Alert kind="info" title="Sekolah swasta sebagai cadangan" action={<MoreLink href="/cadangan">Lihat {swasta} sekolah swasta terdekat</MoreLink>}>
            Pendaftaran swasta umumnya dibuka lebih awal dari SPMB negeri. Siapkan cadangan sejak awal, terutama bila belum ada pilihan berlabel Peluang besar.
          </Alert>
        )}

        <Disclaimer />

        <NextStep
          step="Tahap 4 dari 4"
          title="Bawa strategi ini saat mendaftar"
          text="Cetak ringkasan satu halaman dan centang berkas yang perlu disiapkan."
          href="/unduhan"
          label="Buka Dokumen"
        />
      </div>
    </>
  );
}
