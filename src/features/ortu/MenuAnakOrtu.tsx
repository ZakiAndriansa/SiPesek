"use client";
import Link from "next/link";
import { Icon } from "@/components";
import { Menu } from "@/components/navbar/Menu";
import { pilihAnakAktif, useOrtu } from "./store";

const namaDepan = (nama: string) => nama.split(" ")[0];

/** Pemilih anak di navbar untuk akun Google: anak dan jumlah hasil dari database, bukan data prototipe. */
export function MenuAnakOrtu() {
  const { status, anak, aktif } = useOrtu();
  return (
    <Menu
      id="menu-anak"
      label={aktif ? `Anak yang dilihat: ${aktif.nama}. Ganti anak` : "Pilih anak"}
      trigger={
        <span className="navbar__child">
          <span className="navbar__child-hint">Anak</span>
          <span className="navbar__child-name">{aktif ? namaDepan(aktif.nama) : status === "memuat" ? "Memuat" : "Belum ada"}</span>
        </span>
      }
    >
      <p className="menu__head">
        <strong>Lihat data anak</strong>
        <span>Hasil, strategi, dan dokumen mengikuti anak yang dipilih.</span>
      </p>
      {anak.map((a) => (
        <button
          key={a.id}
          type="button"
          className="menu__item menu__item--child"
          aria-current={a.id === aktif?.id ? "true" : undefined}
          onClick={() => pilihAnakAktif(a.id)}
        >
          <span>
            <strong>{a.nama}</strong>
            <small>{a.riwayat.length > 0 ? `${a.riwayat.length} hasil tersimpan` : "Belum ada hasil"}</small>
          </span>
          {a.id === aktif?.id && <Icon name="check" className="icon icon--sm" />}
        </button>
      ))}
      <hr className="menu__sep" />
      <Link className="menu__item" href="/isi-data/1?baru=1">
        <Icon name="plus" className="icon icon--sm" />
        Tambah anak
      </Link>
    </Menu>
  );
}
