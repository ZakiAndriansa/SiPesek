"use client";
import { useState, type ChangeEvent } from "react";
import { Badge, DashSection, PageHeader, Select, Table, Toolbar } from "@/components";
import { angka, desimal, kelasTekanan, minatPendek, namaRingkas, persen, type Dashboard } from "./data";
import { CatatanSumber, DenganDashboard } from "./Wadah";

const JENJANG = ["SMA dan SMK", "SMA", "SMK"];
const URUTAN = ["Tekanan tertinggi", "Kuota belum terisi terbanyak", "Nama sekolah"];
const kosong = <span className="table__muted">Belum ada</span>;
const opsi = (n: number | null) => (n === null ? kosong : angka(n));

function Isi({ d }: { d: Dashboard }) {
  const [jenjang, setJenjang] = useState(JENJANG[0]);
  const [urutan, setUrutan] = useState(URUTAN[0]);
  const minatSekolah = new Map(d.sinyalMinat.perSekolah.map((s) => [s.sekolahId, s.jumlahCek]));

  const sekolah = d.sekolah
    .filter((s) => jenjang === JENJANG[0] || s.sekolah.jenjang === jenjang)
    .sort((a, b) =>
      urutan === URUTAN[0]
        ? (b.tekanan ?? -1) - (a.tekanan ?? -1)
        : urutan === URUTAN[1]
          ? (b.kursiKosong ?? -1) - (a.kursiKosong ?? -1)
          : namaRingkas(a.sekolah.nama).localeCompare(namaRingkas(b.sekolah.nama), "id", { numeric: true }),
    );

  function ubah(e: ChangeEvent<HTMLDivElement>) {
    const t = e.target as unknown as HTMLSelectElement;
    if (t.id === "f-jenjang") setJenjang(t.value);
    if (t.id === "f-urutan") setUrutan(t.value);
  }

  return (
    <>
      <div onChange={ubah}>
        <Toolbar>
          <Select id="f-jenjang" label="Jenjang" options={JENJANG} selected={jenjang} />
          <Select id="f-urutan" label="Urutkan" options={URUTAN} selected={urutan} />
        </Toolbar>
      </div>
      <CatatanSumber tahun={d.tahun} />

      <DashSection
        title={`Tekanan pendaftar per sekolah, ${jenjang}`}
        desc="Tekanan = pendaftar pilihan pertama dibagi kursi yang terisi. Sangat diminati: 2 atau lebih. Diminati: 1 sampai di bawah 2. Kurang diminati: di bawah 1."
      >
        <Table
          caption={`Tekanan pendaftar per sekolah, ${jenjang}`}
          head={["Sekolah", "Tekanan", "Pendaftar", "Pilihan pertama", "Diterima", "Daya tampung", "Kuota belum terisi", "Minat (anak)"]}
          rows={sekolah.map((s) => {
            const kelas = kelasTekanan(s.tekanan);
            return [
              <span key="n" className="kebijakan-sekolah">
                <strong>{namaRingkas(s.sekolah.nama)}</strong>
                <small>
                  {s.sekolah.jenjang} · {s.sekolah.kecamatan}
                </small>
              </span>,
              <span key="t" className="kebijakan-tekanan">
                <span>{s.tekanan === null ? "" : desimal(s.tekanan)}</span>
                <Badge kind={kelas.kind}>{kelas.label}</Badge>
              </span>,
              opsi(s.pendaftar),
              opsi(s.pendaftarPilihan1),
              angka(s.diterima),
              opsi(s.dayaTampung),
              opsi(s.kursiKosong),
              minatPendek(minatSekolah.get(s.sekolah.id) ?? 0),
            ];
          })}
          num={[2, 3, 4, 5, 6]}
        />
        <p className="text-caption text-secondary">
          Kuota belum terisi = daya tampung dikurangi siswa yang diterima lewat klasemen. Sebagian kursi bisa terisi di luar
          klasemen, misalnya penempatan langsung oleh Dinas, jadi angka ini bukan kursi kosong pasti.
        </p>
      </DashSection>

      {jenjang !== "SMA" && (
        <DashSection title="Program keahlian SMK" desc="Persaingan per program, diurutkan dari persentase diterima terendah.">
          <Table
            caption="Pendaftar dan diterima per program keahlian SMK"
            head={["Program", "Sekolah", "Pendaftar", "Diterima", "Persentase diterima"]}
            rows={[...d.programSmk]
              .sort((a, b) => rasio(a) - rasio(b))
              .map((p) => [
                p.program,
                namaRingkas(p.sekolah),
                opsi(p.pendaftar),
                angka(p.diterima),
                p.pendaftar ? persen(rasio(p)) : kosong,
              ])}
            num={[2, 3, 4]}
          />
        </DashSection>
      )}
    </>
  );
}

/** Persentase diterima satu program; program tanpa data pendaftar diletakkan di akhir. */
const rasio = (p: Dashboard["programSmk"][number]) =>
  p.pendaftar ? Math.round((p.diterima / p.pendaftar) * 1000) / 10 : Number.POSITIVE_INFINITY;

export function PendaftarKebijakan() {
  return (
    <>
      <PageHeader
        title="Tekanan pendaftar"
        desc="Sekolah yang paling diperebutkan dan yang masih punya kuota, untuk menimbang penambahan rombongan belajar atau pemerataan."
      />
      <DenganDashboard>{(d) => <Isi d={d} />}</DenganDashboard>
    </>
  );
}
