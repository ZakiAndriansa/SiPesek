// Cek Cepat (tamu): perhitungan perkiraan tiruan yang murni. Tidak membaca atau menulis penyimpanan apa pun.
// NISN sengaja tidak ada di tipe mana pun di sini: NISN hanya divalidasi di browser lalu dibuang.
import { KEC_NAMES } from "@/data/kecamatan";
import { distanceKm, inBounds, isValidPoint, KEC_POINT, SCHOOL_POINT, type GeoPoint } from "@/data/geo";
import { SCHOOLS, SCHOOL_RULES, type Kind } from "@/data/schools";

export const JENJANG = ["sma", "smk", "belum"] as const;
export const KETM = ["ya", "tidak", "ragu"] as const;
export const PRESTASI = ["", "Kecamatan", "Kota/Kabupaten", "Provinsi", "Nasional"] as const;
export const SEMESTER_COUNT = 5;

export type QuickCheckInput = {
  jenjang: (typeof JENJANG)[number];
  /** 5 semester; null = dikosongkan. */
  nilai: (number | null)[];
  ketm: (typeof KETM)[number];
  prestasi: (typeof PRESTASI)[number];
  /** Kecamatan tempat tinggal. Bila `lokasi` ada, diisi kecamatan terdekat darinya. */
  kecamatan: string;
  /** Titik rumah. Hanya ada di memori tab dan dihitung di browser; tidak pernah dikirim ke server atau ke akun. */
  lokasi: GeoPoint | null;
};

export type QuickSchool = {
  id: string;
  name: string;
  kec: string;
  kind: Kind;
  jalur: string;
  range: string;
  reason: string;
  facts: [string, string][];
};

export type QuickStrategyItem = { id: string; name: string; role: string; jalur: string; kind: Kind };

export type QuickRoute = { name: string; status: "memenuhi" | "mungkin" | "tidak"; note: string };

export type QuickCheckResult = {
  routes: QuickRoute[];
  schools: QuickSchool[];
  strategy: QuickStrategyItem[];
  notes: string[];
};

/** Draft di memori tab: isian + hasil terakhir. Tidak pernah memuat NISN. */
export type QuickDraft = { input: QuickCheckInput };

export const isValidNisn = (value: string) => /^\d{10}$/.test(value);

