// Data contoh sekolah. Satu sumber untuk peta, daftar, detail, strategi, dan unduhan.
export type Kind = "aman" | "bersaing" | "berisiko";

export type RouteChance = {
  jalur: string;
  eligible: boolean;
  peluang?: string;
  kind?: Kind;
};

export type School = {
  id: string;
  name: string;
  kec: string;
  kind: Kind;
  /** Jalur terbaik untuk anak. */
  jalur: string;
  range: string;
  facts: [label: string, value: string][];
  reason: string;
  /** Posisi pin di peta, dalam persen. */
  pin: [x: number, y: number];
  detail: {
    distance: string;
    summary: string;
    routes: RouteChance[];
    stats: [label: string, value: string, source: string][];
    reliability: { years: number; note: string };
  };
};

const SOURCE = "seleksi 2026";
const stats = (
  kuota: string,
  pendaftar: string,
  jarak: string,
  nilai: string,
): School["detail"]["stats"] => [
  ["Kuota", kuota, `Kursi, ${SOURCE}`],
  ["Pendaftar", pendaftar, `Orang, ${SOURCE}`],
  ["Batas diterima domisili", jarak, "Jarak terjauh yang diterima"],
  ["Batas nilai prestasi", nilai, "Rata-rata rapor"],
];
const routes = (
  domisili: [string, Kind],
  prestasi: [string, Kind],
): RouteChance[] => [
  {
    jalur: "Jalur dekat rumah (Domisili)",
    eligible: true,
    peluang: domisili[0],
    kind: domisili[1],
  },
  {
    jalur: "Jalur nilai dan prestasi (Prestasi)",
    eligible: true,
    peluang: prestasi[0],
    kind: prestasi[1],
  },
  { jalur: "Jalur keluarga kurang mampu (Afirmasi)", eligible: false },
  { jalur: "Jalur orang tua pindah tugas (Mutasi)", eligible: false },
];

export const SCHOOLS: School[] = [
  {
    id: "sma-negeri-5",
    name: "SMA Negeri 5 Sukamaju",
    kec: "Kec. Harapan Jaya",
    kind: "aman",
    jalur: "Jalur dekat rumah (Domisili)",
    range: "80-92%",
    facts: [
      ["Jarak rumah", "1,2 km"],
      ["Batas tahun lalu", "1,8 km"],
    ],
    reason:
      "Tahun lalu, anak dengan jarak sampai 1,8 km masih diterima. Jarak rumah Dimas lebih dekat dari itu.",
    pin: [38, 40],
    detail: {
      distance: "1,2 km",
      summary:
        "Tahun lalu, anak dengan jarak sampai 1,8 km masih diterima. Jarak rumah Dimas 1,2 km, lebih dekat dari batas itu.",
      routes: routes(["80-92%", "aman"], ["40-55%", "bersaing"]),
      stats: stats("128", "342", "1,8 km", "88,2"),
      reliability: {
        years: 2,
        note: "Data 2025 dan 2026 tersedia untuk sekolah ini.",
      },
    },
  },
  {
    id: "sma-negeri-9",
    name: "SMA Negeri 9 Sukamaju",
    kec: "Kec. Mekar Sari",
    kind: "aman",
    jalur: "Jalur dekat rumah (Domisili)",
    range: "75-88%",
    facts: [
      ["Jarak rumah", "2,0 km"],
      ["Batas tahun lalu", "2,6 km"],
    ],
    reason:
      "Jarak rumah Dimas lebih dekat dari batas jarak terjauh yang diterima tahun lalu.",
    pin: [66, 80],
    detail: {
      distance: "2,0 km",
      summary:
        "Tahun lalu, anak dengan jarak sampai 2,6 km masih diterima. Jarak rumah Dimas 2,0 km, lebih dekat dari batas itu.",
      routes: routes(["75-88%", "aman"], ["42-58%", "bersaing"]),
      stats: stats("118", "276", "2,6 km", "86,9"),
      reliability: {
        years: 2,
        note: "Data 2025 dan 2026 tersedia untuk sekolah ini.",
      },
    },
  },
  {
    id: "sma-negeri-2",
    name: "SMA Negeri 2 Sukamaju",
    kec: "Kec. Sukamaju Utara",
    kind: "bersaing",
    jalur: "Jalur nilai dan prestasi (Prestasi)",
    range: "45-60%",
    facts: [
      ["Nilai rata-rata Dimas", "86,4"],
      ["Batas tahun lalu", "85,9"],
    ],
    reason:
      "Nilai Dimas sedikit di atas batas tahun lalu. Hasil tergantung jumlah pendaftar tahun ini.",
    pin: [20, 72],
    detail: {
      distance: "3,4 km",
      summary:
        "Nilai rata-rata Dimas 86,4 sedikit di atas batas tahun lalu (85,9). Hasil tergantung jumlah pendaftar tahun ini.",
      routes: routes(["20-35%", "berisiko"], ["45-60%", "bersaing"]),
      stats: stats("112", "380", "2,2 km", "85,9"),
      reliability: {
        years: 2,
        note: "Data 2025 dan 2026 tersedia untuk sekolah ini.",
      },
    },
  },
  {
    id: "sma-negeri-1",
    name: "SMA Negeri 1 Sukamaju",
    kec: "Kec. Sukamaju Utara",
    kind: "berisiko",
    jalur: "Jalur nilai dan prestasi (Prestasi)",
    range: "15-30%",
    facts: [
      ["Nilai rata-rata Dimas", "86,4"],
      ["Batas tahun lalu", "91,2"],
    ],
    reason:
      "Nilai Dimas masih di bawah batas tahun lalu. Sebaiknya jadikan pilihan tambahan, bukan satu-satunya.",
    pin: [82, 34],
    detail: {
      distance: "5,2 km",
      summary:
        "Nilai rata-rata Dimas 86,4 masih di bawah batas tahun lalu (91,2). Sebaiknya jadikan pilihan tambahan, bukan satu-satunya.",
      routes: routes(["5-15%", "berisiko"], ["15-30%", "berisiko"]),
      stats: stats("144", "640", "1,4 km", "91,2"),
      reliability: {
        years: 2,
        note: "Data 2025 dan 2026 tersedia untuk sekolah ini.",
      },
    },
  },
  {
    id: "sma-negeri-7",
    name: "SMA Negeri 7 Sukamaju",
    kec: "Kec. Tirta Indah",
    kind: "berisiko",
    jalur: "Jalur dekat rumah (Domisili)",
    range: "10-25%",
    facts: [
      ["Jarak rumah", "4,5 km"],
      ["Batas tahun lalu", "1,7 km"],
    ],
    reason:
      "Rumah Dimas jauh melewati batas jarak tahun lalu. Pertimbangkan sekolah yang lebih dekat.",
    pin: [62, 22],
    detail: {
      distance: "4,5 km",
      summary:
        "Rumah Dimas 4,5 km, jauh melewati batas tahun lalu (1,7 km). Pertimbangkan sekolah yang lebih dekat.",
      routes: routes(["10-25%", "berisiko"], ["25-40%", "berisiko"]),
      stats: stats("96", "150", "1,7 km", "84,0"),
      reliability: {
        years: 1,
        note: "Hanya data 2026 yang tersedia untuk sekolah ini, jadi perkiraan kurang pasti.",
      },
    },
  },
];

