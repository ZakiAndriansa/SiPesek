"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Dialog, ExternalLink, Icon } from "@/components";
import { Menu } from "@/components/navbar/Menu";
import { ambil } from "@/lib/ambil";
import { WIZARD_TOTAL_ORTU } from "@/lib/accounts";
import { openDialog } from "@/lib/dialog";
import type { RiwayatCek } from "@/lib/kontrak";
import { HELP_URL } from "@/lib/nav";
import { HapusHasil } from "./HapusHasil";
import { HakDataOrtu } from "./HakDataOrtu";
import { bacaIsian, CEK_LAGI_HREF, hapusIsian, lanjutIsiHref } from "./isian";
import { pilihAnakAktif, segarkanOrtu, useHasilAktif } from "./store";
import { GagalMuat, JudulOrtu, Memuat, SesiBerakhir, tanggalCek } from "./Wadah";

const BATAS_ANAK = 5;
const JENJANG: Record<RiwayatCek["jenjang"], string> = { SMA: "SMA", SMK: "SMK", SEMUA: "SMA dan SMK" };

/** Kalimat status dari ringkasan hasil terakhir: langsung menjawab "apakah anak aman?". */
function statusHasil(r: RiwayatCek["ringkas"]): { judul: string; teks: string } {
  if (r.peluangBesar > 0) return { judul: `${r.peluangBesar} sekolah negeri berpeluang besar`, teks: "Ada pilihan aman. Susun urutan pilihan di Strategi." };
  if (r.masihMungkin > 0) return { judul: "Belum ada sekolah negeri yang aman", teks: "Siapkan sekolah swasta sebagai cadangan." };
  return { judul: "Peluang di sekolah negeri masih kecil", teks: "Siapkan sekolah swasta terdekat sebagai cadangan." };
}

/**
 * Data Anak (usulan A) untuk akun Google: satu kartu fokus untuk anak yang sedang dilihat, dibagi dua sisi seimbang.
 * Kiri: jawaban (status hasil terakhir). Kanan: angka per label dan satu aksi utama. Aksi lain (perbarui, riwayat,
 * hapus) ada di menu Kelola, anak lain di bawah kartu, dan privasi akun dilipat di bagian bawah.
 */
