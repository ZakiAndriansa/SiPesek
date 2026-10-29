import { prisma } from "@/lib/db";
import type { KodeSubJalur } from "@/lib/jalur";
import type { SekolahRingkas } from "@/lib/kontrak";
import { skemaAturan } from "@/lib/validasi";
import type { DataMesin } from "./mesin";

// Data referensi jarang berubah; simpan sebentar di memori agar tiap cek tidak memicu 5 query.
const UMUR_CACHE_MS = 60_000;
let cache: { data: DataMesin; sampai: number } | null = null;

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

export async function muatDataMesin(): Promise<DataMesin> {
  if (cache && cache.sampai > Date.now()) return cache.data;

  const tahunAktif = await prisma.tahunSpmb.findFirst({ where: { aktif: true }, orderBy: { tahun: "desc" } });
  if (!tahunAktif) throw new Error("Belum ada tahun SPMB yang aktif. Jalankan npm run db:seed.");

  const [sekolah, wilayah, statistik] = await Promise.all([
    prisma.sekolah.findMany({
      select: { ...pilihSekolahRingkas, biayaRingkas: true, biayaResmi: true, biayaUrl: true },
    }),
    prisma.rayonKecamatan.findMany(),
    prisma.statistikSeleksi.findMany({
      where: { tahun: tahunAktif.tahun },
      include: { subJalur: true, program: true },
    }),
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
  cache = { data, sampai: Date.now() + UMUR_CACHE_MS };
  return data;
}
