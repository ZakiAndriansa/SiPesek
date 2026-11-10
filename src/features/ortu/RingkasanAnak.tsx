"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Dialog, ExternalLink, Icon } from "@/components";
import { ambil } from "@/lib/ambil";
import { WIZARD_TOTAL_ORTU } from "@/lib/accounts";
import type { RiwayatCek } from "@/lib/kontrak";
import { HELP_URL } from "@/lib/nav";
import { HapusHasil } from "./HapusHasil";
import { daftarBerkasUntuk } from "./DokumenOrtu";
import { HakDataOrtu } from "./HakDataOrtu";
import { bacaIsian, CEK_LAGI_HREF, hapusIsian, lanjutIsiHref } from "./isian";
import { useBerkas, usePilihan } from "./pilihan";
import { pilihAnakAktif, segarkanOrtu, useHasilAktif } from "./store";
import { GagalMuat, JudulOrtu, Memuat, SesiBerakhir, tanggalCek } from "./Wadah";

const BATAS_ANAK = 5;
const JENJANG: Record<RiwayatCek["jenjang"], string> = { SMA: "SMA", SMK: "SMK", SEMUA: "SMA dan SMK" };

/** Kalimat status dari ringkasan hasil terakhir: langsung menjawab "apakah anak aman?". */
function statusHasil(r: RiwayatCek["ringkas"]): string {
  if (r.peluangBesar > 0) return `${r.peluangBesar} sekolah negeri berpeluang besar`;
  if (r.masihMungkin > 0) return "Belum ada sekolah negeri yang aman";
  return "Peluang di sekolah negeri masih kecil";
}

/**
 * Data Anak (usulan B) untuk akun Google: anak dipilih lewat pill di samping judul, lalu dua kolom seimbang.
 * Kiri: status hasil terakhir dan satu langkah yang disarankan. Kanan: pintasan ke Hasil, Strategi, dan Dokumen
 * beserta angkanya, ditambah riwayat cek dan hapus anak yang dilipat. Privasi akun dilipat di bawah.
 */
