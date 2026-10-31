"use client";
// Data dashboard kebijakan dari GET /api/dashboard (publik, agregat, tanpa data pribadi).
// Diambil di klien sekali per tab lalu disimpan di memori modul, supaya pindah halaman dashboard tidak mengambil ulang.
import { useEffect, useSyncExternalStore } from "react";
import type { ResponsDashboard } from "@/lib/kontrak";

export type Dashboard = ResponsDashboard;
type Keadaan = { status: "memuat" | "ada" | "galat"; data: Dashboard | null };

let keadaan: Keadaan = { status: "memuat", data: null };
let sedangMuat: Promise<void> | null = null;
const pendengar = new Set<() => void>();

function ubah(baru: Keadaan) {
  keadaan = baru;
  pendengar.forEach((f) => f());
}

function muat() {
  if (sedangMuat || keadaan.status === "ada") return;
  sedangMuat = fetch("/api/dashboard")
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      ubah({ status: "ada", data: (await res.json()) as Dashboard });
    })
    .catch(() => ubah({ status: "galat", data: null }))
    .finally(() => {
      sedangMuat = null;
    });
}

/** Coba ambil lagi setelah gagal (tombol "Coba lagi"). */
export function muatUlangDashboard() {
  ubah({ status: "memuat", data: null });
  muat();
}

const langganan = (f: () => void) => {
  pendengar.add(f);
  return () => {
    pendengar.delete(f);
  };
};
const potretServer: Keadaan = { status: "memuat", data: null };

export function useDashboard() {
  const k = useSyncExternalStore(
    langganan,
    () => keadaan,
    () => potretServer,
  );
  useEffect(muat, []);
  return k;
}

// ---------- Format ----------

export const angka = (n: number) => n.toLocaleString("id-ID");
export const persen = (n: number) => `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
export const desimal = (n: number) => n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Minat dari kurang dari 10 anak disamarkan agar tidak mengarah ke keluarga tertentu. */
export const BATAS_SAMAR = 10;
export const minat = (n: number) => (n < BATAS_SAMAR ? `kurang dari ${BATAS_SAMAR}` : angka(n));
/** Versi pendek untuk kotak angka. */
export const minatPendek = (n: number) => (n < BATAS_SAMAR ? `< ${BATAS_SAMAR}` : angka(n));

/**
 * Nama sekolah dari data SPMB ditulis tidak seragam ("SEKOLAH MENENGAH KEJURUAN NEGERI 5 KOTA DEPOK",
 * "SMAN 11 Kota Depok"). Untuk tabel dashboard diseragamkan menjadi "SMKN 5 Depok", "SMAN 11 Depok".
 */
export function namaRingkas(nama: string) {
  return nama
    .toUpperCase()
    .replace(/SEKOLAH MENENGAH KEJURUAN NEGERI/, "SMKN")
    .replace(/SEKOLAH MENENGAH ATAS NEGERI/, "SMAN")
    .replace(/\bSMK NEGERI\b/, "SMKN")
    .replace(/\bSMA NEGERI\b/, "SMAN")
    .replace(/\s+(KOTA\s+)?DEPOK\s*$/, " Depok")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tekanan = pendaftar pilihan 1 dibagi kursi yang terisi. Di atas 2 berarti lebih dari dua pendaftar pilihan
 * pertama untuk tiap kursi.
 */
export function kelasTekanan(t: number | null): { kind: string; label: string } {
  if (t === null) return { kind: "neutral", label: "Belum dihitung" };
  if (t >= 2) return { kind: "berisiko", label: "Sangat diminati" };
  if (t >= 1) return { kind: "bersaing", label: "Diminati" };
  return { kind: "info", label: "Kurang diminati" };
}

/** Persentase diterima suatu kecamatan dibanding rata-rata kota (selisih 5 poin dianggap setara). */
export function kelasPersen(p: number, rataRata: number): { kind: string; label: string } {
  if (p < rataRata - 5) return { kind: "berisiko", label: "Di bawah rata-rata" };
  if (p > rataRata + 5) return { kind: "aman", label: "Di atas rata-rata" };
  return { kind: "bersaing", label: "Sekitar rata-rata" };
}
