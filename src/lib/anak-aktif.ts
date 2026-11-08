/**
 * Aturan anak aktif dan alamat data orang tua, dipakai bersama oleh store di browser dan oleh server, supaya
 * hasil terakhir yang dikirim server (dan di-preload sejak HTML) selalu milik anak yang sama dengan yang
 * ditampilkan browser.
 */

/** Cookie berisi id anak yang terakhir dipilih (bukan rahasia; salinan dari localStorage untuk server). */
export const COOKIE_ANAK_AKTIF = "sipesek_anak_aktif";

/**
 * Satu panggilan untuk daftar anak, riwayatnya, dan hasil terakhir anak aktif. Alamatnya harus persis sama
 * di preload (server) dan fetch (store), agar browser memakai jawaban preload dan tidak mengambil dua kali.
 */
export const URL_DATA_ORTU = "/api/ortu/anak?riwayat=1&hasil=1";

/** Anak aktif: pilihan terakhir bila masih ada, selain itu anak pertama yang punya hasil, lalu anak pertama. */
export function tentukanAnakAktif(anak: Array<{ id: number; riwayat: unknown[] }>, pilihan: number | null): number | null {
  if (pilihan !== null && anak.some((a) => a.id === pilihan)) return pilihan;
  return (anak.find((a) => a.riwayat.length > 0) ?? anak[0])?.id ?? null;
}

/** Id anak dari teks cookie atau localStorage; null bila kosong atau rusak. */
export function bacaIdAnak(teks: string | null | undefined): number | null {
  const v = Number(teks);
  return Number.isInteger(v) && v > 0 ? v : null;
}
