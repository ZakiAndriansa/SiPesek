import "server-only";
import { prisma } from "@/lib/db";
import { galat } from "@/lib/http";
import type { ResponsDashboard, SekolahRingkas } from "@/lib/kontrak";
import { pilihSekolahRingkas } from "@/lib/peluang/muat";

const persen = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export async function tahunAktif(): Promise<number | null> {
  const t = await prisma.tahunSpmb.findFirst({ where: { aktif: true }, orderBy: { tahun: "desc" } });
  return t?.tahun ?? null;
}

// Daftar tahun SPMB jarang berubah (hanya lewat Aturan SPMB admin), jadi disimpan sebentar di memori instance.
// Dengan begitu permintaan dengan tahun asal-asalan ditolak tanpa query ke database.
const UMUR_TAHUN_MS = 60_000;
let cacheTahun: { tahun: number[]; aktif: number | null; dimuat: number } | null = null;

async function daftarTahun() {
  if (cacheTahun && Date.now() - cacheTahun.dimuat < UMUR_TAHUN_MS) return cacheTahun;
  const baris = await prisma.tahunSpmb.findMany({ select: { tahun: true, aktif: true }, orderBy: { tahun: "desc" } });
  cacheTahun = { tahun: baris.map((b) => b.tahun), aktif: baris.find((b) => b.aktif)?.tahun ?? null, dimuat: Date.now() };
  return cacheTahun;
}

/** Dipanggil setelah admin mengubah aturan atau tahun aktif, agar instance ini langsung memakai daftar baru. */
export function lupakanCacheTahun() {
  cacheTahun = null;
}

/**
 * Baca query dashboard publik. Setiap kombinasi query punya entri cache CDN sendiri, jadi parameter yang tidak
 * dikenal (misalnya `?x=1`) dan tahun yang tidak ada ditolak sebelum menyentuh database. Tanpa ini siapa pun bisa
 * melewati cache dan membuat database menghitung ulang terus.
 * `izin`: parameter lain yang boleh, dengan daftar nilai yang sah.
 * Hasil: tahun yang diminta (atau tahun aktif bila `tahun` kosong), atau respons galat.
 */
export async function bacaQueryDashboard(
  q: URLSearchParams,
  izin: Record<string, readonly string[]> = {},
): Promise<{ tahun: number } | { gagal: Response }> {
  const kenal = new Set(["tahun", ...Object.keys(izin)]);
  const asing = [...new Set(q.keys())].filter((k) => !kenal.has(k));
  if (asing.length > 0) return { gagal: galat(`Parameter tidak dikenal: ${asing.join(", ")}.`, 400) };
  for (const [nama, pilihan] of Object.entries(izin)) {
    const v = q.get(nama);
    if (v !== null && !pilihan.includes(v)) {
      return { gagal: galat(`Nilai ${nama} harus salah satu dari: ${pilihan.join(", ")}.`, 400) };
    }
  }
  const t = q.get("tahun");
  if (t !== null && !/^\d{4}$/.test(t)) return { gagal: galat("Tahun harus 4 angka, misalnya 2026.", 400) };
  const { tahun, aktif } = await daftarTahun();
  const diminta = t === null ? aktif : Number(t);
  if (diminta === null || !tahun.includes(diminta)) return { gagal: galat("Belum ada data SPMB untuk tahun itu.", 404) };
  return { tahun: diminta };
}

type SinyalMinat = {
  totalCek: number;
  anakUnik: number;
  perSekolah: Array<{ sekolahId: number; jumlahCek: number; peluangKecil: number }>;
  perKecamatan: Array<{ kecamatan: string; jumlahCek: number }>;
};

/**
 * Sinyal minat orang tua, dihitung di Postgres. Satu anak dihitung sekali, dari cek terakhirnya, dan hanya cek
 * atas nama anak dengan NISN lazim. Di satu sekolah, anak dihitung "peluang kecil" bila ada jalur PELUANG_KECIL
 * dan tidak ada jalur yang lebih baik (yang lain hanya TIDAK_DIHITUNG).
 * Dulu semua cek beserta semua baris HasilCek dimuat ke aplikasi lalu disaring di JavaScript: 2.000 anak x 20 cek
 * berarti 1,24 juta baris dan 5,6 s. Sekarang hasilnya satu baris, sekitar 0,09 s (benchmark PGlite).
 */
export async function sinyalMinat(tahun: number): Promise<SinyalMinat> {
  const [r] = await prisma.$queryRaw<SinyalMinat[]>`
    WITH cek AS (
      SELECT c.id, c."anakId", c.kecamatan, c."dibuatPada"
      FROM "CekPeluang" c
      JOIN "Anak" a ON a.id = c."anakId"
      WHERE c."tahunAcuan" = ${tahun} AND a."nisnLazim"
    ),
    terakhir AS (
      SELECT DISTINCT ON ("anakId") id, kecamatan FROM cek ORDER BY "anakId", "dibuatPada" DESC, id DESC
    ),
    per_anak_sekolah AS (
      SELECT h."sekolahId",
        bool_or(h.label = 'PELUANG_KECIL') AND bool_and(h.label IN ('PELUANG_KECIL', 'TIDAK_DIHITUNG')) AS kecil
      FROM terakhir t
      JOIN "HasilCek" h ON h."cekId" = t.id
      GROUP BY h."sekolahId", t.id
    )
    SELECT
      (SELECT count(*)::int FROM cek) AS "totalCek",
      (SELECT count(*)::int FROM terakhir) AS "anakUnik",
      (SELECT coalesce(jsonb_agg(jsonb_build_object('sekolahId', "sekolahId", 'jumlahCek', n, 'peluangKecil', k)), '[]'::jsonb)
        FROM (SELECT "sekolahId", count(*)::int AS n, (count(*) FILTER (WHERE kecil))::int AS k
              FROM per_anak_sekolah GROUP BY "sekolahId") s) AS "perSekolah",
      (SELECT coalesce(jsonb_agg(jsonb_build_object('kecamatan', kec, 'jumlahCek', n)), '[]'::jsonb)
        FROM (SELECT coalesce(kecamatan, 'Tidak diisi') AS kec, count(*)::int AS n FROM terakhir GROUP BY 1) k) AS "perKecamatan"`;
  return r;
}

