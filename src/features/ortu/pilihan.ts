"use client";
// Urutan pilihan sekolah (paling banyak 3) dan centang berkas, per perangkat.
// Disimpan di localStorage: ini rencana pribadi orang tua yang bisa disusun ulang kapan saja dari hasil
// tersimpan, jadi kehilangannya (ganti perangkat, data browser dihapus) hanya mengembalikan ke rekomendasi.
import { useCallback, useSyncExternalStore } from "react";
import type { HasilSekolah } from "@/lib/kontrak";
import { keStrategi, strategi, type PilihanStrategi } from "@/lib/quick-check";

export const MAKS_PILIHAN = 3;

const memori = new Map<string, string | null>();
const pendengar = new Set<() => void>();

function baca(kunci: string): string | null {
  if (memori.has(kunci)) return memori.get(kunci) ?? null;
  let nilai: string | null = null;
  try {
    nilai = localStorage.getItem(kunci);
  } catch {
    nilai = null;
  }
  memori.set(kunci, nilai);
  return nilai;
}

function tulis(kunci: string, nilai: string | null) {
  memori.set(kunci, nilai);
  try {
    if (nilai === null) localStorage.removeItem(kunci);
    else localStorage.setItem(kunci, nilai);
  } catch {
    // Penyimpanan browser diblokir: tetap berlaku selama tab terbuka.
  }
  pendengar.forEach((f) => f());
}

const langganan = (f: () => void) => {
  pendengar.add(f);
  return () => {
    pendengar.delete(f);
  };
};

function useNilai(kunci: string | null) {
  return useSyncExternalStore(
    langganan,
    () => (kunci ? baca(kunci) : null),
    () => null,
  );
}

const keDaftarAngka = (raw: string | null): number[] | null => {
  try {
    const v = JSON.parse(raw ?? "null") as unknown;
    return Array.isArray(v) && v.every((x) => Number.isInteger(x)) ? (v as number[]) : null;
  } catch {
    return null;
  }
};

/**
 * Pilihan sekolah untuk satu hasil cek (kunci = token). Tanpa susunan sendiri, memakai rekomendasi
 * strategi(): satu ambisius dan dua aman. Sekolah yang tidak ada di hasil diabaikan.
 */
export function usePilihan(token: string | null, hasil: HasilSekolah[]) {
  const kunci = token ? `sipesek:pilihan:${token}` : null;
  const raw = useNilai(kunci);
  const tersusun = keDaftarAngka(raw);
  const perId = new Map(hasil.map((h) => [h.sekolah.id, h]));
  const pilihan: PilihanStrategi[] = tersusun
    ? tersusun.flatMap((id) => {
        const h = perId.get(id);
        return h ? [keStrategi(h)] : [];
      })
    : strategi(hasil);
  const ids = pilihan.map((p) => p.sekolahId);

  const simpan = useCallback((baru: number[]) => kunci && tulis(kunci, JSON.stringify(baru.slice(0, MAKS_PILIHAN))), [kunci]);

  return {
    pilihan,
    disusunSendiri: tersusun !== null,
    ada: (id: number) => ids.includes(id),
    penuh: ids.length >= MAKS_PILIHAN,
    tambah: (id: number) => !ids.includes(id) && ids.length < MAKS_PILIHAN && simpan([...ids, id]),
    hapus: (id: number) => simpan(ids.filter((x) => x !== id)),
    geser: (i: number, arah: -1 | 1) => {
      const j = i + arah;
      if (j < 0 || j >= ids.length) return;
      const baru = [...ids];
      [baru[i], baru[j]] = [baru[j], baru[i]];
      simpan(baru);
    },
    kembalikan: () => kunci && tulis(kunci, null),
  };
}

/** Berkas yang sudah dicentang untuk satu anak. */
export function useBerkas(anakId: number | null) {
  const kunci = anakId ? `sipesek:berkas:${anakId}` : null;
  const raw = useNilai(kunci);
  let siap: string[] = [];
  try {
    const v = JSON.parse(raw ?? "[]") as unknown;
    if (Array.isArray(v)) siap = v.filter((x): x is string => typeof x === "string");
  } catch {
    siap = [];
  }
  return {
    siap,
    ubah: (nilai: string, centang: boolean) =>
      kunci && tulis(kunci, JSON.stringify(centang ? [...new Set([...siap, nilai])] : siap.filter((x) => x !== nilai))),
  };
}

/** Buang susunan pilihan untuk hasil yang sudah dihapus. */
export const hapusPilihan = (token: string) => tulis(`sipesek:pilihan:${token}`, null);

/** Kosongkan salinan memori (dipanggil setelah localStorage dibersihkan saat keluar). */
export const lupakanPilihan = () => memori.clear();
