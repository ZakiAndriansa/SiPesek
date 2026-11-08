"use client";
// Data asli orang tua yang masuk dengan Google: daftar anak, riwayat cek, dan hasil cek terakhir.
// Diambil di klien (fetch ke /api) agar cookie sesi ikut terkirim ke homeserver, lalu disimpan di memori
// modul supaya navbar dan halaman tahap memakai data yang sama tanpa mengambil ulang tiap pindah halaman.
import { useEffect, useSyncExternalStore } from "react";
import { ambil } from "@/lib/ambil";
import type { AnakRingkas, ResponsAnak, ResponsPeluang, RiwayatCek } from "@/lib/kontrak";
import { lupakanIsian } from "./isian";
import { hapusPilihan, lupakanPilihan } from "./pilihan";

export type AnakOrtu = AnakRingkas & { riwayat: RiwayatCek[] };
export type StatusOrtu = "memuat" | "ada" | "belum-masuk" | "galat";

type Keadaan = {
  status: StatusOrtu;
  anak: AnakOrtu[];
  aktifId: number | null;
  /** Hasil per token cek; undefined = belum diambil atau sedang diambil, null = gagal diambil. */
  hasil: Record<string, ResponsPeluang | null | undefined>;
};

const KUNCI_AKTIF = "sipesek:anak-aktif";

let keadaan: Keadaan = { status: "memuat", anak: [], aktifId: null, hasil: {} };
let sedangMuat: Promise<void> | null = null;
let sudahMuat = false;
// Naik setiap kali data dimuat ulang atau dilupakan. Jawaban dari muatan yang lebih lama diabaikan, sehingga
// jawaban lambat tidak menimpa data terbaru, dan data akun lama tidak muncul lagi setelah keluar.
let versi = 0;
const hasilDiminta = new Map<string, Promise<void>>();
const pendengar = new Set<() => void>();

function ubah(baru: Partial<Keadaan>) {
  keadaan = { ...keadaan, ...baru };
  pendengar.forEach((f) => f());
}