export function RingkasanAnak() {
  const { status, anak, aktif, terakhir, hasil } = useHasilAktif();
  const pilihan = usePilihan(terakhir?.token ?? null, hasil?.hasil ?? []);
  const berkas = useBerkas(aktif?.id ?? null);
  const privasi = useRef<HTMLDetailsElement>(null);
  const [galatHapus, setGalatHapus] = useState("");

  // Tautan "Data & privasi" di menu akun membuka bagian privasi yang dilipat.
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

  const pil = (
    <div className="ortu-anak-pil" role="group" aria-label="Pilih anak">
      {anak.map((a) => (
        <button
          key={a.id}
          type="button"
          className="ortu-anak-pil__item"
          aria-pressed={a.id === aktif?.id}
          onClick={() => pilihAnakAktif(a.id)}
        >
          {a.nama}
        </button>
      ))}
      {anak.length < BATAS_ANAK && (
        <Link className="ortu-anak-pil__item ortu-anak-pil__item--tambah" href="/isi-data/1?baru=1">
          + Tambah anak
        </Link>
      )}
    </div>
  );

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
  const aman = (terakhir?.ringkas.peluangBesar ?? 0) > 0;
  const daftarBerkas = hasil ? daftarBerkasUntuk(hasil) : [];
  const siap = daftarBerkas.filter((b) => berkas.siap.includes(b.value)).length;
  const dialog = `dlg-hapus-anak-${aktif.id}`;

  // Satu langkah yang disarankan, sesuai keadaan anak.
  const saran = setengah
    ? { judul: "Lanjutkan isi data", label: `Lanjutkan isi data (langkah ${langkah + 1} dari ${WIZARD_TOTAL_ORTU})`, href: lanjutIsiHref(aktif.id) }
    : !terakhir
      ? { judul: "Isi data anak untuk melihat peluang", label: "Isi data anak", href: lanjutIsiHref(aktif.id) }
      : !aman
        ? { judul: "Langkah yang disarankan: siapkan cadangan swasta", label: swasta > 0 ? `Lihat ${swasta} swasta terdekat` : "Lihat sekolah swasta terdekat", href: "/cadangan" }
        : { judul: "Langkah berikutnya: susun urutan pilihan", label: "Lihat hasil", href: "/peta-sekolah" };

  return (
    <>
      <JudulOrtu judul="Data Anak" aksi={pil} />
      {galatHapus && <Alert kind="danger">{galatHapus}</Alert>}

      <div className={terakhir ? "ortu-dua" : undefined}>
        <section className="ortu-fokus" aria-labelledby="anak-status">
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
          {!aktif.nisnLazim && (
            <Alert kind="warning" title="NISN tidak lazim">
              Pastikan sudah benar di{" "}
              <a href="https://nisn.data.kemendikdasmen.go.id/" target="_blank" rel="noopener">
                situs resmi NISN
              </a>
              .
            </Alert>
          )}
          <h2 className="ortu-fokus__judul" id="anak-status">
            {terakhir ? statusHasil(terakhir.ringkas) : `Data ${aktif.nama} belum lengkap`}
          </h2>
          {terakhir && (
            <div className="ortu-label">
              {terakhir.ringkas.peluangBesar > 0 && <Badge kind="aman">{`Peluang besar ${terakhir.ringkas.peluangBesar}`}</Badge>}
              {terakhir.ringkas.masihMungkin > 0 && <Badge kind="bersaing">{`Masih mungkin ${terakhir.ringkas.masihMungkin}`}</Badge>}
              {terakhir.ringkas.peluangKecil > 0 && <Badge kind="berisiko">{`Peluang kecil ${terakhir.ringkas.peluangKecil}`}</Badge>}
            </div>
          )}
          <div className="ortu-saran">
            <p className="ortu-saran__judul">{saran.judul}</p>
            <div className="ortu-aksi">
              <Button variant="primary" lg href={saran.href} icon="arrow-right">
                {saran.label}
              </Button>
              {terakhir && (
                <Button variant="ghost" href={CEK_LAGI_HREF}>
                  Perbarui data
                </Button>
              )}
            </div>
          </div>
        </section>

        {terakhir && (
          <nav className="ortu-pintasan" aria-label={`Ringkasan ${aktif.nama}`}>
            <Pintasan href="/peta-sekolah" ikon="map-pin" judul="Hasil Sekolah" teks={hasil ? `${hasil.hasil.length} sekolah negeri dihitung` : "Memuat…"} />
            <Pintasan href="/strategi" ikon="clipboard" judul="Strategi" teks={hasil ? `${pilihan.pilihan.length} pilihan tersusun` : "Memuat…"} />
            <Pintasan href="/unduhan" ikon="download" judul="Dokumen" teks={hasil ? `${siap} dari ${daftarBerkas.length} berkas siap` : "Memuat…"} />
            <div className="ortu-pintasan__kaki">
              <details className="ortu-lipat">
                <summary>Riwayat cek ({aktif.riwayat.length})</summary>
                <ul className="riwayat-anak__daftar">
                  {aktif.riwayat.map((r) => (
                    <li key={r.token} className="riwayat-anak__baris">
                      <Link href={`/hasil/${r.token}`} className="riwayat-anak__tautan">
                        <span className="riwayat-anak__isi">
                          <span className="riwayat-anak__judul">{JENJANG[r.jenjang]}</span>
                          <span className="riwayat-anak__waktu">{tanggalCek(r.dibuatPada)}</span>
                        </span>
                        <Icon name="chevron-right" className="icon" />
                        <span className="visually-hidden">Buka hasil</span>
                      </Link>
                      <HapusHasil token={r.token} nama={aktif.nama} dibuatPada={r.dibuatPada} ikon />
                    </li>
                  ))}
                </ul>
              </details>
              <Button variant="ghost" sm iconLeft="trash" opens={dialog}>
                Hapus data {aktif.nama}
              </Button>
            </div>
          </nav>
        )}
      </div>

      {!terakhir && (
        <div className="ortu-bagian">
          <Button variant="ghost" sm iconLeft="trash" opens={dialog}>
            Hapus data {aktif.nama}
          </Button>
        </div>
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

function Pintasan({ href, ikon, judul, teks }: { href: string; ikon: string; judul: string; teks: string }) {
  return (
    <Link className="ortu-pintasan__baris" href={href}>
      <span className="ortu-pintasan__ikon">
        <Icon name={ikon} className="icon" />
      </span>
      <span className="ortu-pintasan__teks">
        <strong>{judul}</strong>
        <span>{teks}</span>
      </span>
      <Icon name="chevron-right" className="icon ortu-pintasan__panah" />
    </Link>
  );
}
