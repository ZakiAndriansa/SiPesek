"use client";
import { Alert, Breadcrumb, PageHeader, SchoolCard } from "@/components";
import { formatJarak } from "@/lib/peluang/jarak";
import { DenganHasil, SumberHasil, type DataTahap } from "./Wadah";

/** Sekolah swasta terdekat dari hasil cek terakhir, sebagai cadangan. Biaya hanya bila ada sumbernya. */
export function CadanganOrtu() {
  return <DenganHasil>{(data) => <Isi {...data} />}</DenganHasil>;
}

function Isi({ terakhir, hasil }: DataTahap) {
  const swasta = [...hasil.swasta.SMA, ...hasil.swasta.SMK].sort((a, b) => (a.jarakMeter ?? Infinity) - (b.jarakMeter ?? Infinity));
  return (
    <>
      <Breadcrumb items={[["Strategi", "/strategi"], ["Sekolah Cadangan"]]} />
      <PageHeader
        art="backup"
        title="Sekolah Swasta Cadangan"
        desc="Sekolah swasta terdekat dari rumah, diurutkan menurut jarak. Ditampilkan apa adanya, tanpa iklan berbayar."
      />
      <div className="stack stack--lg">
        <SumberHasil terakhir={terakhir} hasil={hasil} />
        <Alert kind="warning" title="Pendaftaran swasta umumnya dibuka lebih awal">
          Banyak SMA dan SMK swasta membuka gelombang pertama sebelum SPMB negeri. Tanyakan jadwal dan biaya langsung ke sekolah.
        </Alert>
        {swasta.length === 0 ? (
          <p className="text-secondary">Belum ada data sekolah swasta di dekat titik rumah yang dicek.</p>
        ) : (
          <div className="card-grid card-grid--3">
            {swasta.map((s) => (
              <SchoolCard
                key={s.sekolah.id}
                name={s.sekolah.nama}
                type={`${s.sekolah.jenjang} · Swasta`}
                kec={s.sekolah.kecamatan}
                kind={s.sekolah.akreditasi ? "neutral" : undefined}
                badgeText={s.sekolah.akreditasi ? `Akreditasi ${s.sekolah.akreditasi}` : undefined}
                facts={[
                  ["Jarak dari rumah", s.jarakMeter === null ? "Tidak diketahui" : formatJarak(s.jarakMeter)],
                  ["Biaya", s.biaya?.ringkas ?? "Tanyakan ke sekolah"],
                ]}
                reason={s.sekolah.alamat}
              >
                {s.biaya?.url && (
                  <a className="button button--secondary" href={s.biaya.url} target="_blank" rel="noopener">
                    Sumber biaya
                  </a>
                )}
              </SchoolCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
