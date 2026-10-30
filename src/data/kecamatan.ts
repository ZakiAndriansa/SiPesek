// Data contoh per kecamatan: lulusan SMP, kursi negeri, dan jumlah pengguna simulasi.
// `pengguna: null` = disamarkan karena kurang dari 10 pengguna.
export type Kecamatan = {
  name: string;
  lulusan: number;
  kursi: number;
  pengguna: number | null;
};

export const KECAMATAN: Kecamatan[] = [
  { name: "Harapan Jaya", lulusan: 2140, kursi: 1280, pengguna: 3412 },
  { name: "Mekar Sari", lulusan: 1860, kursi: 832, pengguna: 2940 },
  { name: "Sukamaju Utara", lulusan: 1620, kursi: 960, pengguna: 2215 },
  { name: "Tirta Indah", lulusan: 1430, kursi: 384, pengguna: 1806 },
  { name: "Bukit Asri", lulusan: 980, kursi: 0, pengguna: null },
  { name: "Lembah Hijau", lulusan: 1210, kursi: 512, pengguna: 2099 },
];

export const KEC_NAMES = KECAMATAN.map((k) => k.name);
/** Opsi filter dashboard. */
export const KEC_FILTER = ["Semua wilayah", ...KEC_NAMES];

export const fmt = (n: number) => n.toLocaleString("id-ID");
export const rasio = (k: Kecamatan) => Math.round((k.kursi / k.lulusan) * 100);

/** Cukup >= 55%, Terbatas 35-54%, Kurang < 35%. */
export function statusRasio(percent: number): {
  kind: "aman" | "bersaing" | "berisiko";
  label: string;
} {
  return percent >= 55
    ? { kind: "aman", label: "Cukup" }
    : percent >= 35
      ? { kind: "bersaing", label: "Terbatas" }
      : { kind: "berisiko", label: "Kurang" };
}
