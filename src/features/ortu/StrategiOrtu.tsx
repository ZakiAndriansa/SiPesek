"use client";
import Link from "next/link";
import { Accordion, Badge, Button, Icon, Table } from "@/components";
import { formatJarak } from "@/lib/peluang/jarak";
import { namaLabel, ringkasJalur, type PilihanStrategi } from "@/lib/quick-check";
import { usePilihan } from "./pilihan";
import { catatanPerkiraan, DenganHasil, JudulOrtu, KonteksCek, LanjutOrtu, type DataTahap } from "./Wadah";

/** Strategi untuk akun Google: 3 pilihan dari hasil cek terakhir, bisa diurutkan ulang dan diganti. */
export function StrategiOrtu() {
  return <DenganHasil>{(data) => <Isi {...data} />}</DenganHasil>;
}

/**
 * Penilaian kombinasi pilihan sebagai bagian fokus halaman: judul pendek yang langsung menjawab, satu kalimat, dan
 * nada (aman atau peringatan). Tanpa persentase: hanya dari label yang dihitung mesin.
 */
function nilaiKombinasi(pilihan: PilihanStrategi[]): { judul: string; teks: string; aman: boolean } {
  const aman = pilihan.filter((p) => p.label === "PELUANG_BESAR").length;
  const mungkin = pilihan.filter((p) => p.label === "MASIH_MUNGKIN").length;
  if (pilihan.length === 0) return { judul: "Belum ada sekolah yang dipilih", teks: "Pilih sekolah dari Hasil Sekolah.", aman: false };
  if (aman >= 1) {
    return {
      judul: `${aman} dari ${pilihan.length} pilihan sudah aman`,
      teks: "Ada jaring pengaman. Pilihan lain boleh dipakai untuk sekolah yang lebih diinginkan.",
      aman: true,
    };
  }
  const semua = pilihan.length === 1 ? "Pilihan ini" : pilihan.length === 3 ? "Ketiga pilihan" : "Semua pilihan";
  if (mungkin >= 1) {
    return { judul: `${semua} belum aman`, teks: "Belum ada sekolah berlabel Peluang besar. Siapkan sekolah swasta sebagai cadangan.", aman: false };
  }
  return { judul: "Peluang di semua pilihan masih kecil", teks: "Siapkan sekolah swasta terdekat sebagai cadangan.", aman: false };
}

/**
 * Strategi (usulan A): penilaian pilihan sebagai satu-satunya bagian yang menonjol, lalu urutan pilihan sebagai
 * baris ringkas. Penjelasan dan peluang per jalur dilipat, dan halaman ditutup dengan satu tautan lanjut.
 */
function Isi({ aktif, terakhir, hasil }: DataTahap) {
  const p = usePilihan(terakhir.token, hasil.hasil);
  const nama = aktif.nama.split(" ")[0];
  const nilai = nilaiKombinasi(p.pilihan);
  const jalur = ringkasJalur(hasil.hasil, null);
  const swasta = hasil.swasta.SMA.length + hasil.swasta.SMK.length;

  return (
    <>
      <JudulOrtu judul={`Strategi untuk ${aktif.nama}`} konteks={<KonteksCek aktif={aktif} terakhir={terakhir} />} />

      <section
        className={`ortu-fokus ${nilai.aman ? "ortu-fokus--aman" : "ortu-fokus--peringatan"}`}
        aria-labelledby="s-nilai"
        role={nilai.aman ? undefined : "status"}
      >
        <h2 className="ortu-fokus__judul" id="s-nilai">
          {nilai.judul}
        </h2>
        <p className="ortu-fokus__teks">{nilai.teks}</p>
        {!nilai.aman && (
          <div className="ortu-aksi">
            {swasta > 0 && (
              <Button variant="primary" href="/cadangan" icon="arrow-right">
                {`Lihat ${swasta} swasta terdekat`}
              </Button>
            )}
            <Button variant="secondary" href="/peta-sekolah">
              Ganti pilihan
            </Button>
          </div>
        )}
      </section>

      <section className="ortu-bagian" aria-labelledby="s-pilihan">
        <div className="ortu-alat">
          <h2 className="ortu-bagian__judul" id="s-pilihan">
            Urutan pilihan
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
          <ol className="ortu-pilihan">
            {p.pilihan.map((s, i) => (
              <li key={s.sekolahId} className="ortu-pilihan__baris">
                <span className="ortu-pilihan__no" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="ortu-pilihan__isi">
                  <strong>{s.name}</strong>
                  <span>
                    {[s.role, s.jalur, s.jarakMeter !== null ? formatJarak(s.jarakMeter) : null].filter(Boolean).join(" · ")}
                  </span>
                  <span>
                    <Badge kind={s.kind}>{namaLabel(s.label)}</Badge>
                  </span>
                </div>
                <div className="ortu-pilihan__aksi">
                  <button className="button button--ghost button--icon" type="button" aria-label={`Naikkan ${s.name}`} disabled={i === 0} onClick={() => p.geser(i, -1)}>
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
                  <button className="button button--ghost button--icon" type="button" aria-label={`Hapus ${s.name} dari pilihan`} onClick={() => p.hapus(s.sekolahId)}>
                    <Icon name="trash" className="icon button__icon" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="ortu-meta">
          Pilihan pertama diproses lebih dulu. Urutan tersimpan di perangkat ini.
          {!p.penuh && (
            <>
              {" "}
              <Link className="link" href="/peta-sekolah">
                Tambah sekolah
              </Link>
            </>
          )}
        </p>
      </section>

      <section className="ortu-bagian" aria-label="Penjelasan">
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
            [
              "Peluang per jalur",
              <Table
                key="jalur"
                caption={`Peluang per jalur untuk ${nama}`}
                head={["Jalur", "Hasil"]}
                rows={jalur.map((j) => [<strong key="n">{j.nama}</strong>, <span key="t" className={j.terhitung ? undefined : "table__muted"}>{j.teks}</span>])}
              />,
            ],
          ]}
        />
      </section>

      <LanjutOrtu catatan={catatanPerkiraan(hasil.tahunAcuan)} href="/unduhan" label="Lanjut ke Dokumen" />
    </>
  );
}
