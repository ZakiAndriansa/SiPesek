// Cek Cepat (tamu): bentuk isian, validasi, dan pengolahan hasil mesin peluang asli (POST /api/peluang mode tamu).
// Fungsi di sini murni dan dipakai di browser. Server menghitung lalu membuang isian; tidak ada yang disimpan.
import { SUB_JALUR } from "@/lib/jalur";
import {
  KECAMATAN_DEPOK,
  KECAMATAN_IRISAN_LUAR,
  KECAMATAN_LAINNYA,
  type HasilJalur,
  type HasilSekolah,
  type LabelPeluang,
  type PermintaanPeluang,
  type ResponsPeluang,
  type SkorAnak,
} from "@/lib/kontrak";
import { formatJarak } from "@/lib/peluang/jarak";

export const JENJANG = ["sma", "smk", "belum"] as const;
export const KETM = ["ya", "tidak", "ragu"] as const;
export const SEMESTER_COUNT = 5;
export const MAPEL = [
  ["bin", "Bahasa Indonesia"],
  ["mtk", "Matematika"],
  ["ipa", "IPA"],
  ["ips", "IPS"],
  ["bing", "Bahasa Inggris"],
] as const;
export type KodeMapel = (typeof MAPEL)[number][0];

/** Kecamatan sesuai KK: 11 kecamatan Depok, kecamatan tetangga yang masuk rayon SMAN Depok, atau Lainnya. */
export const KECAMATAN_KK: string[] = [...KECAMATAN_DEPOK, ...KECAMATAN_IRISAN_LUAR, KECAMATAN_LAINNYA];

export type Titik = { lat: number; lng: number };

/** Wilayah layanan: Kota Depok beserta kecamatan tetangga yang masuk rayon (garis lintang dan bujur). */
export const WILAYAH = { selatan: -6.56, utara: -6.28, barat: 106.62, timur: 106.98 } as const;
export const PUSAT_DEPOK: Titik = { lat: -6.4025, lng: 106.7942 };
export const diWilayah = (t: Titik) =>
  t.lat >= WILAYAH.selatan && t.lat <= WILAYAH.utara && t.lng >= WILAYAH.barat && t.lng <= WILAYAH.timur;

export type QuickCheckInput = {
  jenjang: (typeof JENJANG)[number];
  /** Rata-rata rapor tiap semester 1 sampai 5; null = dikosongkan. */
  nilai: (number | null)[];
  /** Nilai TKA, hanya untuk SMA. */
  tkaBin: number | null;
  tkaMtk: number | null;
  /** Rata-rata 5 mapel selama 5 semester, untuk Kelas Industri SMK. */
  mapel: Record<KodeMapel, number | null>;
  ketm: (typeof KETM)[number];
  disabilitas: boolean;
  pindahTugas: boolean;
  /** Kecamatan sesuai KK, dipakai untuk rayon Jalur Domisili SMA. */
  kecamatan: string;
  /** Titik rumah. Hanya di memori tab; dikirim ke server untuk menghitung jarak lalu dibuang. */
  lokasi: Titik | null;
};

/**
 * Draf di memori tab untuk disimpan ke akun lewat POST /api/ortu/simpan-cek. Memuat NISN dan titik rumah
 * karena server menghitung ulang hasilnya, tetapi tidak pernah ditulis ke cookie, penyimpanan browser, atau URL.
 */
export type QuickDraft = { input: QuickCheckInput; nisn: string };

export const isValidNisn = (value: string) => /^\d{10}$/.test(value);

