// Geografi contoh untuk Cek Cepat. Semua koordinat di sini DATA CONTOH di sekitar satu titik acuan;
// ganti dengan koordinat resmi sekolah dan pusat kecamatan dari dinas saat data nyata tersedia.
// Titik rumah orang tua tidak pernah masuk berkas ini: ia hanya hidup di memori tab.
export type GeoPoint = { lat: number; lon: number };

const CENTER: GeoPoint = { lat: -6.9175, lon: 107.6191 };
const KM_PER_DEG_LAT = 110.574;
const kmPerDegLon = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180);

/** Titik pada jarak (timur, utara) km dari titik acuan. */
export const at = (east: number, north: number): GeoPoint => ({
  lat: CENTER.lat + north / KM_PER_DEG_LAT,
  lon: CENTER.lon + east / kmPerDegLon(CENTER.lat),
});
const toKm = (p: GeoPoint) => ({
  east: (p.lon - CENTER.lon) * kmPerDegLon(CENTER.lat),
  north: (p.lat - CENTER.lat) * KM_PER_DEG_LAT,
});

/** Jarak lurus (km). Cukup akurat untuk jarak puluhan km. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const A = toKm(a);
  const B = toKm(b);
  return Math.hypot(A.east - B.east, A.north - B.north);
}

/** Wilayah layanan (km dari titik acuan). */
export const BOUNDS = { west: -6, east: 7, south: -5, north: 6 } as const;
const WIDTH = BOUNDS.east - BOUNDS.west;
const HEIGHT = BOUNDS.north - BOUNDS.south;
export const MAP_ASPECT = `${WIDTH} / ${HEIGHT}`;

export const isValidPoint = (p: unknown): p is GeoPoint => {
  const v = p as Partial<GeoPoint> | null;
  return !!v && typeof v.lat === "number" && typeof v.lon === "number" && Number.isFinite(v.lat) && Number.isFinite(v.lon);
};
export function inBounds(p: GeoPoint): boolean {
  const { east, north } = toKm(p);
  return east >= BOUNDS.west && east <= BOUNDS.east && north >= BOUNDS.south && north <= BOUNDS.north;
}

/** Titik ke posisi peta skematis dalam persen (x ke kanan, y ke bawah). */
export function toPercent(p: GeoPoint): { x: number; y: number } {
  const { east, north } = toKm(p);
  return { x: ((east - BOUNDS.west) / WIDTH) * 100, y: ((BOUNDS.north - north) / HEIGHT) * 100 };
}
export function fromPercent(x: number, y: number): GeoPoint {
  return at(BOUNDS.west + (x / 100) * WIDTH, BOUNDS.north - (y / 100) * HEIGHT);
}

/** Pusat tiap kecamatan (contoh). */
export const KEC_POINT: Record<string, GeoPoint> = {
  "Harapan Jaya": at(-3, 1),
  "Mekar Sari": at(0, 0),
  "Sukamaju Utara": at(0, 4),
  "Tirta Indah": at(4, 1),
  "Bukit Asri": at(5, -3),
  "Lembah Hijau": at(-3, -3),
};
/** Lokasi tiap sekolah (contoh). */
export const SCHOOL_POINT: Record<string, GeoPoint> = {
  "sma-negeri-5": at(-3.2, 0.8),
  "sma-negeri-9": at(0.3, -0.2),
  "sma-negeri-2": at(0.4, 4.2),
  "sma-negeri-1": at(-0.6, 3.6),
  "sma-negeri-7": at(3.8, 1.2),
};

/** Kecamatan dengan pusat terdekat dari titik. */
export function nearestKecamatan(p: GeoPoint): string {
  let best = "";
  let bestD = Infinity;
  for (const [name, c] of Object.entries(KEC_POINT)) {
    const d = distanceKm(p, c);
    if (d < bestD) {
      best = name;
      bestD = d;
    }
  }
  return best;
}