export async function muatDashboard(tahun: number): Promise<ResponsDashboard> {
  const [sekolah, statistik, kecamatan, rayon, dayaTampung, minat] = await Promise.all([
    prisma.sekolah.findMany({ where: { status: "NEGERI" }, select: pilihSekolahRingkas, orderBy: { nama: "asc" } }),
    prisma.statistikSeleksi.findMany({ where: { tahun }, include: { subJalur: true, program: true } }),
    prisma.statistikKecamatan.findMany({ where: { tahun }, orderBy: { kecamatan: "asc" } }),
    prisma.rayon.findMany({
      include: { wilayah: true, sekolah: { where: { status: "NEGERI", kategori: "REGULER" }, select: { nama: true } } },
      orderBy: { kode: "asc" },
    }),
    prisma.dayaTampung.groupBy({ by: ["sekolahId"], where: { tahun }, _sum: { kuota: true } }),
    sinyalMinat(tahun),
  ]);

  const kuota = new Map(dayaTampung.map((d) => [d.sekolahId, d._sum.kuota]));

  const perSekolah = sekolah.map((s) => {
    const st = statistik.filter((x) => x.sekolahId === s.id);
    const lengkap = st.length > 0 && st.every((x) => x.pendaftar !== null);
    const jumlah = (f: (x: (typeof st)[number]) => number | null) => st.reduce((n, x) => n + (f(x) ?? 0), 0);
    const diterima = jumlah((x) => x.diterima);
    const pilihan1 = lengkap ? jumlah((x) => x.pendaftarPilihan1) : null;
    const radius = st
      .filter((x) => x.subJalur.kode === "DOMISILI" && x.nilaiMaksDiterima !== null)
      .map((x) => x.nilaiMaksDiterima!);
    const dt = kuota.get(s.id) ?? null;
    return {
      sekolah: s as SekolahRingkas,
      pendaftar: lengkap ? jumlah((x) => x.pendaftar) : null,
      pendaftarPilihan1: pilihan1,
      diterima,
      tekanan: pilihan1 !== null && diterima > 0 ? Math.round((pilihan1 / diterima) * 100) / 100 : null,
      radiusDomisiliMeter: radius.length ? Math.round(Math.max(...radius)) : null,
      dayaTampung: dt,
      kursiKosong: dt !== null ? Math.max(dt - diterima, 0) : null,
    };
  });

  const semua = kecamatan.filter((k) => k.cakupan === "SEMUA");
  const pendaftarUnik = semua.reduce((n, k) => n + k.pendaftarUnik, 0);
  const diterimaUnik = semua.reduce((n, k) => n + k.diterimaUnik, 0);

  const programSmk = new Map<string, { sekolah: string; program: string; pendaftar: number | null; diterima: number }>();
  for (const x of statistik) {
    if (!x.program) continue;
    const nama = sekolah.find((s) => s.id === x.sekolahId)?.nama ?? "";
    const k = `${nama}|${x.program.nama}`;
    const p = programSmk.get(k) ?? { sekolah: nama, program: x.program.nama, pendaftar: 0, diterima: 0 };
    p.pendaftar = p.pendaftar === null || x.pendaftar === null ? null : p.pendaftar + x.pendaftar;
    p.diterima += x.diterima;
    programSmk.set(k, p);
  }

  const namaSekolah = new Map(sekolah.map((s) => [s.id, s.nama]));

  return {
    tahun,
    ringkas: {
      pendaftarUnik,
      diterimaUnik,
      persenDiterima: persen(diterimaUnik, pendaftarUnik),
      jumlahSekolahNegeri: sekolah.length,
    },
    sekolah: perSekolah,
    kecamatan: kecamatan.map((k) => ({
      kecamatan: k.kecamatan,
      cakupan: k.cakupan as "SMA" | "SMK" | "SEMUA",
      pendaftarUnik: k.pendaftarUnik,
      diterimaUnik: k.diterimaUnik,
      persenDiterima: persen(k.diterimaUnik, k.pendaftarUnik),
    })),
    rayon: rayon.map((r) => ({
      kode: r.kode,
      nama: r.nama,
      kecamatanUtama: r.wilayah.find((w) => w.jenis === "UTAMA")?.kecamatan ?? "",
      irisan: r.wilayah.filter((w) => w.jenis === "IRISAN").map((w) => w.kecamatan),
      smanReguler: r.sekolah.map((s) => s.nama),
    })),
    programSmk: [...programSmk.values()],
    sinyalMinat: {
      totalCek: minat.totalCek,
      anakUnik: minat.anakUnik,
      // Terbanyak dulu, lalu menurut nama, agar urutannya sama di setiap hitung ulang.
      perSekolah: minat.perSekolah
        .map((m) => ({
          sekolahId: m.sekolahId,
          nama: namaSekolah.get(m.sekolahId) ?? "",
          jumlahCek: m.jumlahCek,
          peluangKecil: m.peluangKecil,
        }))
        .sort((a, b) => b.jumlahCek - a.jumlahCek || a.nama.localeCompare(b.nama)),
      perKecamatan: [...minat.perKecamatan].sort(
        (a, b) => b.jumlahCek - a.jumlahCek || a.kecamatan.localeCompare(b.kecamatan),
      ),
    },
  };
}