export function RingkasanAnak() {
  const { status, anak, aktif, terakhir, hasil } = useHasilAktif();
  const privasi = useRef<HTMLDetailsElement>(null);
  const [riwayat, setRiwayat] = useState(false);
  const [galatHapus, setGalatHapus] = useState("");

  // Tautan "Data dan privasi" di menu akun membuka bagian privasi yang dilipat.
  useEffect(() => {
    if (window.location.hash === "#privasi" && privasi.current) privasi.current.open = true;
  }, []);

  if (status === "memuat") return <Memuat teks="Memuat data anak…" />;
  if (status === "belum-masuk") return <SesiBerakhir />;
  if (status === "galat") return <GagalMuat />;

  async function hapus(id: number) {
    setGalatHapus("");
    const res = await ambil(`/api/ortu/anak/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return setGalatHapus("Data anak belum bisa dihapus. Periksa internet, lalu coba lagi.");
    hapusIsian(id);
    await segarkanOrtu();
  }

  const kaki = (
    <>
      <details className="ortu-lipat ortu-bagian" id="privasi" ref={privasi}>
        <summary>Data dan privasi akun</summary>
        <HakDataOrtu />
      </details>
      <p className="ortu-lanjut__catatan ortu-lanjut">
        Butuh bantuan mengisi data? <ExternalLink href={HELP_URL}>Chat lewat WhatsApp</ExternalLink>
      </p>
    </>
  );

  if (anak.length === 0 || !aktif) {
    return (
      <>
        <JudulOrtu judul="Data Anak" />
        <section className="ortu-fokus">
          <h2 className="ortu-fokus__judul">Belum ada data anak</h2>
          <p className="ortu-fokus__teks">Isi data anak dalam 4 langkah, atau coba Cek Cepat lalu tekan Simpan di akhir hasil.</p>
          <div className="ortu-aksi">
            <Button variant="primary" lg href="/isi-data/1?baru=1" icon="arrow-right">
              Isi data anak
            </Button>
            <Button variant="secondary" lg href="/cek-cepat">
              Coba Cek Cepat
            </Button>
          </div>
        </section>
        {kaki}
      </>
    );
  }

  // Isian wizard di perangkat ini: dipakai untuk "Lanjutkan isi data" (langkah terakhir yang tersimpan).
  const langkah = bacaIsian(aktif.id)?.langkah ?? 0;
  const setengah = langkah > 0 && langkah < WIZARD_TOTAL_ORTU;
  const swasta = hasil ? hasil.swasta.SMA.length + hasil.swasta.SMK.length : 0;
  const r = terakhir?.ringkas;
  const st = r ? statusHasil(r) : null;
  const dialog = `dlg-hapus-anak-${aktif.id}`;
  const lain = anak.filter((a) => a.id !== aktif.id);

  // Satu aksi utama sesuai keadaan anak, dan satu tautan kedua bila perlu.
  const utama = setengah
    ? { label: `Lanjutkan isi data (langkah ${langkah + 1} dari ${WIZARD_TOTAL_ORTU})`, href: lanjutIsiHref(aktif.id) }
    : !r
      ? { label: "Isi data anak", href: lanjutIsiHref(aktif.id) }
      : r.peluangBesar === 0
        ? { label: swasta > 0 ? `Lihat ${swasta} swasta terdekat` : "Lihat sekolah swasta terdekat", href: "/cadangan" }
        : { label: "Lihat hasil", href: "/peta-sekolah" };
  // Tautan kedua: hasil semua sekolah bila aksi utama bukan ke sana; bila sudah aman, cadangan swasta tetap ditawarkan.
  const kedua = !r
    ? null
    : utama.href !== "/peta-sekolah"
      ? { label: "Lihat hasil semua sekolah", href: "/peta-sekolah" }
      : swasta > 0
        ? { label: `Cadangan: ${swasta} swasta terdekat`, href: "/cadangan" }
        : null;

  return (
    <>
      <JudulOrtu judul="Data Anak" konteks={anak.length > 1 ? "Pilih anak untuk melihat hasilnya." : undefined} />
      {galatHapus && <Alert kind="danger">{galatHapus}</Alert>}

      <article className="ortu-anak" aria-labelledby="anak-nama">
        <header className="ortu-anak__kepala">
          <div>
            <h2 className="ortu-anak__nama" id="anak-nama">
              {aktif.nama}
            </h2>
            <p className="ortu-meta">
              {[
                terakhir && JENJANG[terakhir.jenjang],
                terakhir?.kecamatan && `KK ${terakhir.kecamatan}`,
                `NISN berakhiran ${aktif.nisnAkhir}`,
                terakhir && `cek ${tanggalCek(terakhir.dibuatPada)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Menu id={`menu-anak-${aktif.id}`} label={`Kelola data ${aktif.nama}`} trigger={<span>Kelola</span>}>
            <Link className="menu__item" href={setengah ? lanjutIsiHref(aktif.id) : CEK_LAGI_HREF}>
              <Icon name="refresh" className="icon icon--sm" />
              {setengah ? "Lanjutkan isi data" : "Perbarui data dan cek lagi"}
            </Link>
            {aktif.riwayat.length > 0 && (
              <button type="button" className="menu__item" onClick={() => setRiwayat(true)}>
                <Icon name="clipboard" className="icon icon--sm" />
                Riwayat cek ({aktif.riwayat.length})
              </button>
            )}
            <button type="button" className="menu__item" onClick={(e) => openDialog(dialog, e.currentTarget)}>
              <Icon name="trash" className="icon icon--sm" />
              Hapus data anak
            </button>
          </Menu>
        </header>

        {!aktif.nisnLazim && (
          <div className="ortu-anak__peringatan">
            <Alert kind="warning" title="NISN tidak lazim">
              Pastikan sudah benar di{" "}
              <a href="https://nisn.data.kemendikdasmen.go.id/" target="_blank" rel="noopener">
                situs resmi NISN
              </a>
              .
            </Alert>
          </div>
        )}

        <div className="ortu-anak__isi">
          <div className="ortu-anak__status">
            <p className="ortu-meta">{r ? "Hasil cek terakhir" : "Data anak"}</p>
            <p className="ortu-fokus__judul">{st ? st.judul : `Data ${aktif.nama} belum lengkap`}</p>
            <p className="ortu-fokus__teks">{st ? st.teks : "Lengkapi data untuk melihat peluang di sekolah negeri."}</p>
          </div>
          <div className="ortu-anak__aksi">
            {r && (
              <div className="ortu-mini">
                <span className="ortu-mini__angka ortu-mini__angka--aman">
                  <b>{r.peluangBesar}</b>Peluang besar
                </span>
                <span className="ortu-mini__angka ortu-mini__angka--bersaing">
                  <b>{r.masihMungkin}</b>Masih mungkin
                </span>
                <span className="ortu-mini__angka ortu-mini__angka--berisiko">
                  <b>{r.peluangKecil}</b>Peluang kecil
                </span>
              </div>
            )}
            <Button variant="primary" lg block href={utama.href} icon="arrow-right">
              {utama.label}
            </Button>
            {kedua && (
              <Link className="link ortu-anak__kedua" href={kedua.href}>
                {kedua.label}
              </Link>
            )}
          </div>
        </div>
      </article>

      {riwayat && (
        <section className="ortu-bagian" aria-labelledby="riwayat-judul">
          <div className="ortu-alat">
            <h2 className="ortu-bagian__judul" id="riwayat-judul">
              Riwayat cek {aktif.nama}
            </h2>
            <Button variant="ghost" sm onClick={() => setRiwayat(false)}>
              Tutup
            </Button>
          </div>
          <ul className="riwayat-anak__daftar">
            {aktif.riwayat.map((c) => (
              <li key={c.token} className="riwayat-anak__baris">
                <Link href={`/hasil/${c.token}`} className="riwayat-anak__tautan">
                  <span className="riwayat-anak__isi">
                    <span className="riwayat-anak__judul">
                      {JENJANG[c.jenjang]}
                      {c.kecamatan && `, KK ${c.kecamatan}`}
                    </span>
                    <span className="riwayat-anak__waktu">{tanggalCek(c.dibuatPada)}</span>
                  </span>
                  <Icon name="chevron-right" className="icon" />
                  <span className="visually-hidden">Buka hasil</span>
                </Link>
                <HapusHasil token={c.token} nama={aktif.nama} dibuatPada={c.dibuatPada} ikon />
              </li>
            ))}
          </ul>
        </section>
      )}

      {lain.length > 0 && (
        <section className="ortu-bagian" aria-labelledby="anak-lain">
          <h2 className="ortu-bagian__judul" id="anak-lain">
            Anak lain
          </h2>
          <ul className="ortu-anak-lain">
            {lain.map((a) => (
              <li key={a.id}>
                <span>
                  <strong>{a.nama}</strong>
                  <small>{a.riwayat.length > 0 ? `cek ${tanggalCek(a.riwayat[0].dibuatPada)}` : "belum ada hasil"}</small>
                </span>
                <Button variant="secondary" sm onClick={() => pilihAnakAktif(a.id)}>
                  Lihat
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {anak.length < BATAS_ANAK ? (
        <p className="ortu-bagian">
          <Link className="link ortu-saran__judul" href="/isi-data/1?baru=1">
            + Tambah anak
          </Link>
        </p>
      ) : (
        <p className="ortu-meta ortu-bagian">Satu akun paling banyak {BATAS_ANAK} anak.</p>
      )}

      <Dialog
        id={dialog}
        title={`Hapus data ${aktif.nama}?`}
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button variant="primary" closes onClick={() => void hapus(aktif.id)}>
              Ya, hapus permanen
            </Button>
          </>
        }
      >
        <p>
          Nama, NISN tersandi, dan {aktif.riwayat.length} hasil cek {aktif.nama} terhapus permanen dari SiPesek. Tindakan ini
          tidak bisa dibatalkan.
        </p>
      </Dialog>

      {kaki}
    </>
  );
}
