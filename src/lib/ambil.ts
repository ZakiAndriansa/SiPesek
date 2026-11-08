/**
 * fetch untuk komponen klien dengan batas waktu, agar halaman tidak menggantung di "Memuat…" saat server
 * atau database lambat bangun. Permintaan GET dicoba ulang otomatis bila gagal jaringan, waktu habis, atau
 * server menjawab 5xx; permintaan lain (POST, PUT, DELETE) tidak, supaya tidak tersimpan dua kali.
 */
export class WaktuHabis extends Error {
  constructor() {
    super("Server terlalu lama menjawab.");
  }
}

export const BATAS_BACA_MS = 15_000;
export const BATAS_KIRIM_MS = 25_000;
const JEDA_ULANG_MS = 600;

type Opsi = RequestInit & { batasMs?: number; ulang?: number };

export async function ambil(url: string, { batasMs, ulang, ...init }: Opsi = {}): Promise<Response> {
  const baca = !init.method || init.method.toUpperCase() === "GET";
  let sisa = ulang ?? (baca ? 1 : 0);
  for (;;) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(batasMs ?? (baca ? BATAS_BACA_MS : BATAS_KIRIM_MS)) });
      if (res.status >= 500 && sisa > 0) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      const habis = e instanceof DOMException && e.name === "TimeoutError";
      if (sisa <= 0) throw habis ? new WaktuHabis() : e;
      sisa--;
      await new Promise((r) => setTimeout(r, JEDA_ULANG_MS));
    }
  }
}

/** Pesan galat untuk orang tua dari kegagalan ambil(). */
export const pesanGagal = (e: unknown) =>
  e instanceof WaktuHabis
    ? "Server SiPesek sedang lambat menjawab. Tunggu sebentar, lalu coba lagi."
    : "Tidak tersambung ke server SiPesek. Periksa internet, lalu coba lagi.";
