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

/** Satu pilihan tersimpan: id sekolah dan sub-jalurnya (null = jalur terbaik sekolah itu). */
export type Butir = { id: number; jalur: string | null };

/**
 * Isi localStorage menjadi daftar butir. Bentuk lama berupa angka saja ([12, 7]) tetap dibaca, dengan jalur terbaik;
 * bentuk baru menyertakan sub-jalur ([[12, "PRESTASI_AKD_RAPOR"], 7]).
 */
const keDaftar = (raw: string | null): Butir[] | null => {
  try {
    const v = JSON.parse(raw ?? "null") as unknown;
    if (!Array.isArray(v)) return null;
    const hasil: Butir[] = [];
    for (const x of v) {
      if (Number.isInteger(x)) hasil.push({ id: x as number, jalur: null });
      else if (Array.isArray(x) && Number.isInteger(x[0]) && typeof x[1] === "string") hasil.push({ id: x[0] as number, jalur: x[1] });
      else return null;
    }
    return hasil;
  } catch {
    return null;
  }
};

const keSimpan = (b: Butir[]) => JSON.stringify(b.slice(0, MAKS_PILIHAN).map((x) => (x.jalur ? [x.id, x.jalur] : x.id)));

/**
 * Pilihan sekolah untuk satu hasil cek (kunci = token). Tanpa susunan sendiri, memakai rekomendasi
 * strategi(): satu ambisius dan dua aman. Sekolah yang tidak ada di hasil diabaikan.
 */
export function usePilihan(token: string | null, hasil: HasilSekolah[]) {
  const kunci = token ? `sipesek:pilihan:${token}` : null;
  const raw = useNilai(kunci);
  const tersusun = keDaftar(raw);
  const perId = new Map(hasil.map((h) => [h.sekolah.id, h]));
  const pilihan: PilihanStrategi[] = tersusun
    ? tersusun.flatMap(({ id, jalur }) => {
        const h = perId.get(id);
        if (!h) return [];
        return [keStrategi(h, h.jalur.find((j) => j.subJalurKode === jalur) ?? h.jalur[0])];
      })
    : strategi(hasil);
  const butir: Butir[] = pilihan.map((p) => ({ id: p.sekolahId, jalur: p.subJalurKode }));
  const ids = butir.map((b) => b.id);

  const simpan = useCallback((baru: Butir[]) => kunci && tulis(kunci, keSimpan(baru)), [kunci]);

  return {
    pilihan,
    disusunSendiri: tersusun !== null,
    ada: (id: number) => ids.includes(id),
    penuh: ids.length >= MAKS_PILIHAN,
    /** `jalur`: sub-jalur yang dipakai (mis. dari baris tabel yang sedang difilter); tanpa ini, jalur terbaik. */
    tambah: (id: number, jalur: string | null = null) => !ids.includes(id) && ids.length < MAKS_PILIHAN && simpan([...butir, { id, jalur }]),
    hapus: (id: number) => simpan(butir.filter((b) => b.id !== id)),
    /** Ganti semua pilihan sekaligus, mis. dengan rekomendasi untuk satu jalur. */
    atur: (baru: Butir[]) => simpan(baru),
    geser: (i: number, arah: -1 | 1) => {
      const j = i + arah;
      if (j < 0 || j >= butir.length) return;
      const baru = [...butir];
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
