"use client";
import { DashSection, Icon, PageHeader } from "@/components";
import { CatatanSumber, DenganDashboard } from "./Wadah";

const BERKAS = [
  {
    jenis: "sekolah",
    judul: "Data per sekolah",
    isi: "NPSN, nama, jenjang, kecamatan, rayon, pendaftar, pilihan pertama, diterima, tekanan, radius domisili, daya tampung, dan kuota belum terisi.",
  },
  {
    jenis: "kecamatan",
    judul: "Data per kecamatan",
    isi: "Pendaftar unik, diterima unik, dan persentase diterima per kecamatan Kartu Keluarga, untuk SMA, SMK, dan gabungan.",
  },
] as const;

/** Unduhan CSV dari GET /api/dashboard/ekspor; bisa dibuka di Excel atau Google Sheets. */
export function EksporKebijakan() {
  return (
    <>
      <PageHeader title="Ekspor data" desc="Unduh data dashboard untuk rapat, laporan, atau olah lanjut di Excel dan Google Sheets." />
      <DenganDashboard>
        {(d) => (
          <>
            <CatatanSumber tahun={d.tahun} />
            <DashSection title={`Berkas CSV SPMB ${d.tahun}`} desc="Agregat tanpa data pribadi. Angka sama dengan yang tampil di dashboard.">
              <div className="card-grid">
                {BERKAS.map((b) => (
                  <article key={b.jenis} className="card">
                    <h3 className="card__title">{b.judul}</h3>
                    <p className="card__text">{b.isi}</p>
                    {/* Tautan biasa, bukan Link: berkas diunduh langsung dari API, bukan pindah halaman. */}
                    <a
                      className="button button--secondary"
                      href={`/api/dashboard/ekspor?jenis=${b.jenis}&tahun=${d.tahun}`}
                      download={`sipesek-${b.jenis}-${d.tahun}.csv`}
                    >
                      <Icon name="download" className="icon button__icon" />
                      Unduh CSV
                    </a>
                  </article>
                ))}
              </div>
            </DashSection>
            <DashSection title="Untuk dibaca langsung" desc="Setiap halaman dashboard bisa dicetak atau disimpan sebagai PDF lewat menu cetak browser (Ctrl+P).">
              <p className="text-secondary">
                Untuk rapat, mulai dari halaman Ringkasan: temuan utamanya dihitung otomatis dari data yang sama.
              </p>
            </DashSection>
          </>
        )}
      </DenganDashboard>
    </>
  );
}
