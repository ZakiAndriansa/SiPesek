"use client";
import { useState, type ChangeEvent } from "react";
import { Badge, DashSection, PageHeader, Select, Table, Toolbar } from "@/components";
import { angka, kelasPersen, minatPendek, persen, type Dashboard } from "./data";
import { CatatanSumber, DenganDashboard } from "./Wadah";

const CAKUPAN = { "SMA dan SMK": "SEMUA", SMA: "SMA", SMK: "SMK" } as const;
type Pilihan = keyof typeof CAKUPAN;
const LUAR_DEPOK = "Luar Depok";

function Isi({ d }: { d: Dashboard }) {
  const [pilihan, setPilihan] = useState<Pilihan>("SMA dan SMK");
  const cakupan = CAKUPAN[pilihan];
  const baris = d.kecamatan.filter((k) => k.cakupan === cakupan);
  const dalamKota = baris.filter((k) => k.kecamatan !== LUAR_DEPOK);
  const luar = baris.find((k) => k.kecamatan === LUAR_DEPOK);
  // Rata-rata kota dari pendaftar dan diterima dalam kota, bukan rata-rata persentase antarkecamatan.
  const pendaftar = dalamKota.reduce((n, k) => n + k.pendaftarUnik, 0);
  const diterima = dalamKota.reduce((n, k) => n + k.diterimaUnik, 0);
  const rataRata = pendaftar ? Math.round((diterima / pendaftar) * 1000) / 10 : 0;
  const urut = [...dalamKota].sort((a, b) => a.persenDiterima - b.persenDiterima);
  const minatKec = new Map(d.sinyalMinat.perKecamatan.map((k) => [k.kecamatan, k.jumlahCek]));
  const tertinggi = Math.max(...urut.map((k) => k.persenDiterima), 1);

  return (
    <>
      <div onChange={(e: ChangeEvent<HTMLDivElement>) => setPilihan((e.target as unknown as HTMLSelectElement).value as Pilihan)}>
        <Toolbar>
          <Select id="f-cakupan" label="Jenjang" options={Object.keys(CAKUPAN)} selected={pilihan} />
        </Toolbar>
      </div>
      <CatatanSumber tahun={d.tahun} />

      <DashSection
        title={`Persentase diterima per kecamatan, ${pilihan}`}
        desc={`Pendaftar dikelompokkan menurut kecamatan pada Kartu Keluarga. Rata-rata kota ${persen(rataRata)}; selisih sampai 5 poin dianggap setara. Diurutkan dari yang paling sulit.`}
      >
        <Table
          caption={`Persentase diterima per kecamatan, ${pilihan}`}
          head={["Kecamatan", "Pendaftar", "Diterima", "Persentase diterima", "Dibanding rata-rata", "Minat (anak)"]}
          rows={urut.map((k) => {
            const kelas = kelasPersen(k.persenDiterima, rataRata);
            return [
              k.kecamatan,
              angka(k.pendaftarUnik),
              angka(k.diterimaUnik),
              <span key="p" className="kebijakan-batang">
                <span className="kebijakan-batang__isi" style={{ width: `${(k.persenDiterima / tertinggi) * 100}%` }} aria-hidden="true" />
                <span className="kebijakan-batang__angka">{persen(k.persenDiterima)}</span>
              </span>,
              <Badge key="b" kind={kelas.kind}>
                {kelas.label}
              </Badge>,
              minatPendek(minatKec.get(k.kecamatan) ?? 0),
            ];
          })}
          num={[1, 2]}
        />
        {luar && (
          <p className="text-secondary">
            Ditambah {angka(luar.pendaftarUnik)} pendaftar dengan Kartu Keluarga di luar Depok; {persen(luar.persenDiterima)} di
            antaranya diterima. Mereka tidak dihitung dalam rata-rata kota.
          </p>
        )}
      </DashSection>
    </>
  );
}

export function KecamatanKebijakan() {
  return (
    <>
      <PageHeader
        title="Peluang per kecamatan"
        desc="Seberapa besar peluang anak dari tiap kecamatan diterima di SMA dan SMK negeri. Persentase rendah menandai wilayah yang kekurangan kursi negeri terdekat."
      />
      <DenganDashboard>{(d) => <Isi d={d} />}</DenganDashboard>
    </>
  );
}
