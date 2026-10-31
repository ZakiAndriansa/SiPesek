"use client";
import { Alert, Badge, Breadcrumb, Button, ButtonGroup, Disclaimer, PageHeader, Table } from "@/components";
import type { HasilJalur } from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";
import { angkaSkor, badgeText, KIND, namaJalur } from "@/lib/quick-check";
import { MAKS_PILIHAN, usePilihan } from "./pilihan";
import { DenganHasil, SumberHasil, type DataTahap } from "./Wadah";

/** Detail satu sekolah negeri dari hasil cek terakhir anak aktif: semua jalur beserta data pembandingnya. */
export function DetailSekolahOrtu({ id }: { id: number }) {
  return <DenganHasil>{(data) => <Isi id={id} {...data} />}</DenganHasil>;
}

const nilai = (j: HasilJalur, v: number | null) => (v === null ? "-" : j.satuan === "meter" ? formatJarak(v) : angkaSkor(v));

/** Data pembanding tahun lalu dalam satu kalimat pendek. */
function pembanding(j: HasilJalur) {
  const p = j.pembanding;
  if (!p) return "Belum ada data tahun lalu.";
  const peminat = p.pendaftar !== null ? `${p.pendaftar} pendaftar, ` : "";
  const rentang =
    j.satuan === "meter"
      ? `separuh tinggal dalam ${nilai(j, p.median)}, terjauh ${nilai(j, p.maks)}`
      : `skor terendah ${nilai(j, p.min)}, tengah ${nilai(j, p.median)}`;
  return `${p.tahun}: ${peminat}${p.diterima} diterima; ${rentang}.`;
}

function Isi({ id, aktif, terakhir, hasil }: { id: number } & DataTahap) {
  const pilihan = usePilihan(terakhir.token, hasil.hasil);
  const h = hasil.hasil.find((x) => x.sekolah.id === id);
  if (!h) {
    return (
      <Alert
        kind="info"
        title="Sekolah ini tidak ada di hasil cek"
        action={
          <Button variant="secondary" href="/peta-sekolah">
            Kembali ke Hasil Sekolah
          </Button>
        }
      >
        Hasil cek terakhir {aktif.nama} tidak memuat sekolah ini, misalnya karena jenjangnya berbeda.
      </Alert>
    );
  }
  const s = h.sekolah;
  const dipilih = pilihan.ada(s.id);
  const peta =
    s.lat !== null && s.lng !== null ? `https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=17/${s.lat}/${s.lng}` : null;

  return (
    <>
      <Breadcrumb items={[["Hasil Sekolah", "/peta-sekolah"], [s.nama]]} />
      <PageHeader
        title={s.nama}
        desc={`${s.jenjang} Negeri${s.kategori === "UNGGULAN_PROVINSI" ? " unggulan provinsi" : ""} · Kecamatan ${s.kecamatan}`}
      />
      <div className="stack stack--lg">
        <SumberHasil terakhir={terakhir} hasil={hasil} />

        <section className="card stack" aria-labelledby="d-ringkas">
          <div className="child-card__top">
            <h2 className="card__title" id="d-ringkas">
              Peluang {aktif.nama.split(" ")[0]}
            </h2>
            <Badge kind={KIND[h.labelTerbaik]}>{badgeText(h.labelTerbaik)}</Badge>
          </div>
          <p className="card__text">
            Jalur terbaik: {namaJalur(h.jalur[0])}. {h.jalur[0].kalimat}
          </p>
          <dl className="school-card__facts">
            <div>
              <dt className="school-card__fact-label">Jarak rumah (garis lurus)</dt>
              <dd className="school-card__fact-value">{h.jarakMeter === null ? "Tidak diketahui" : formatJarak(h.jarakMeter)}</dd>
            </div>
            <div>
              <dt className="school-card__fact-label">Akreditasi</dt>
              <dd className="school-card__fact-value">{s.akreditasi ?? "Tidak ada data"}</dd>
            </div>
            <div>
              <dt className="school-card__fact-label">NPSN</dt>
              <dd className="school-card__fact-value">{s.npsn}</dd>
            </div>
          </dl>
          <p className="text-secondary">{s.alamat}</p>
          <ButtonGroup>
            {dipilih ? (
              <Button variant="secondary" iconLeft="check" onClick={() => pilihan.hapus(s.id)}>
                Di pilihan · Hapus
              </Button>
            ) : (
              <Button
                variant="primary"
                iconLeft="plus"
                onClick={() => pilihan.tambah(s.id)}
                toast={
                  pilihan.penuh
                    ? { message: `Pilihan sudah ${MAKS_PILIHAN}. Hapus satu dulu di Strategi.`, variant: "info" }
                    : { message: `${s.nama} ditambahkan ke pilihan.`, variant: "success" }
                }
              >
                Tambah ke pilihan
              </Button>
            )}
            {peta && (
              <Button variant="ghost" href={peta} iconLeft="map" newTab>
                Buka di peta
              </Button>
            )}
          </ButtonGroup>
        </section>

        <section className="stack" aria-labelledby="d-jalur">
          <div className="block-head">
            <h2 className="text-heading-md" id="d-jalur">
              Semua jalur di sekolah ini
            </h2>
            <p className="text-secondary">Label tiap jalur dibandingkan dengan siswa yang diterima tahun lalu.</p>
          </div>
          <Table
            caption={`Peluang per jalur di ${s.nama}`}
            head={["Jalur", "Label", "Data tahun lalu"]}
            rows={h.jalur.map((j) => [
              <span key="j">
                <strong>{namaJalur(j)}</strong>
                <span className="table__muted"> {j.kalimat}</span>
              </span>,
              <Badge key="l" kind={KIND[j.label]}>
                {badgeText(j.label)}
              </Badge>,
              <span key="p" className="table__muted">
                {pembanding(j)}
              </span>,
            ])}
          />
        </section>

        <Disclaimer />
      </div>
    </>
  );
}
