import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { PermintaanImpor, ResponsImpor } from "@/lib/kontrak";
import { prisma } from "@/lib/db";

/**
 * Menyimpan agregat hasil src/lib/etl/agregasi.ts ke database.
 * Statistik diganti per sekolah yang ada di impor, sehingga impor satu sekolah
 * tidak menghapus sekolah lain.
 */
export async function simpanImpor(p: PermintaanImpor, adminId: number | null): Promise<ResponsImpor> {
  const [sekolah, subJalur, program] = await Promise.all([
    prisma.sekolah.findMany({ where: { kodeDiData: { not: null } }, select: { id: true, kodeDiData: true } }),
    prisma.subJalur.findMany({ select: { id: true, namaDiData: true } }),
    prisma.programKeahlian.findMany({ select: { id: true, sekolahId: true, nama: true } }),
  ]);
  const idSekolah = new Map(sekolah.map((s) => [s.kodeDiData!, s.id]));
  const idSubJalur = new Map(subJalur.map((s) => [s.namaDiData, s.id]));
  const idProgram = new Map(program.map((pr) => [`${pr.sekolahId}|${pr.nama}`, pr.id]));

  const peringatan = new Set<string>();
  const baris: Prisma.StatistikSeleksiCreateManyInput[] = [];
  for (const s of p.statistik) {
    const sekolahId = idSekolah.get(s.kodeSekolah);
    const subJalurId = idSubJalur.get(s.subJalur);
    if (!sekolahId) {
      peringatan.add(`Sekolah tidak dikenal: ${s.kodeSekolah} (${s.namaSekolah})`);
      continue;
    }
    if (!subJalurId) {
      peringatan.add(`Sub jalur tidak dikenal: "${s.subJalur}"`);
      continue;
    }
    let programId: number | null = null;
    if (s.program) {
      programId = idProgram.get(`${sekolahId}|${s.program}`) ?? null;
      if (!programId) {
        const baru = await prisma.programKeahlian.create({
          data: { sekolahId, nama: s.program, bidang: s.bidang ?? "" },
        });
        programId = baru.id;
        idProgram.set(`${sekolahId}|${s.program}`, programId);
        peringatan.add(`Program baru dibuat tanpa kelompok bobot: ${s.program} (${s.namaSekolah})`);
      }
    }
    baris.push({
      tahun: p.tahun,
      sekolahId,
      subJalurId,
      programId,
      pendaftar: s.pendaftar,
      pendaftarPilihan1: s.pendaftarPilihan1,
      diterima: s.diterima,
      nilaiMinDiterima: s.nilaiMin,
      nilaiMedianDiterima: s.nilaiMedian,
      nilaiMaksDiterima: s.nilaiMaks,
    });
  }

  const sekolahDiimpor = [...new Set(baris.map((b) => b.sekolahId))];

  const log = await prisma.$transaction(async (tx) => {
    await tx.statistikSeleksi.deleteMany({ where: { tahun: p.tahun, sekolahId: { in: sekolahDiimpor } } });
    await tx.statistikSeleksi.createMany({ data: baris });
    if (p.gantiStatistikKecamatan) {
      await tx.statistikKecamatan.deleteMany({ where: { tahun: p.tahun } });
      await tx.statistikKecamatan.createMany({ data: p.kecamatan.map((k) => ({ ...k, tahun: p.tahun })) });
    }
    return tx.logImpor.create({
      data: {
        tahun: p.tahun,
        namaFile: p.namaFile,
        jumlahBaris: p.jumlahBaris,
        jumlahSekolah: sekolahDiimpor.length,
        adminId,
      },
    });
  });

  return {
    logImporId: log.id,
    jumlahStatistik: baris.length,
    jumlahSekolah: sekolahDiimpor.length,
    peringatan: [...peringatan],
  };
}