export const parseNumber = (raw: string): number | null => {
  const text = raw.trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

/** Validasi bentuk input dari klien. Mengembalikan pesan error atau null. */
export function validateInput(input: unknown): string | null {
  const i = input as Partial<QuickCheckInput> | null;
  if (!i || typeof i !== "object") return "Isian tidak terbaca. Coba isi ulang.";
  if (!JENJANG.includes(i.jenjang as never)) return "Pilih jenjang tujuan.";
  if (!KETM.includes(i.ketm as never)) return "Pilih jawaban untuk kondisi keluarga.";
  if (!PRESTASI.includes((i.prestasi ?? "") as never)) return "Tingkat prestasi tidak dikenal.";
  if (!i.kecamatan || !KEC_NAMES.includes(i.kecamatan)) return "Pilih kecamatan tempat tinggal.";
  if (i.lokasi != null && (!isValidPoint(i.lokasi) || !inBounds(i.lokasi))) return "Titik rumah di luar wilayah layanan. Tandai ulang di peta atau pilih kecamatan.";
  if (!Array.isArray(i.nilai) || i.nilai.length !== SEMESTER_COUNT) return "Nilai semester tidak terbaca.";
  for (const v of i.nilai) {
    if (v !== null && (typeof v !== "number" || !(v >= 0 && v <= 100))) {
      return "Nilai ditulis dengan angka 0 sampai 100, misalnya 85,5.";
    }
  }
  return null;
}

const RANGE: Record<Kind, string> = { aman: "75–90%", bersaing: "45–60%", berisiko: "10–30%" };
const ORDER: Record<Kind, number> = { aman: 0, bersaing: 1, berisiko: 2 };
const PRESTASI_BONUS: Record<string, number> = { "": 0, Kecamatan: 0.5, "Kota/Kabupaten": 1.5, Provinsi: 3, Nasional: 3 };
const NAME = { domisili: "Jalur dekat rumah (Domisili)", prestasi: "Jalur nilai dan prestasi (Prestasi)", afirmasi: "Jalur keluarga kurang mampu (Afirmasi)" };

const km = (n: number) => n.toFixed(1).replace(".", ",");
const fmt = (n: number) => n.toFixed(1).replace(".", ",");
const average = (nilai: (number | null)[]) => {
  const filled = nilai.filter((v): v is number => v !== null);
  return { count: filled.length, mean: filled.length ? filled.reduce((a, b) => a + b, 0) / filled.length : null };
};

type Candidate = { kind: Kind; jalur: string; reason: string; facts: [string, string][] };

/** Perkiraan per sekolah dan strategi 3 pilihan. Hasil berubah mengikuti isian; selalu berupa perkiraan. */
export function estimate(input: QuickCheckInput): QuickCheckResult {
  const { count, mean } = average(input.nilai);
  const bonus = PRESTASI_BONUS[input.prestasi] ?? 0;
  const prestasiPossible = count >= 3 || bonus >= 1.5;
  const schools: QuickSchool[] = [];

  for (const school of SCHOOLS) {
    const rules = SCHOOL_RULES[school.id];
    if (!rules) continue;
    const options: Candidate[] = [];

    // Domisili: jarak lurus rumah ke sekolah dibanding perkiraan radius zona tahun lalu.
    // Tanpa titik rumah, jarak dihitung dari pusat kecamatan (kasar).
    const precise = !!input.lokasi;
    const origin = input.lokasi ?? KEC_POINT[input.kecamatan];
    const dist = Math.round(distanceKm(origin, SCHOOL_POINT[school.id]) * 10) / 10;
    const radius = rules.radiusKm;
    const domKind: Kind = dist <= radius * 0.7 ? "aman" : dist <= radius * 1.2 ? "bersaing" : "berisiko";
    const from = precise ? "Rumah" : `Pusat kecamatan ${input.kecamatan}`;
    options.push({
      kind: domKind,
      jalur: NAME.domisili,
      reason:
        domKind === "aman"
          ? `${from} sekitar ${km(dist)} km dari sekolah, di dalam perkiraan zona tahun lalu (${km(radius)} km). Di jalur dekat rumah, ini posisi kuat.`
          : domKind === "bersaing"
            ? `${from} sekitar ${km(dist)} km dari sekolah, dekat batas perkiraan zona tahun lalu (${km(radius)} km). Hasilnya tergantung jumlah pendaftar.`
            : `${from} sekitar ${km(dist)} km dari sekolah, di luar perkiraan zona tahun lalu (${km(radius)} km). Jadikan pilihan tambahan, bukan satu-satunya.`,
      facts: [[precise ? "Jarak rumah" : "Jarak dari pusat kecamatan", `±${km(dist)} km`], ["Perkiraan zona tahun lalu", `±${km(radius)} km`]],
    });
    // Prestasi: rata-rata nilai dibanding perkiraan batas tahun lalu.
    if (prestasiPossible) {
      const base = mean ?? rules.prestasiMin - 2;
      const diff = base + bonus - rules.prestasiMin;
      const kind: Kind = diff >= 2 ? "aman" : diff >= -2 ? "bersaing" : "berisiko";
      options.push({
        kind,
        jalur: NAME.prestasi,
        reason:
          mean === null
            ? `Nilai belum diisi, jadi perkiraan memakai prestasi lomba tingkat ${input.prestasi.toLowerCase()}. Isi nilai rapor agar lebih akurat.`
            : kind === "aman"
              ? `Rata-rata nilai ${fmt(mean)} berada di atas perkiraan batas ${rules.prestasiMin}.`
              : kind === "bersaing"
                ? `Rata-rata nilai ${fmt(mean)} mendekati perkiraan batas ${rules.prestasiMin}. Hasilnya tergantung pendaftar tahun ini.`
                : `Rata-rata nilai ${fmt(mean)} masih di bawah perkiraan batas ${rules.prestasiMin}. Sebaiknya bukan satu-satunya pilihan.`,
        facts: [["Rata-rata nilai Bapak/Ibu", mean === null ? "Belum diisi" : fmt(mean)], ["Perkiraan batas", String(rules.prestasiMin)]],
      });
    }

    // Afirmasi: hanya bila keluarga KETM.
    if (input.ketm === "ya") {
      options.push({
        kind: rules.afirmasi ? "aman" : "bersaing",
        jalur: NAME.afirmasi,
        reason: rules.afirmasi
          ? "Keluarga KETM bisa memakai kuota Jalur keluarga kurang mampu (Afirmasi) di sekolah ini."
          : "Sekolah ini punya kuota Afirmasi yang sangat kecil, jadi persaingannya ketat.",
        facts: [["Kuota Afirmasi", rules.afirmasi ? "Tersedia" : "Sangat kecil"]],
      });
    }

    options.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
    const best = options[0];
    schools.push({
      id: school.id,
      name: school.name,
      kec: school.kec,
      kind: best.kind,
      jalur: best.jalur,
      range: RANGE[best.kind],
      reason: best.reason,
      facts: best.facts,
    });
  }

  schools.sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.name.localeCompare(b.name));

  // Strategi: satu ambisius, satu seimbang, satu aman (bila tersedia).
  const pick = (kind: Kind) => schools.filter((s) => s.kind === kind);
  const aman = pick("aman");
  const bersaing = pick("bersaing");
  const berisiko = pick("berisiko");
  const prestige = (s: QuickSchool) => SCHOOL_RULES[s.id]?.prestasiMin ?? 0;
  // Bila tidak ada sekolah yang bersaing, sekolah paling favorit di antara yang aman jadi pilihan ambisius.
  const ambisius = bersaing[0] ?? berisiko[0] ?? [...aman].sort((a, b) => prestige(b) - prestige(a))[0];
  const rest = aman.filter((s) => s !== ambisius);
  const chosen = [ambisius, rest[0], rest[1] ?? bersaing.find((s) => s !== ambisius)].filter((s): s is QuickSchool => !!s);
  const unique = chosen.filter((s, i) => chosen.findIndex((c) => c.id === s.id) === i);
  const roles = ["Pilihan ambisius", "Pilihan seimbang", "Pilihan aman"];
  const strategy: QuickStrategyItem[] = (unique.length >= 3 ? unique : [...unique, ...schools.filter((s) => !unique.includes(s))].slice(0, 3)).map(
    (s, i) => ({ id: s.id, name: s.name, role: roles[i], jalur: s.jalur, kind: s.kind }),
  );

  const routes: QuickRoute[] = [
    {
      name: NAME.domisili,
      status: "memenuhi",
      note: input.lokasi ? "Dihitung dari titik rumah yang Bapak/Ibu tandai. Jarak lurus ke sekolah, bukan jarak rute jalan." : `Dihitung kasar dari pusat kecamatan ${input.kecamatan}. Tandai titik rumah di peta agar lebih akurat.`,
    },
    prestasiPossible
      ? { name: NAME.prestasi, status: "memenuhi", note: mean === null ? "Dihitung dari prestasi lomba. Nilai rapor belum diisi." : `Rata-rata nilai ${fmt(mean)} dari ${count} semester.` }
      : { name: NAME.prestasi, status: "mungkin", note: "Belum cukup data untuk memperkirakan. Isi minimal 3 semester atau prestasi tingkat kota ke atas." },
    input.ketm === "ya"
      ? { name: NAME.afirmasi, status: "memenuhi", note: "Keluarga KETM bisa memakai jalur ini. Siapkan bukti bantuan." }
      : input.ketm === "ragu"
        ? { name: NAME.afirmasi, status: "mungkin", note: "Cek dulu apakah keluarga terdaftar sebagai penerima bantuan. Tanyakan ke kelurahan." }
        : { name: NAME.afirmasi, status: "tidak", note: "Tidak dihitung karena keluarga bukan KETM." },
    { name: "Jalur orang tua pindah tugas (Mutasi)", status: "mungkin", note: "Perlu dokumen penugasan. Cek lewat akun." },
  ];

  const notes: string[] = [];
  if (input.jenjang === "smk") notes.push("Data SMK per jurusan belum tersedia di Cek Cepat. Hasil di bawah memakai SMA Negeri.");
  if (!input.lokasi) notes.push("Titik rumah belum ditandai, jadi jarak ke sekolah dihitung kasar dari pusat kecamatan. Ubah isian dan tandai rumah di peta agar jalur Domisili lebih akurat.");
  if (aman.length === 0) notes.push("Peluang negeri masih kecil. Masuk untuk melihat sekolah swasta cadangan.");

  return { routes, schools, strategy, notes };
}

/** Pemetaan isian cek cepat ke isian wizard (id field wizard). NISN tidak pernah ikut. */
export function draftToWizard(input: QuickCheckInput, nama: string): Record<string, string> {
  const data: Record<string, string> = { nama, jenjang: input.jenjang, ketm: input.ketm, kec: input.kecamatan };
  input.nilai.forEach((v, i) => {
    if (v !== null) data[`nilai-${i + 1}`] = String(v).replace(".", ",");
  });
  if (input.prestasi) data.tingkat = input.prestasi;
  return data;
}
