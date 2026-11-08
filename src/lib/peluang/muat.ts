import "server-only";
import { prisma } from "@/lib/db";
import type { KodeSubJalur } from "@/lib/jalur";
import type { SekolahRingkas } from "@/lib/kontrak";
import { skemaAturan } from "@/lib/validasi";
import type { DataMesin } from "./mesin";

// Data referensi jarang berubah, jadi disimpan di memori tiap instance:
// 1. Lebih muda dari UMUR_SEGAR_MS: langsung dipakai.
// 2. Lebih tua tetapi belum UMUR_MAKS_MS: tetap dipakai, sambil dimuat ulang di latar (stale-while-revalidate),
//    agar tidak ada permintaan yang menunggu query setiap kali cache habis.
// 3. Tidak ada atau terlalu tua: ditunggu. Permintaan serentak berbagi satu muatan, bukan masing-masing query.
const UMUR_SEGAR_MS = 60_000;
const UMUR_MAKS_MS = 30 * 60_000;
type Cache = { data: DataMesin; idSubJalur: Map<string, number>; dimuat: number };
let cache: Cache | null = null;
let sedangMuat: Promise<Cache> | null = null;

/** Dipanggil setelah admin mengubah data; permintaan berikutnya di instance ini memuat ulang. */
export function lupakanCacheMesin() {
  cache = null;
}

export const pilihSekolahRingkas = {
  id: true,
  npsn: true,
  nama: true,
  jenjang: true,
  status: true,
  kategori: true,
  alamat: true,
  kecamatan: true,
  lat: true,
  lng: true,
  akreditasi: true,
  rayonKode: true,
} as const;

function muatBaru(): Promise<Cache> {
  sedangMuat ??= ambilDariDatabase()
    .then((baru) => (cache = baru))
    .finally(() => {
      sedangMuat = null;
    });
  return sedangMuat;
}

export async function muatDataMesin(): Promise<DataMesin> {
  const umur = cache ? Date.now() - cache.dimuat : Infinity;
  if (cache && umur < UMUR_SEGAR_MS) return cache.data;
  if (cache && umur < UMUR_MAKS_MS) {
    // Gagal memuat ulang di latar tidak masalah: cache lama tetap dipakai sampai percobaan berikutnya.
    void muatBaru().catch(() => {});
    return cache.data;
  }
  return (await muatBaru()).data;
}

/** Id sub jalur per kode, dari muatan yang sama (dipakai saat menyimpan detail hasil). */
export async function muatIdSubJalur(): Promise<Map<string, number>> {
  await muatDataMesin();
  return (cache ?? (await muatBaru())).idSubJalur;
}

async function ambilDariDatabase(): Promise<Cache> {
  const tahunAktif = await prisma.tahunSpmb.findFirst({ where: { aktif: true }, orderBy: { tahun: "desc" } });
  if (!tahunAktif) throw new Error("Belum ada tahun SPMB yang aktif. Jalankan npm run db:seed.");

  const [sekolah, wilayah, statistik, subJalur] = await Promise.all([
    prisma.sekolah.findMany({
      select: { ...pilihSekolahRingkas, biayaRingkas: true, biayaResmi: true, biayaUrl: true },
    }),
    prisma.rayonKecamatan.findMany(),
    prisma.statistikSeleksi.findMany({
      where: { tahun: tahunAktif.tahun },
      include: { subJalur: true, program: true },
    }),
    prisma.subJalur.findMany({ select: { id: true, kode: true } }),
  ]);

  const rayon = new Map<string, Set<string>>();
  for (const w of wilayah) {
    if (!rayon.has(w.rayonKode)) rayon.set(w.rayonKode, new Set());
    rayon.get(w.rayonKode)!.add(w.kecamatan);
  }

  const data: DataMesin = {
    tahun: tahunAktif.tahun,
    aturan: skemaAturan.parse(tahunAktif.aturan),
    rayon,
    sekolah: sekolah.map(({ biayaRingkas, biayaResmi, biayaUrl, ...s }) => ({
      ...(s as SekolahRingkas),
      biaya: biayaRingkas ? { ringkas: biayaRingkas, resmi: biayaResmi ?? false, url: biayaUrl ?? "" } : null,
    })),
    statistik: statistik.map((s) => ({
      sekolahId: s.sekolahId,
      subJalurKode: s.subJalur.kode as KodeSubJalur,
      subJalurNama: s.subJalur.namaTampilan,
      metrik: s.subJalur.metrik,
      program: s.program ? { nama: s.program.nama, kelompokBobot: s.program.kelompokBobot } : null,
      pendaftar: s.pendaftar,
      diterima: s.diterima,
      min: s.nilaiMinDiterima,
      median: s.nilaiMedianDiterima,
      maks: s.nilaiMaksDiterima,
    })),
  };
  return { data, idSubJalur: new Map(subJalur.map((s) => [s.kode, s.id])), dimuat: Date.now() };
}