export const getSchool = (id: string) => SCHOOLS.find((s) => s.id === id);

/** Nama pendek: "SMA Negeri 5". */
export const shortName = (s: School) => s.name.replace(" Sukamaju", "");

/** Urutan pilihan yang disarankan untuk Dimas. */
export const STRATEGY: { id: string; role: string }[] = [
  { id: "sma-negeri-2", role: "Pilihan ambisius" },
  { id: "sma-negeri-5", role: "Pilihan seimbang" },
  { id: "sma-negeri-9", role: "Pilihan aman" },
];

export const strategySchools = () =>
  STRATEGY.map((s) => ({ ...s, school: getSchool(s.id)! }));

export type PrivateSchool = {
  id: string;
  name: string;
  kec: string;
  akreditasi: string;
  jarak: string;
  spp: string;
  pangkal: string;
  beasiswa: string;
};

export const PRIVATE_SCHOOLS: PrivateSchool[] = [
  {
    id: "islam-harapan",
    name: "SMA Islam Harapan",
    kec: "Kec. Harapan Jaya",
    akreditasi: "A",
    jarak: "1,8 km",
    spp: "± Rp 350.000",
    pangkal: "± Rp 2.500.000",
    beasiswa: "Ada beasiswa prestasi.",
  },
  {
    id: "kristen-mekar",
    name: "SMA Kristen Mekar",
    kec: "Kec. Mekar Sari",
    akreditasi: "A",
    jarak: "2,9 km",
    spp: "± Rp 450.000",
    pangkal: "± Rp 3.000.000",
    beasiswa: "Ada keringanan untuk keluarga kurang mampu (KETM).",
  },
  {
    id: "cendekia-utama",
    name: "SMA Cendekia Utama",
    kec: "Kec. Sukamaju Utara",
    akreditasi: "B",
    jarak: "4,2 km",
    spp: "± Rp 650.000",
    pangkal: "± Rp 4.500.000",
    beasiswa: "Belum ada program beasiswa.",
  },
];

/**
 * Aturan sederhana untuk Cek Cepat (perkiraan tiruan). Kecamatan sekolah, kecamatan bertetangga,
 * perkiraan radius zona Domisili tahun lalu (km), perkiraan batas rata-rata nilai jalur Prestasi, dan apakah sekolah punya kuota Afirmasi.
 */
export type SchoolRules = {
  kec: string;
  /** Perkiraan radius zona Domisili tahun lalu, km. */
  radiusKm: number;
  prestasiMin: number;
  afirmasi: boolean;
};

export const SCHOOL_RULES: Record<string, SchoolRules> = {
  "sma-negeri-5": { kec: "Harapan Jaya", radiusKm: 2.5, prestasiMin: 84, afirmasi: true },
  "sma-negeri-9": { kec: "Mekar Sari", radiusKm: 2.0, prestasiMin: 82, afirmasi: true },
  "sma-negeri-2": { kec: "Sukamaju Utara", radiusKm: 3.0, prestasiMin: 86, afirmasi: true },
  "sma-negeri-1": { kec: "Sukamaju Utara", radiusKm: 2.0, prestasiMin: 91, afirmasi: false },
  "sma-negeri-7": { kec: "Tirta Indah", radiusKm: 3.0, prestasiMin: 88, afirmasi: true },
};
