import type { ResponsPeluang } from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";
import {
  angkaSkor,
  judulSkor,
  MAPEL,
  namaJalur,
  namaLabel,
  pembandingSingkat,
  posisiSkor,
  ringkasan,
  strategi,
  type QuickCheckInput,
} from "@/lib/quick-check";

const JENJANG = { sma: "SMA", smk: "SMK", belum: "SMA dan SMK (belum menentukan)" } as const;
const KETM = { ya: "KETM", tidak: "Bukan KETM", ragu: "Belum yakin KETM" } as const;
const satu = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });

/**
 * Laporan hasil Cek Cepat untuk dicetak: tersusun seperti dokumen satu sampai dua halaman A4, bukan cetakan
 * halaman layar. Hanya tampil saat mencetak (lihat .laporan-cetak di quick.css). NISN dan titik rumah tidak dicetak.
 */
export function LaporanCetak({ result, input, date }: { result: ResponsPeluang; input: QuickCheckInput; date: string }) {
  const skor = result.skorAnak ?? [];
  const utama = skor.find((s) => s.nilai !== null) ?? skor[0];
  const posisi = utama ? posisiSkor(utama, result.hasil) : null;
  const r = ringkasan(result.hasil);
  const pilihan = strategi(result.hasil);
  const swasta = [...result.swasta.SMA, ...result.swasta.SMK].sort((a, b) => (a.jarakMeter ?? Infinity) - (b.jarakMeter ?? Infinity));
  const semester = input.nilai.filter((v): v is number => v !== null);
  const kondisi = [KETM[input.ketm], input.disabilitas && "anak penyandang disabilitas", input.pindahTugas && "orang tua pindah tugas"]
    .filter(Boolean)
    .join(", ");
  const mapelLengkap = MAPEL.every(([k]) => input.mapel[k] !== null);

  return (
    <article className="laporan-cetak" aria-hidden="true">
      <header className="laporan-cetak__kepala">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo-lofi.svg" alt="" width={36} height={36} />
        <div>
          <h1>Hasil Cek Cepat SiPesek</h1>
          <p>
            Dicetak {date} · Acuan: hasil SPMB {result.tahunAcuan} Kota Depok · Perkiraan, bukan keputusan resmi
          </p>
        </div>
      </header>

      <section>
        <h2>Data yang diisi</h2>
        <table className="laporan-cetak__data">
          <tbody>
            <tr>
              <th>Jenjang tujuan</th>
              <td>{JENJANG[input.jenjang]}</td>
              <th>Kecamatan sesuai KK</th>
              <td>{input.kecamatan}</td>
            </tr>
            <tr>
              <th>Rata-rata rapor</th>
              <td>{semester.length ? `${satu(semester.reduce((a, b) => a + b, 0) / semester.length)} (${semester.length} semester)` : "Tidak diisi"}</td>
              <th>Kondisi keluarga</th>
              <td>{kondisi}</td>
            </tr>
            <tr>
              <th>TKA</th>
              <td>
                {input.tkaBin !== null || input.tkaMtk !== null
                  ? `B. Indonesia ${input.tkaBin ?? "-"}, Matematika ${input.tkaMtk ?? "-"}`
                  : "Tidak diisi"}
              </td>
              <th>Nilai 5 mapel</th>
              <td>{mapelLengkap ? MAPEL.map(([k, nama]) => `${nama} ${input.mapel[k]}`).join(", ") : "Tidak diisi"}</td>
            </tr>
          </tbody>
        </table>
        <p className="laporan-cetak__kecil">NISN dan titik rumah tidak dicetak. Jarak dihitung garis lurus dari titik rumah.</p>
      </section>

      <section className="laporan-cetak__ringkas">
        <div className="laporan-cetak__kotak">
          <h2>Skor akhir anak</h2>
          {utama && utama.nilai !== null ? (
            <>
              <p className="laporan-cetak__angka">
                {angkaSkor(utama.nilai)} <span>dari {angkaSkor(utama.maks)}</span>
              </p>
              <p>{judulSkor(utama)}</p>
              <p className="laporan-cetak__kecil">
                {utama.rumus}
                {utama.rincian.length > 1 && ` (${utama.rincian.map((b) => `${b.label} ${angkaSkor(b.nilai)}`).join(", ")})`}.
              </p>
              {utama.terendahDiterima && (
                <p className="laporan-cetak__kecil">
                  Skor terendah yang diterima {result.tahunAcuan}: {angkaSkor(utama.terendahDiterima.dari)} sampai{" "}
                  {angkaSkor(utama.terendahDiterima.sampai)}
                  {posisi && `; skor anak mencapai batas itu di ${posisi.atas} dari ${posisi.total} sekolah`}.
                </p>
              )}
            </>
          ) : (
            <p>{utama ? `Belum dihitung: ${utama.kurang.join(", ")} belum diisi.` : "Jenjang ini tidak memakai skor."}</p>
          )}
        </div>
        <div className="laporan-cetak__kotak">
          <h2>Peluang di sekolah negeri</h2>
          <p className="laporan-cetak__angka">
            {r.sorotan ? (
              <>
                {r.sorotan.n} <span>dari {r.sorotan.total} sekolah</span>
              </>
            ) : (
              "Kecil"
            )}
          </p>
          <p>{r.sorotan ? `berlabel ${namaLabel(r.sorotan.label)}` : "Siapkan sekolah swasta terdekat sebagai cadangan."}</p>
          <p className="laporan-cetak__kecil">{r.jumlah.map((j) => `${namaLabel(j.label)} ${j.n}`).join(" · ")}</p>
        </div>
      </section>

      {pilihan.length > 0 && (
        <section>
          <h2>Rekomendasi 3 pilihan</h2>
          <table className="laporan-cetak__tabel">
            <thead>
              <tr>
                <th>No</th>
                <th>Peran</th>
                <th>Sekolah</th>
                <th>Jalur</th>
                <th>Label</th>
                <th>Jarak</th>
              </tr>
            </thead>
            <tbody>
              {pilihan.map((p, i) => (
                <tr key={p.name}>
                  <td>{i + 1}</td>
                  <td>{p.role}</td>
                  <td>{p.name}</td>
                  <td>{p.jalur}</td>
                  <td>{namaLabel(p.label)}</td>
                  <td>{p.jarakMeter === null ? "-" : formatJarak(p.jarakMeter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section>
        <h2>Semua sekolah negeri ({result.hasil.length})</h2>
        <table className="laporan-cetak__tabel">
          <thead>
            <tr>
              <th>Sekolah</th>
              <th>Kecamatan</th>
              <th>Jalur terbaik</th>
              <th>Label</th>
              <th>Pembanding {result.tahunAcuan}</th>
            </tr>
          </thead>
          <tbody>
            {result.hasil.map((h) => (
              <tr key={h.sekolah.id}>
                <td>{h.sekolah.nama}</td>
                <td>{h.sekolah.kecamatan}</td>
                <td>{namaJalur(h.jalur[0])}</td>
                <td>{namaLabel(h.labelTerbaik)}</td>
                <td>{pembandingSingkat(h.jalur[0])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {swasta.length > 0 && (
        <section>
          <h2>Sekolah swasta terdekat sebagai cadangan</h2>
          <table className="laporan-cetak__tabel">
            <thead>
              <tr>
                <th>Sekolah</th>
                <th>Jenjang</th>
                <th>Kecamatan</th>
                <th>Jarak</th>
                <th>Biaya</th>
              </tr>
            </thead>
            <tbody>
              {swasta.map((s) => (
                <tr key={s.sekolah.id}>
                  <td>{s.sekolah.nama}</td>
                  <td>{s.sekolah.jenjang}</td>
                  <td>{s.sekolah.kecamatan}</td>
                  <td>{s.jarakMeter === null ? "-" : formatJarak(s.jarakMeter)}</td>
                  <td>{s.biaya?.ringkas ?? "Tanyakan ke sekolah"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="laporan-cetak__catatan">
        <h2>Cara membaca</h2>
        <ul>
          <li>Peluang besar: jarak atau skor anak sama atau lebih baik dari separuh siswa yang diterima. Cocok sebagai pilihan aman.</li>
          <li>Masih mungkin: masih di dalam rentang siswa yang diterima. Cocok untuk satu pilihan ambisius.</li>
          <li>Peluang kecil: di luar rentang itu. Sebaiknya bukan satu-satunya pilihan.</li>
        </ul>
        <p>
          {result.catatan} Keputusan akhir ada pada panitia SPMB, dan pendaftaran dilakukan lewat portal SPMB Dinas Pendidikan.
        </p>
      </section>
    </article>
  );
}

