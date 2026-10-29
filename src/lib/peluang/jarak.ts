const RADIUS_BUMI_M = 6_371_000;

/** Jarak garis lurus (Haversine) dalam meter. */
export function jarakMeter(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIUS_BUMI_M * Math.asin(Math.sqrt(h));
}

/** Dibulatkan ke 50 m agar posisi rumah tidak bisa ditebak dari hasil yang disimpan. */
export const bulat50 = (m: number) => Math.round(m / 50) * 50;

/** 650 → "650 m", 1808 → "1,8 km". */
export function formatJarak(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;
}
