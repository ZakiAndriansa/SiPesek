"use client";
// Isian wizard per anak, disimpan di perangkat (localStorage) agar "Lanjutkan isi data" bisa melanjutkan
// dari langkah terakhir. Server tidak menyimpan nilai rapor maupun titik rumah, jadi di sinilah satu-satunya
// tempat isian bertahan. NISN dan titik rumah TIDAK ikut disimpan; semuanya dihapus saat orang tua keluar.
import { WIZARD_TOTAL_ORTU } from "@/lib/accounts";
import { SEMESTER_COUNT, type QuickCheckInput } from "@/lib/quick-check";

export type Isian = Omit<QuickCheckInput, "lokasi"> & {
  /** Jumlah langkah yang sudah disimpan (0..WIZARD_TOTAL_ORTU). */
  langkah: number;
};

const AWALAN = "sipesek:isian:";
// Salinan di memori: tetap berlaku antarlangkah walau localStorage diblokir (mode privat).
const memori = new Map<number, Isian>();

export const ISIAN_KOSONG: Isian = {
  jenjang: "sma",
  nilai: Array(SEMESTER_COUNT).fill(null),
  tkaBin: null,
  tkaMtk: null,
  mapel: { bin: null, mtk: null, ipa: null, ips: null, bing: null },
  ketm: "tidak",
  disabilitas: false,
  pindahTugas: false,
  kecamatan: "",
  langkah: 0,
};

export function bacaIsian(anakId: number): Isian | null {
  const ada = memori.get(anakId);
  if (ada) return ada;
  try {
    const v = JSON.parse(localStorage.getItem(AWALAN + anakId) ?? "null") as Partial<Isian> | null;
    if (!v || typeof v !== "object") return null;
    // Gabung dengan isian kosong agar isian lama yang kurang field tetap terbaca.
    return { ...ISIAN_KOSONG, ...v, mapel: { ...ISIAN_KOSONG.mapel, ...v.mapel } };
  } catch {
    return null;
  }
}

/** Gabungkan perubahan ke isian anak; `langkah` tidak pernah turun. */
export function simpanIsian(anakId: number, ubah: Partial<Isian>): Isian {
  const lama = bacaIsian(anakId) ?? ISIAN_KOSONG;
  const baru = { ...lama, ...ubah, langkah: Math.max(lama.langkah, ubah.langkah ?? 0) };
  memori.set(anakId, baru);
  try {
    localStorage.setItem(AWALAN + anakId, JSON.stringify(baru));
  } catch {
    // Penyimpanan browser diblokir: isian tetap berlaku selama halaman terbuka.
  }
  return baru;
}

export function hapusIsian(anakId: number) {
  memori.delete(anakId);
  try {
    localStorage.removeItem(AWALAN + anakId);
  } catch {
    // Tidak ada yang perlu dihapus.
  }
}

/** Hapus semua isian di memori (localStorage dibersihkan oleh lupakanDataOrtu). */
export const lupakanIsian = () => memori.clear();

/** Langkah isi data berikutnya untuk anak ini (langkah 1 bila belum ada isian). */
export function lanjutIsiHref(anakId: number) {
  const langkah = bacaIsian(anakId)?.langkah ?? 0;
  return `/isi-data/${Math.min(langkah + 1, WIZARD_TOTAL_ORTU)}`;
}
