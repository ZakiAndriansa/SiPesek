import type { z } from "zod";
import type { ResponsGalat } from "@/lib/kontrak";

/**
 * Untuk data publik tanpa data pribadi (daftar sekolah, dashboard): CDN Vercel menyimpan jawaban 5 menit dan
 * tetap melayani salinan lama sambil memperbarui di latar, jadi kebanyakan pengunjung tidak memanggil database.
 * Perubahan dari admin terlihat paling lama 5 menit kemudian.
 */
export const CACHE_PUBLIK = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } as const;

/** Respons galat dengan bentuk yang sama di semua route (lihat ResponsGalat). */
export function galat(pesan: string, status: number, detail?: unknown): Response {
  const isi: ResponsGalat = detail === undefined ? { galat: pesan } : { galat: pesan, detail };
  return Response.json(isi, { status });
}

/**
 * Membaca body JSON lalu memvalidasinya dengan skema zod.
 * Hasilnya berisi `data` bila valid, atau `gagal` (respons 400) yang tinggal dikembalikan.
 */
export async function bacaJson<S extends z.ZodType>(
  request: Request,
  skema: S,
  pesan: string,
): Promise<{ data: z.output<S> } | { gagal: Response }> {
  const hasil = skema.safeParse(await request.json().catch(() => null));
  return hasil.success ? { data: hasil.data } : { gagal: galat(pesan, 400, hasil.error.issues) };
}