// Anak yang sedang dilihat hanya kenyamanan per perangkat, jadi cukup di localStorage.
function bacaAktif(): number | null {
  try {
    const v = Number(localStorage.getItem(KUNCI_AKTIF));
    return Number.isInteger(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function tulisAktif(id: number | null) {
  try {
    if (id === null) localStorage.removeItem(KUNCI_AKTIF);
    else localStorage.setItem(KUNCI_AKTIF, String(id));
  } catch {
    // Penyimpanan browser diblokir: pilihan anak berlaku sampai tab ditutup.
  }
}

/** Anak aktif: pilihan terakhir bila masih ada, selain itu anak pertama yang punya hasil, lalu anak pertama. */
function tentukanAktif(anak: AnakOrtu[], pilihan: number | null) {
  if (pilihan !== null && anak.some((a) => a.id === pilihan)) return pilihan;
  return (anak.find((a) => a.riwayat.length > 0) ?? anak[0])?.id ?? null;
}

async function ambilSemua(v: number) {
  const gagal = () => {
    // Data yang sudah tampil tetap dipakai; galat hanya bila belum ada data sama sekali.
    if (v === versi && keadaan.status !== "ada") ubah({ status: "galat" });
  };
  try {
    // Satu panggilan untuk anak sekaligus riwayatnya, bukan satu panggilan per anak.
    const res = await ambil("/api/ortu/anak?riwayat=1");
    if (v !== versi) return;
    if (res.status === 401) return ubah({ status: "belum-masuk", anak: [], aktifId: null });
    if (!res.ok) return gagal();
    const daftar = ((await res.json()) as ResponsAnak).anak;
    if (v !== versi) return;
    const anak = daftar.map((a) => ({ ...a, riwayat: a.riwayat ?? [] }));
    ubah({ status: "ada", anak, aktifId: tentukanAktif(anak, keadaan.aktifId ?? bacaAktif()) });
  } catch {
    gagal();
  }
}

/** Ambil ulang daftar anak dan riwayat (setelah simpan atau hapus). */
export function segarkanOrtu() {
  sudahMuat = true;
  const muat = ambilSemua(++versi).finally(() => {
    if (sedangMuat === muat) sedangMuat = null;
  });
  sedangMuat = muat;
  return muat;
}

function pastikanMuat() {
  if (!sudahMuat && !sedangMuat) void segarkanOrtu();
}

/**
 * Lupakan data akun ini dari memori tab. Dipanggil saat keluar dan saat masuk, karena keduanya pindah halaman
 * tanpa memuat ulang tab: tanpa ini, akun berikutnya di tab yang sama sempat melihat anak akun sebelumnya.
 * Saat keluar (`perangkat`), isian wizard, pilihan, dan centang berkas di perangkat ini ikut dihapus.
 */
export function lupakanDataOrtu({ perangkat = false }: { perangkat?: boolean } = {}) {
  versi++;
  sudahMuat = false;
  sedangMuat = null;
  hasilDiminta.clear();
  tulisAktif(null);
  lupakanIsian();
  if (perangkat) {
    lupakanPilihan();
    try {
      for (const k of Object.keys(localStorage)) if (k.startsWith("sipesek:")) localStorage.removeItem(k);
    } catch {
      // Penyimpanan browser diblokir: tidak ada yang tersimpan.
    }
  }
  ubah({ status: "memuat", anak: [], aktifId: null, hasil: {} });
}

/** Ganti anak yang sedang dilihat. */
export function pilihAnakAktif(id: number) {
  tulisAktif(id);
  ubah({ aktifId: id });
}

/** Tandai data perlu diambil ulang saat dipakai berikutnya (misal setelah menyimpan hasil baru). */
export function tandaiUsang(aktifId?: number) {
  sudahMuat = false;
  if (aktifId !== undefined) {
    tulisAktif(aktifId);
    keadaan = { ...keadaan, aktifId };
  }
}

/**
 * Hapus satu hasil dari riwayat (DELETE /api/hasil/[token]), lalu ambil ulang daftar anak. Halaman tahap
 * otomatis memakai hasil sebelumnya bila yang dihapus adalah hasil terakhir.
 */
export async function hapusHasil(token: string): Promise<"ok" | "belum-masuk" | "galat"> {
  const res = await ambil(`/api/hasil/${encodeURIComponent(token)}`, { method: "DELETE" }).catch(() => null);
  if (res?.status === 401) return "belum-masuk";
  // 404: sudah terhapus (misal dari tab lain), jadi cukup dibersihkan dari tampilan.
  if (!res || (!res.ok && res.status !== 404)) return "galat";
  hapusPilihan(token);
  const sisa = { ...keadaan.hasil };
  delete sisa[token];
  keadaan = { ...keadaan, hasil: sisa };
  await segarkanOrtu();
  return "ok";
}

/**
 * Pastikan hasil satu cek ada di memori. Diambil bila belum ada, atau bila percobaan sebelumnya gagal: satu
 * kegagalan (misal server baru bangun) tidak membuat halaman macet sampai tab dimuat ulang.
 */
export function pastikanHasil(token: string): Promise<void> {
  if (keadaan.hasil[token]) return Promise.resolve();
  const berjalan = hasilDiminta.get(token);
  if (berjalan) return berjalan;
  const v = versi;
  if (keadaan.hasil[token] === null) ubah({ hasil: { ...keadaan.hasil, [token]: undefined } }); // tampilkan "Memuat" lagi
  const muat = (async () => {
    let hasil: ResponsPeluang | null = null;
    try {
      const res = await ambil(`/api/hasil/${encodeURIComponent(token)}`);
      if (res.ok) hasil = (await res.json()) as ResponsPeluang;
    } catch {
      hasil = null;
    }
    if (v === versi) ubah({ hasil: { ...keadaan.hasil, [token]: hasil } });
  })().finally(() => {
    if (hasilDiminta.get(token) === muat) hasilDiminta.delete(token);
  });
  hasilDiminta.set(token, muat);
  return muat;
}

const langganan = (f: () => void) => {
  pendengar.add(f);
  return () => {
    pendengar.delete(f);
  };
};
const potret = () => keadaan;
/** Keadaan saat ini tanpa React (untuk tes dan diagnosa). */
export const bacaKeadaanOrtu = () => keadaan;
const potretServer = () => keadaan;

/** Daftar anak dan anak aktif. Memicu pengambilan data saat pertama dipakai. */
export function useOrtu() {
  const k = useSyncExternalStore(langganan, potret, potretServer);
  useEffect(pastikanMuat, []);
  const aktif = k.anak.find((a) => a.id === k.aktifId) ?? null;
  return { status: k.status, anak: k.anak, aktif };
}

/** Anak aktif beserta hasil cek terakhirnya (diambil dari GET /api/hasil/[token]). */
export function useHasilAktif() {
  const { status, anak, aktif } = useOrtu();
  const terakhir = aktif?.riwayat[0] ?? null;
  const hasil = useSyncExternalStore(
    langganan,
    () => (terakhir ? keadaan.hasil[terakhir.token] : undefined),
    () => undefined,
  );
  // Juga mencoba lagi hasil yang sebelumnya gagal setiap kali halaman tahap dibuka.
  useEffect(() => {
    if (terakhir) void pastikanHasil(terakhir.token);
  }, [terakhir]);
  return { status, anak, aktif, terakhir, hasil };
}
