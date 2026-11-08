import "server-only";
import { headers } from "next/headers";
import { preload } from "react-dom";
import { URL_DATA_ORTU } from "@/lib/anak-aktif";

/**
 * Minta browser mulai mengambil data orang tua sejak HTML diterima, tanpa menunggu JavaScript halaman
 * (sekitar 0,5 s di desktop). Store memakai jawaban preload ini karena alamatnya sama persis.
 *
 * Hanya saat halaman dibuka sebagai dokumen. Saat pindah halaman di dalam aplikasi, data sudah ada di store,
 * jadi preload hanya menambah satu permintaan sia-sia; navigasi itu dikirim dengan Sec-Fetch-Dest: empty.
 */
export async function pramuatDataOrtu() {
  if (!perluPramuat((await headers()).get("sec-fetch-dest"))) return;
  preload(URL_DATA_ORTU, { as: "fetch", crossOrigin: "anonymous" });
}

/** Dipisah agar bisa dites: true hanya untuk permintaan dokumen (buka halaman pertama atau muat ulang). */
export const perluPramuat = (secFetchDest: string | null) => secFetchDest === "document";
