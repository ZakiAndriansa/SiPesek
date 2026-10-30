/** Foto profil hanya diterima dari server gambar Google, supaya header tidak memuat gambar dari situs lain. */
export function fotoGoogle(picture: unknown): string | null {
  if (typeof picture !== "string") return null;
  try {
    const url = new URL(picture);
    return url.protocol === "https:" && url.hostname.endsWith(".googleusercontent.com") ? url.href : null;
  } catch {
    return null;
  }
}
