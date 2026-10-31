"use client";
import { DashSection, MoreLink, PageHeader, Stats } from "@/components";
import { angka, BATAS_SAMAR, desimal, minat, minatPendek, namaRingkas, persen, type Dashboard } from "./data";
import { CatatanSumber, DenganDashboard } from "./Wadah";

const LUAR_DEPOK = "Luar Depok";

/** Temuan yang dihitung langsung dari data, agar ringkasan selalu sesuai angka terbaru. */
function temuan(d: Dashboard) {
  const kec = d.kecamatan.filter((k) => k.cakupan === "SEMUA" && k.kecamatan !== LUAR_DEPOK);
  const terendah = [...kec].sort((a, b) => a.persenDiterima - b.persenDiterima)[0];
  const tertinggi = [...kec].sort((a, b) => b.persenDiterima - a.persenDiterima)[0];
  const luar = d.kecamatan.find((k) => k.cakupan === "SEMUA" && k.kecamatan === LUAR_DEPOK);
  const tanpaSman = d.rayon.filter((r) => r.smanReguler.length === 0);
  const terpadat = [...d.sekolah].filter((s) => s.tekanan !== null).sort((a, b) => (b.tekanan ?? 0) - (a.tekanan ?? 0))[0];
  const sisa = d.sekolah.reduce((n, s) => n + (s.kursiKosong ?? 0), 0);
  const adaDayaTampung = d.sekolah.some((s) => s.dayaTampung !== null);

  return [
    terendah &&
      tertinggi && {
        judul: `Peluang diterima terendah: ${terendah.kecamatan}`,
        isi: `${persen(terendah.persenDiterima)} pendaftar dari ${terendah.kecamatan} diterima di sekolah negeri, dibanding ${persen(tertinggi.persenDiterima)} di ${tertinggi.kecamatan} dan ${persen(d.ringkas.persenDiterima)} rata-rata kota.`,
        tautan: ["/kebijakan-rasio", "Lihat semua kecamatan"],
      },
    tanpaSman.length > 0 && {
      judul: `${tanpaSman.map((r) => r.nama).join(", ")} tanpa SMAN reguler`,
      isi: `Anak di ${tanpaSman.map((r) => r.kecamatanUtama).join(", ")} harus bersaing di rayon tetangga lewat irisan rayon untuk Jalur Domisili SMA.`,
      tautan: ["/kebijakan-blank-spot", "Lihat rayon dan sebaran sekolah"],
    },
    terpadat && {
      judul: `Sekolah paling diminati: ${namaRingkas(terpadat.sekolah.nama)}`,
      isi: `${desimal(terpadat.tekanan ?? 0)} pendaftar pilihan pertama untuk tiap kursi yang terisi.`,
      tautan: ["/kebijakan-pendaftar", "Lihat tekanan semua sekolah"],
    },
    adaDayaTampung && {
      judul: `${angka(sisa)} kuota belum terisi lewat klasemen`,
      isi: "Selisih daya tampung dan siswa yang diterima lewat klasemen. Sebagian bisa terisi di luar klasemen, misalnya penempatan langsung oleh Dinas, jadi ini bukan jumlah kursi kosong pasti.",
      tautan: ["/kebijakan-pendaftar", "Lihat per sekolah"],
    },
    luar && {
      judul: `${angka(luar.pendaftarUnik)} pendaftar dari luar Depok`,
      isi: `${persen(luar.persenDiterima)} di antaranya diterima. Mereka ikut mengisi kursi sekolah negeri Depok.`,
      tautan: ["/kebijakan-rasio", "Lihat per kecamatan"],
    },
  ].filter((t): t is { judul: string; isi: string; tautan: string[] } => Boolean(t));
}

function Isi({ d }: { d: Dashboard }) {
  const m = d.sinyalMinat;
  const minatTeratas = [...m.perSekolah].sort((a, b) => b.jumlahCek - a.jumlahCek).slice(0, 5);
  return (
    <>
      <Stats
        items={[
          ["Pendaftar", angka(d.ringkas.pendaftarUnik), `Anak unik, SPMB ${d.tahun}`],
          ["Diterima di sekolah negeri", angka(d.ringkas.diterimaUnik), `SPMB ${d.tahun}`],
          ["Persentase diterima", persen(d.ringkas.persenDiterima), "Diterima dibagi pendaftar"],
          ["Sekolah negeri", angka(d.ringkas.jumlahSekolahNegeri), "SMA dan SMK negeri di Depok"],
        ]}
      />
      <CatatanSumber tahun={d.tahun} />

      <DashSection title="Temuan utama" desc="Dihitung otomatis dari data, diurutkan menurut kepentingan untuk kebijakan.">
        <ol className="kebijakan-temuan">
          {temuan(d).map((t) => (
            <li key={t.judul} className="card">
              <h3 className="card__title">{t.judul}</h3>
              <p className="card__text">{t.isi}</p>
              <MoreLink href={t.tautan[0]}>{t.tautan[1]}</MoreLink>
            </li>
          ))}
        </ol>
      </DashSection>

      <DashSection
        title="Minat orang tua di SiPesek"
        desc="Dari hasil cek terakhir tiap anak yang disimpan orang tua. Berguna untuk membaca arah minat sebelum pendaftaran dibuka."
      >
        <Stats
          items={[
            ["Anak yang dicek", minatPendek(m.anakUnik), "Satu kali per anak"],
            ["Total cek tersimpan", minatPendek(m.totalCek), `Tahun ${d.tahun}`],
          ]}
        />
        {m.anakUnik < BATAS_SAMAR ? (
          <p className="text-secondary">
            Minat per sekolah tampil setelah sedikitnya {BATAS_SAMAR} anak dicek, agar tidak mengarah ke keluarga tertentu dan
            tidak disimpulkan dari sampel yang terlalu kecil.
          </p>
        ) : (
          <ol className="kebijakan-daftar">
            {minatTeratas.map((s) => (
              <li key={s.sekolahId}>
                <strong>{namaRingkas(s.nama)}</strong>: {minat(s.jumlahCek)} anak
                {s.peluangKecil > 0 && `, ${minat(s.peluangKecil)} di antaranya berpeluang kecil di semua jalur`}
              </li>
            ))}
          </ol>
        )}
      </DashSection>
    </>
  );
}

export function RingkasanKebijakan() {
  return (
    <>
      <PageHeader
        title="Ringkasan"
        desc="Gambaran daya tampung dan persaingan SMA dan SMK negeri Kota Depok untuk rapat dan laporan."
      />
      <DenganDashboard>{(d) => <Isi d={d} />}</DenganDashboard>
    </>
  );
}