export const parseNumber = (raw: string): number | null => {
  const text = raw.trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const nilaiSah = (v: unknown) => v === null || (typeof v === "number" && v >= 0 && v <= 100);
const PESAN_NILAI = "Nilai ditulis dengan angka 0 sampai 100, misalnya 85,5.";

/** Validasi bentuk isian. Titik rumah diperiksa hanya bila ada. Mengembalikan pesan error atau null. */
export function validateInput(input: unknown): string | null {
  const i = input as Partial<QuickCheckInput> | null;
  if (!i || typeof i !== "object") return "Isian tidak terbaca. Coba isi ulang.";
  if (!JENJANG.includes(i.jenjang as never)) return "Pilih jenjang tujuan.";
  if (!KETM.includes(i.ketm as never)) return "Pilih jawaban untuk kondisi keluarga.";
  if (!i.kecamatan || !KECAMATAN_KK.includes(i.kecamatan)) return "Pilih kecamatan sesuai Kartu Keluarga.";
  if (i.lokasi != null && !diWilayah(i.lokasi)) return "Titik rumah di luar Depok dan sekitarnya. Tandai ulang di peta.";
  if (!Array.isArray(i.nilai) || i.nilai.length !== SEMESTER_COUNT) return "Nilai semester tidak terbaca.";
  if (!i.nilai.every(nilaiSah) || !nilaiSah(i.tkaBin ?? null) || !nilaiSah(i.tkaMtk ?? null)) return PESAN_NILAI;
  if (!i.mapel || !MAPEL.every(([k]) => nilaiSah(i.mapel?.[k] ?? null))) return PESAN_NILAI;
  return null;
}

const rata = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const isi = (xs: (number | null)[]) => xs.filter((v): v is number => v !== null);

/** Isian Cek Cepat ke permintaan POST /api/peluang mode tamu. */
export function toRequest(input: QuickCheckInput, nisn: string, lokasi: Titik): PermintaanPeluang {
  const semester = isi(input.nilai);
  const mapel = MAPEL.map(([k]) => input.mapel[k]);
  const nilai: NonNullable<PermintaanPeluang["nilai"]> = {};
  if (semester.length) nilai.rataRapor = Math.round(rata(semester) * 100) / 100;
  if (input.jenjang !== "smk" && input.tkaBin !== null) nilai.tkaBin = input.tkaBin;
  if (input.jenjang !== "smk" && input.tkaMtk !== null) nilai.tkaMtk = input.tkaMtk;
  if (input.jenjang !== "sma" && mapel.every((v) => v !== null)) {
    nilai.mapel = Object.fromEntries(MAPEL.map(([k]) => [k, input.mapel[k]])) as Record<KodeMapel, number>;
  }
  return {
    nisn,
    jenjang: input.jenjang === "sma" ? "SMA" : input.jenjang === "smk" ? "SMK" : "SEMUA",
    lokasi,
    kecamatan: input.kecamatan,
    kondisi: { ketm: input.ketm === "ya", disabilitas: input.disabilitas, anakGuruSekolahId: null, pindahTugas: input.pindahTugas },
    nilai,
  };
}

// ---------- Membaca hasil mesin ----------

/** Label mesin ke jenis badge yang sudah ada. */
export const KIND: Record<LabelPeluang, string> = {
  PELUANG_BESAR: "aman",
  MASIH_MUNGKIN: "bersaing",
  PELUANG_KECIL: "berisiko",
  TIDAK_DIHITUNG: "info",
};
export const badgeText = (label: LabelPeluang) => (label === "TIDAK_DIHITUNG" ? "Belum dihitung" : undefined);

const NAMA_LABEL: Record<LabelPeluang, string> = {
  PELUANG_BESAR: "Peluang besar",
  MASIH_MUNGKIN: "Masih mungkin",
  PELUANG_KECIL: "Peluang kecil",
  TIDAK_DIHITUNG: "Belum dihitung",
};
const angka = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
export const namaJalur = (j: HasilJalur) => (j.programKeahlian ? `${j.namaJalur}, jurusan ${j.programKeahlian}` : j.namaJalur);

/** Fakta singkat di kartu sekolah untuk jalur terbaik. */
export function faktaSekolah(h: HasilSekolah, j: HasilJalur = h.jalur[0]): [string, string][] {
  const fakta: [string, string][] = [];
  if (h.jarakMeter !== null) fakta.push(["Jarak rumah (garis lurus)", formatJarak(h.jarakMeter)]);
  const p = j.pembanding;
  if (j.label === "TIDAK_DIHITUNG" || !p) return fakta;
  if (j.satuan === "meter") {
    if (p.median !== null) fakta.push([`Separuh yang diterima ${p.tahun} tinggal dalam`, formatJarak(p.median)]);
    if (p.maks !== null) fakta.push(["Terjauh yang diterima", formatJarak(p.maks)]);
  } else {
    if (j.nilaiAnak !== null) fakta.push(["Perkiraan skor anak", angka(j.nilaiAnak)]);
    if (p.min !== null) fakta.push([`Skor terendah diterima ${p.tahun}`, angka(p.min)]);
  }
  return fakta;
}

/** Jalur lain di sekolah yang sama, misalnya "Nilai rapor: Masih mungkin". */
export const jalurLain = (h: HasilSekolah) => h.jalur.slice(1).map((j) => `${namaJalur(j)}: ${NAMA_LABEL[j.label]}`);

export type RingkasJalur = { kode: string; nama: string; teks: string; terhitung: boolean };

/** Jalur utama (Domisili, Afirmasi, Prestasi, Mutasi) beserta namanya. */
export const JALUR_UTAMA = [
  ["DOMISILI", "Jalur Domisili"],
  ["AFIRMASI", "Jalur Afirmasi"],
  ["PRESTASI", "Jalur Prestasi"],
  ["MUTASI", "Jalur Mutasi"],
] as const;
const KE_JALUR = new Map<string, string>(SUB_JALUR.map((s) => [s.kode, s.jalurKode]));

/** Kode jalur utama dari kode sub-jalur, mis. "PRESTASI_AKD_RAPOR" menjadi "PRESTASI". */
export const jalurUtama = (subJalurKode: string) => KE_JALUR.get(subJalurKode) ?? null;

/** Ringkasan per jalur utama: berapa sekolah per label, atau alasan jalur itu belum dihitung. */
export function ringkasJalur(hasil: HasilSekolah[], input: QuickCheckInput | null): RingkasJalur[] {
  return JALUR_UTAMA.map(([kode, nama]) => {
    const semua = hasil.flatMap((h) => h.jalur).filter((j) => KE_JALUR.get(j.subJalurKode) === kode);
    const hitung = new Map<LabelPeluang, number>();
    for (const h of hasil) {
      const terbaik = h.jalur.find((j) => KE_JALUR.get(j.subJalurKode) === kode && j.label !== "TIDAK_DIHITUNG");
      if (terbaik) hitung.set(terbaik.label, (hitung.get(terbaik.label) ?? 0) + 1);
    }
    if (hitung.size > 0) {
      const urut: LabelPeluang[] = ["PELUANG_BESAR", "MASIH_MUNGKIN", "PELUANG_KECIL"];
      const teks = urut.filter((l) => hitung.has(l)).map((l) => `${NAMA_LABEL[l]} di ${hitung.get(l)} sekolah`).join(", ");
      return { kode, nama, teks: `${teks}.`, terhitung: true };
    }
    const belum = semua.find((j) => j.label === "TIDAK_DIHITUNG");
    return { kode, nama, teks: belum?.kalimat ?? alasanTertutup(kode, input), terhitung: false };
  });
}

function alasanTertutup(kode: string, input: QuickCheckInput | null): string {
  switch (kode) {
    case "DOMISILI":
      return "Kecamatan di KK tidak masuk rayon SMA negeri Depok, dan belum ada SMK negeri yang cocok dengan jenjang tujuan.";
    case "AFIRMASI":
      return input?.ketm === "ragu"
        ? "Belum dihitung karena status KETM belum pasti. Cek dulu apakah keluarga terdaftar di DTSEN."
        : "Dihitung bila keluarga termasuk KETM atau anak penyandang disabilitas.";
    case "PRESTASI":
      return "Isi nilai rapor untuk menghitung jalur ini.";
    default:
      return "Dihitung bila orang tua pindah tugas ke Depok. Jalur anak guru belum bisa dicek di Cek Cepat.";
  }
}

export type PilihanStrategi = {
  sekolahId: number;
  name: string;
  role: string;
  jalur: string;
  kind: string;
  label: LabelPeluang;
  jarakMeter: number | null;
};

const PERAN: Record<LabelPeluang, string> = {
  PELUANG_BESAR: "Pilihan aman",
  MASIH_MUNGKIN: "Pilihan ambisius",
  PELUANG_KECIL: "Pilihan tambahan",
  TIDAK_DIHITUNG: "Pilihan tambahan",
};

/** Strategi 3 pilihan: satu ambisius (Masih mungkin), dua aman (Peluang besar), dari hasil yang sudah terurut. */
export function strategi(hasil: HasilSekolah[]): PilihanStrategi[] {
  const terhitung = hasil.filter((h) => h.labelTerbaik !== "TIDAK_DIHITUNG");
  const ambisius = terhitung.find((h) => h.labelTerbaik === "MASIH_MUNGKIN");
  const aman = terhitung.filter((h) => h.labelTerbaik === "PELUANG_BESAR");
  const pilih = [ambisius, aman[0], aman[1]].filter((h): h is HasilSekolah => !!h);
  for (const h of terhitung) if (pilih.length < 3 && !pilih.includes(h)) pilih.push(h);
  return pilih.map((h) => keStrategi(h));
}

/** Satu sekolah sebagai baris pilihan; `role` mengikuti label terbaiknya bila tidak diberikan. */
export function keStrategi(h: HasilSekolah, role = PERAN[h.labelTerbaik]): PilihanStrategi {
  return {
    sekolahId: h.sekolah.id,
    name: h.sekolah.nama,
    role,
    jalur: namaJalur(h.jalur[0]),
    kind: KIND[h.labelTerbaik],
    label: h.labelTerbaik,
    jarakMeter: h.jarakMeter,
  };
}

export type Ringkasan = {
  /** Label terbaik yang dimiliki sekolah, mis. "Peluang besar di 11 dari 15"; null bila semua kecil. */
  sorotan: { label: LabelPeluang; n: number; total: number } | null;
  jumlah: { label: LabelPeluang; n: number }[];
};

/** Jawaban peluang di puncak hasil: label terbaik dan jumlah sekolahnya, beserta jumlah per label. */
export function ringkasan(hasil: HasilSekolah[]): Ringkasan {
  const n = (l: LabelPeluang) => hasil.filter((h) => h.labelTerbaik === l).length;
  const terbaik = (["PELUANG_BESAR", "MASIH_MUNGKIN"] as const).find((l) => n(l) > 0);
  const urut: LabelPeluang[] = ["PELUANG_BESAR", "MASIH_MUNGKIN", "PELUANG_KECIL", "TIDAK_DIHITUNG"];
  return {
    sorotan: terbaik ? { label: terbaik, n: n(terbaik), total: hasil.length } : null,
    jumlah: urut.map((label) => ({ label, n: n(label) })).filter((x) => x.n > 0),
  };
}

/** Catatan yang perlu diperhatikan di atas hasil (hanya bila ada). `input` null untuk hasil tersimpan. */
export function catatanHasil(r: ResponsPeluang, input: QuickCheckInput | null): string[] {
  const catatan: string[] = [];
  if (r.nisnLazim === false) catatan.push("NISN ini tidak lazim untuk calon siswa SMA atau SMK. Pastikan NISN sudah benar di situs resmi.");
  const semester = isi(input?.nilai ?? []).length;
  if (semester > 0 && semester < SEMESTER_COUNT) {
    catatan.push(`Rata-rata rapor dihitung dari ${semester} semester yang diisi. Lengkapi 5 semester agar perkiraan Jalur Prestasi lebih tepat.`);
  }
  return catatan;
}

export const namaLabel = (l: LabelPeluang) => NAMA_LABEL[l];

/** Nama skor untuk orang tua, mis. "Jalur Prestasi SMA (rapor dan TKA)". */
export function judulSkor(s: SkorAnak): string {
  if (s.kelompok) return `Kelas Industri SMK, program ${s.kelompok.toLowerCase()}`;
  return `Jalur Prestasi ${s.jenjang} (${s.rumus.includes("TKA") ? "rapor dan TKA" : "rapor"})`;
}

/** Di berapa sekolah skor anak sudah mencapai skor terendah yang diterima (label Peluang besar atau Masih mungkin). */
export function posisiSkor(s: SkorAnak, hasil: HasilSekolah[]): { atas: number; total: number } | null {
  if (s.nilai === null || s.kelompok) return null;
  const jalur = hasil
    .filter((h) => h.sekolah.jenjang === s.jenjang)
    .map((h) => h.jalur.find((j) => j.subJalurKode === s.subJalurKode && j.label !== "TIDAK_DIHITUNG"))
    .filter((j): j is HasilJalur => !!j);
  if (jalur.length === 0) return null;
  return { atas: jalur.filter((j) => j.label === "PELUANG_BESAR" || j.label === "MASIH_MUNGKIN").length, total: jalur.length };
}

export const angkaSkor = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 1 });

/** Satu baris pembanding untuk laporan cetak, mis. "Rumah 3,5 km; terjauh diterima 4,1 km". */
export function pembandingSingkat(j: HasilJalur): string {
  const p = j.pembanding;
  if (j.label === "TIDAK_DIHITUNG" || !p || j.nilaiAnak === null) return "Belum dihitung";
  return j.satuan === "meter"
    ? `Rumah ${formatJarak(j.nilaiAnak)}; terjauh diterima ${p.maks === null ? "-" : formatJarak(p.maks)}`
    : `Skor ${angkaSkor(j.nilaiAnak)}; terendah diterima ${p.min === null ? "-" : angkaSkor(p.min)}`;
}

