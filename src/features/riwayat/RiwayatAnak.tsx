"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Dialog, Icon } from "@/components";
import type { RiwayatCek } from "@/lib/kontrak";
import { lupakanSesi } from "@/lib/session-actions";
import { bacaIsian, hapusIsian, lanjutIsiHref } from "@/features/ortu/isian";
import { pilihAnakAktif, segarkanOrtu, useOrtu, type AnakOrtu } from "@/features/ortu/store";
import { WIZARD_TOTAL_ORTU } from "@/lib/accounts";

const BATAS_ANAK = 5;
const JENJANG: Record<RiwayatCek["jenjang"], string> = { SMA: "SMA", SMK: "SMK", SEMUA: "SMA dan SMK" };
const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Anak dan riwayat cek yang benar-benar tersimpan di akun Google, dari data bersama di features/ortu/store
 * (sama dengan pemilih anak di navbar). Hapus anak memanggil DELETE /api/ortu/anak/[id] lalu memuat ulang.
 */
export function RiwayatAnak() {
  const router = useRouter();
  const { status, anak, aktif } = useOrtu();
  const [galatHapus, setGalatHapus] = useState("");

  async function hapus(id: number) {
    setGalatHapus("");
    const res = await fetch(`/api/ortu/anak/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return setGalatHapus("Data anak belum bisa dihapus. Periksa internet, lalu coba lagi.");
    hapusIsian(id);
    await segarkanOrtu();
  }

  if (status === "memuat") {
    return (
      <div className="card" aria-busy="true">
        <p className="text-secondary">Memuat data anak…</p>
      </div>
    );
  }
  if (status === "belum-masuk") {
    return (
      <Alert
        kind="info"
        title="Sesi masuk sudah berakhir"
        action={
          <Button
            variant="secondary"
            onClick={async () => {
              await lupakanSesi();
              router.push("/masuk?next=%2Fanak-saya");
            }}
          >
            Masuk lagi dengan Google
          </Button>
        }
      >
        Masuk lagi untuk melihat data anak dan riwayat cek yang tersimpan.
      </Alert>
    );
  }
  if (status === "galat") {
    return (
      <Alert kind="danger" title="Data anak belum bisa dimuat">
        Tidak tersambung ke server SiPesek. Periksa internet, lalu muat ulang halaman ini.
      </Alert>
    );
  }

  if (anak.length === 0) {
    return (
      <div className="card empty-state">
        <h2 className="card__title">Belum ada data anak</h2>
        <p className="card__text">
          Isi data anak dalam 4 langkah (sekitar 5 menit), atau coba Cek Cepat lalu tekan Simpan di akhir hasil. Anak dan
          hasilnya langsung muncul di sini.
        </p>
        <div className="button-group">
          <Button variant="primary" lg href="/isi-data/1?baru=1" icon="arrow-right">
            Isi data anak
          </Button>
          <Button variant="secondary" lg href="/cek-cepat">
            Coba Cek Cepat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="riwayat-anak">
      {galatHapus && <Alert kind="danger">{galatHapus}</Alert>}
      {anak.map((a) => (
        <KartuAnak
          key={a.id}
          a={a}
          aktif={a.id === aktif?.id}
          onHapus={() => hapus(a.id)}
          onBuka={(tujuan) => {
            pilihAnakAktif(a.id);
            router.push(tujuan);
          }}
        />
      ))}
      {anak.length < BATAS_ANAK ? (
        <Button variant="secondary" block href="/isi-data/1?baru=1" iconLeft="plus">
          Tambah anak
        </Button>
      ) : (
        <p className="text-secondary">Satu akun paling banyak {BATAS_ANAK} anak. Hapus salah satu untuk menambah anak lain.</p>
      )}
    </div>
  );
}

function KartuAnak({
  a,
  aktif,
  onHapus,
  onBuka,
}: {
  a: AnakOrtu;
  aktif: boolean;
  onHapus: () => void;
  onBuka: (tujuan: string) => void;
}) {
  // Isian wizard di perangkat ini: dipakai untuk "Lanjutkan isi data" (langkah terakhir yang tersimpan).
  const langkah = bacaIsian(a.id)?.langkah ?? 0;
  const setengah = langkah > 0 && langkah < WIZARD_TOTAL_ORTU;
  const dialog = `dlg-hapus-anak-${a.id}`;
  return (
    <article className={`card riwayat-anak__kartu${aktif ? " child-card--active" : ""}`}>
      <div className="child-card__top">
        <h2 className="card__title">{a.nama}</h2>
        {aktif && <span className="badge badge--brand">Sedang dilihat</span>}
      </div>
      <p className="riwayat-anak__nisn">
        NISN berakhiran {a.nisnAkhir} · {a.riwayat.length} hasil tersimpan
      </p>
      {!a.nisnLazim && (
        <Alert kind="warning" title="NISN tidak lazim">
          NISN ini tidak lazim untuk calon siswa SMA atau SMK. Pastikan sudah benar di{" "}
          <a href="https://nisn.data.kemendikdasmen.go.id/" target="_blank" rel="noopener">
            situs resmi NISN
          </a>
          .
        </Alert>
      )}

      {a.riwayat.length === 0 ? (
        <p className="text-secondary">Belum ada hasil tersimpan untuk anak ini.</p>
      ) : (
        <ul className="riwayat-anak__daftar">
          {a.riwayat.map((r) => (
            <li key={r.token}>
              <Link href={`/hasil/${r.token}`} className="riwayat-anak__tautan">
                <span className="riwayat-anak__isi">
                  <span className="riwayat-anak__judul">
                    {JENJANG[r.jenjang]}
                    {r.kecamatan && `, KK ${r.kecamatan}`}
                  </span>
                  <span className="riwayat-anak__waktu">
                    {tanggal(r.dibuatPada)} · acuan SPMB {r.tahunAcuan}
                  </span>
                  <span className="riwayat-anak__label">
                    {r.ringkas.peluangBesar > 0 && <Badge kind="aman">{`Peluang besar ${r.ringkas.peluangBesar}`}</Badge>}
                    {r.ringkas.masihMungkin > 0 && <Badge kind="bersaing">{`Masih mungkin ${r.ringkas.masihMungkin}`}</Badge>}
                    {r.ringkas.peluangKecil > 0 && <Badge kind="berisiko">{`Peluang kecil ${r.ringkas.peluangKecil}`}</Badge>}
                  </span>
                </span>
                <Icon name="chevron-right" className="icon" />
                <span className="visually-hidden">Buka hasil</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="button-group">
        {a.riwayat.length > 0 && !setengah ? (
          <Button variant="primary" icon="arrow-right" onClick={() => onBuka("/peta-sekolah")}>
            Lihat hasil, strategi, dan dokumen
          </Button>
        ) : (
          <Button variant="primary" icon="arrow-right" onClick={() => onBuka(lanjutIsiHref(a.id))}>
            {setengah ? `Lanjutkan isi data (langkah ${langkah + 1} dari ${WIZARD_TOTAL_ORTU})` : "Isi data anak"}
          </Button>
        )}
        {a.riwayat.length > 0 && (
          <Button variant="secondary" onClick={() => onBuka(setengah ? "/peta-sekolah" : "/isi-data/1")}>
            {setengah ? "Lihat hasil terakhir" : "Perbarui data dan cek lagi"}
          </Button>
        )}
        <Button variant="ghost" iconLeft="trash" opens={dialog}>
          Hapus data anak
        </Button>
      </div>

      <Dialog
        id={dialog}
        title={`Hapus data ${a.nama}?`}
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" closes onClick={onHapus}>
              Ya, hapus permanen
            </Button>
          </>
        }
      >
        <p>
          Nama, NISN tersandi, dan {a.riwayat.length} hasil cek {a.nama} terhapus permanen dari SiPesek. Tindakan ini tidak
          bisa dibatalkan.
        </p>
      </Dialog>
    </article>
  );
}
