"use client";
import dynamic from "next/dynamic";
import { useMemo, useState, type ChangeEvent } from "react";
import { Badge, DashSection, PageHeader, Select, Table, Toggle, Toolbar } from "@/components";
import { namaRingkas, type Dashboard } from "./data";
import type { TitikKebijakan } from "./PetaKebijakan";
import { CatatanSumber, DenganDashboard } from "./Wadah";

const PetaKebijakan = dynamic(() => import("./PetaKebijakan"), {
  ssr: false,
  loading: () => <div className="quick__map quick__map--memuat">Memuat peta…</div>,
});

const JENJANG = ["SMA dan SMK", "SMA", "SMK"];
const km = (m: number) => `${(m / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;

function Isi({ d }: { d: Dashboard }) {
  const [jenjang, setJenjang] = useState(JENJANG[0]);
  const [radius, setRadius] = useState(true);
  const titik = useMemo(
    () =>
      d.sekolah.flatMap((s): TitikKebijakan[] =>
        s.sekolah.lat !== null && s.sekolah.lng !== null && (jenjang === JENJANG[0] || s.sekolah.jenjang === jenjang)
          ? [
              {
                id: s.sekolah.id,
                nama: namaRingkas(s.sekolah.nama),
                jenjang: s.sekolah.jenjang,
                lat: s.sekolah.lat,
                lng: s.sekolah.lng,
                radius: s.radiusDomisiliMeter,
              },
            ]
          : [],
      ),
    [d.sekolah, jenjang],
  );
  const tanpaTitik = d.sekolah.filter((s) => s.sekolah.lat === null || s.sekolah.lng === null);
  const tanpaSman = d.rayon.filter((r) => r.smanReguler.length === 0);

  function ubah(e: ChangeEvent<HTMLDivElement>) {
    const t = e.target as unknown as HTMLInputElement;
    if (t.id === "f-jenjang") setJenjang(t.value);
    if (t.id === "f-radius") setRadius(t.checked);
  }

  return (
    <>
      <CatatanSumber tahun={d.tahun} />
      <DashSection
        title="Sebaran sekolah negeri"
        desc="Lingkaran menunjukkan jarak siswa terjauh yang diterima lewat Jalur Domisili tahun lalu. Wilayah di luar semua lingkaran adalah wilayah yang sulit dijangkau lewat Jalur Domisili."
      >
        <div onChange={ubah}>
          <Toolbar>
            <Select id="f-jenjang" label="Jenjang" options={JENJANG} selected={jenjang} />
            <Toggle id="f-radius" label="Tampilkan radius domisili" checked={radius} />
          </Toolbar>
        </div>
        <PetaKebijakan sekolah={titik} tampilRadius={radius} />
        <ul className="kebijakan-legenda" aria-label="Keterangan peta">
          <li>
            <span className="kebijakan-legenda__titik kebijakan-legenda__titik--sma" aria-hidden="true" /> SMA negeri
          </li>
          <li>
            <span className="kebijakan-legenda__titik kebijakan-legenda__titik--smk" aria-hidden="true" /> SMK negeri
          </li>
        </ul>
        {tanpaTitik.length > 0 && (
          <p className="text-caption text-secondary">
            Belum tampil di peta karena koordinatnya belum diisi: {tanpaTitik.map((s) => namaRingkas(s.sekolah.nama)).join(", ")}.
          </p>
        )}
      </DashSection>

      <DashSection
        title="Rayon Jalur Domisili SMA"
        desc="Tiap rayon punya kecamatan utama dan kecamatan irisan yang boleh ikut mendaftar. Rayon tanpa SMAN reguler membuat anak di kecamatan itu bergantung pada rayon tetangga."
      >
        {tanpaSman.length > 0 && (
          <p>
            <Badge kind="berisiko">{`${tanpaSman.length} rayon tanpa SMAN reguler`}</Badge>{" "}
            {tanpaSman.map((r) => `${r.nama} (kecamatan utama ${r.kecamatanUtama})`).join(", ")}.
          </p>
        )}
        <Table
          caption="Rayon Jalur Domisili SMA, kecamatan, dan SMAN reguler"
          head={["Rayon", "Kecamatan utama", "Kecamatan irisan", "SMAN reguler"]}
          rows={d.rayon.map((r) => [
            r.nama,
            r.kecamatanUtama,
            r.irisan.length ? r.irisan.join(", ") : <span className="table__muted">Tidak ada</span>,
            r.smanReguler.length ? (
              r.smanReguler.map(namaRingkas).join(", ")
            ) : (
              <Badge kind="berisiko">Tidak ada</Badge>
            ),
          ])}
        />
      </DashSection>

      <DashSection title="Radius Jalur Domisili per sekolah" desc="Diurutkan dari yang tersempit; radius sempit berarti hanya anak yang sangat dekat yang diterima.">
        <Table
          caption="Radius Jalur Domisili per sekolah"
          head={["Sekolah", "Kecamatan", "Radius domisili"]}
          rows={[...d.sekolah]
            .filter((s) => s.radiusDomisiliMeter !== null)
            .sort((a, b) => (a.radiusDomisiliMeter ?? 0) - (b.radiusDomisiliMeter ?? 0))
            .map((s) => [namaRingkas(s.sekolah.nama), s.sekolah.kecamatan, km(s.radiusDomisiliMeter ?? 0)])}
          num={[2]}
        />
      </DashSection>
    </>
  );
}

export function RayonKebijakan() {
  return (
    <>
      <PageHeader
        title="Rayon dan sebaran sekolah"
        desc="Di mana sekolah negeri berada, seberapa jauh Jalur Domisili menjangkau, dan rayon mana yang kekurangan SMAN reguler."
      />
      <DenganDashboard>{(d) => <Isi d={d} />}</DenganDashboard>
    </>
  );
}
