"use client";
// Data asli orang tua yang masuk dengan Google: daftar anak, riwayat cek, dan hasil cek terakhir.
// Diambil di klien (fetch ke /api) agar cookie sesi ikut terkirim ke homeserver, lalu disimpan di memori
// modul supaya navbar dan halaman tahap memakai data yang sama tanpa mengambil ulang tiap pindah halaman.
import { useEffect, useSyncExternalStore } from "react";
import type { AnakRingkas, ResponsAnak, ResponsPeluang, ResponsRiwayat, RiwayatCek } from "@/lib/kontrak";
import { lupakanIsian } from "./isian";
import { lupakanPilihan } from "./pilihan";

export type AnakOrtu = AnakRingkas & { riwayat: RiwayatCek[] };
export type StatusOrtu = "memuat" | "ada" | "belum-masuk" | "galat";

type Keadaan = {
  status: StatusOrtu;
  anak: AnakOrtu[];
  aktifId: number | null;
  /** Hasil per token cek; undefined = belum diambil, null = gagal diambil. */
  hasil: Record<string, ResponsPeluang | null | undefined>;
};

const KUNCI_AKTIF = "sipesek:anak-aktif";

let keadaan: Keadaan = { status: "memuat", anak: [], aktifId: null, hasil: {} };
let sedangMuat: Promise<void> | null = null;
let sudahMuat = false;
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

async function ambilSemua() {
  try {
    const res = await fetch("/api/ortu/anak");
    if (res.status === 401) return ubah({ status: "belum-masuk", anak: [], aktifId: null });
    if (!res.ok) return ubah({ status: "galat" });
    const daftar = ((await res.json()) as ResponsAnak).anak;
    const anak = await Promise.all(
      daftar.map(async (a) => {
        const r = await fetch(`/api/ortu/riwayat?anakId=${a.id}`);
        return { ...a, riwayat: r.ok ? ((await r.json()) as ResponsRiwayat).riwayat : [] };
      }),
    );
    ubah({ status: "ada", anak, aktifId: tentukanAktif(anak, keadaan.aktifId ?? bacaAktif()) });
  } catch {
    ubah({ status: "galat" });
  }
}

/** Ambil ulang daftar anak dan riwayat (setelah simpan atau hapus). */
export function segarkanOrtu() {
  sudahMuat = true;
  sedangMuat = ambilSemua().finally(() => {
    sedangMuat = null;
  });
  return sedangMuat;
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
  sudahMuat = false;
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

const hasilDiminta = new Set<string>();

async function ambilHasil(token: string) {
  if (hasilDiminta.has(token)) return;
  hasilDiminta.add(token);
  try {
    const res = await fetch(`/api/hasil/${encodeURIComponent(token)}`);
    ubah({ hasil: { ...keadaan.hasil, [token]: res.ok ? ((await res.json()) as ResponsPeluang) : null } });
  } catch {
    ubah({ hasil: { ...keadaan.hasil, [token]: null } });
  } finally {
    hasilDiminta.delete(token);
  }
}

const langganan = (f: () => void) => {
  pendengar.add(f);
  return () => {
    pendengar.delete(f);
  };
};
const potret = () => keadaan;
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
  useEffect(() => {
    if (terakhir && keadaan.hasil[terakhir.token] === undefined) void ambilHasil(terakhir.token);
  }, [terakhir]);
  return { status, anak, aktif, terakhir, hasil };
}
