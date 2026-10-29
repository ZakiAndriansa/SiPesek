/**
 * Alamat API untuk halaman.
 *
 * Halaman tidak boleh mengimpor src/lib/db.ts atau modul lain yang memakai database,
 * karena di Vercel tidak ada database: semua data harus lewat /api.
 * Di browser cukup pakai path relatif (/api/...), yang di Vercel diteruskan ke homeserver.
 * Di server component, path relatif tidak bisa dipakai, jadi pakai urlApi().
 */
export function urlApi(path: `/api/${string}`): string {
  if (typeof window !== "undefined") return path;
  const basis = process.env.BACKEND_URL || `http://localhost:${process.env.PORT ?? 3000}`;
  return `${basis.replace(/\/$/, "")}${path}`;
}
