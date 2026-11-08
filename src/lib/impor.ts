import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { PermintaanImpor, ResponsImpor } from "@/lib/kontrak";
import { prisma } from "@/lib/db";

/**
 * Menyimpan agregat hasil src/lib/etl/agregasi.ts ke database.
 * Statistik diganti per sekolah yang ada di impor, sehingga impor satu sekolah
 * tidak menghapus sekolah lain. Semua penulisan (program keahlian baru, statistik, log) ada dalam satu
 * transaksi: bila impor gagal di tengah, tidak ada yang tersimpan setengah jalan.
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

  // Lintasan pertama tanpa menulis apa pun: saring baris yang tidak dikenal dan kumpulkan program yang belum ada.
  const kunciProgram = (sekolahId: number, nama: string) => `${sekolahId}|${nama}`;
  const peringatan = new Set<string>();
  const siap: Array<{ s: PermintaanImpor["statistik"][number]; sekolahId: number; subJalurId: number }> = [];
  const programBaru = new Map<string, { sekolahId: number; nama: string; bidang: string }>();
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
    const kunci = s.program ? kunciProgram(sekolahId, s.program) : null;
    if (s.program && kunci && !idProgram.has(kunci) && !programBaru.has(kunci)) {
      programBaru.set(kunci, { sekolahId, nama: s.program, bidang: s.bidang ?? "" });
      peringatan.add(`Program baru dibuat tanpa kelompok bobot: ${s.program} (${s.namaSekolah})`);
    }
    siap.push({ s, sekolahId, subJalurId });
  }

  const sekolahDiimpor = [...new Set(siap.map((x) => x.sekolahId))];

  const { log, jumlahStatistik } = await prisma.$transaction(
    async (tx) => {
      // Semua program baru dibuat dengan satu query, bukan satu query per program.
      if (programBaru.size > 0) {
        const dibuat = await tx.programKeahlian.createManyAndReturn({
          data: [...programBaru.values()],
          select: { id: true, sekolahId: true, nama: true },
        });
        for (const pr of dibuat) idProgram.set(kunciProgram(pr.sekolahId, pr.nama), pr.id);
      }
      const baris: Prisma.StatistikSeleksiCreateManyInput[] = siap.map(({ s, sekolahId, subJalurId }) => ({
        tahun: p.tahun,
        sekolahId,
        subJalurId,
        programId: s.program ? (idProgram.get(kunciProgram(sekolahId, s.program)) ?? null) : null,
        pendaftar: s.pendaftar,
        pendaftarPilihan1: s.pendaftarPilihan1,
        diterima: s.diterima,
        nilaiMinDiterima: s.nilaiMin,
        nilaiMedianDiterima: s.nilaiMedian,
        nilaiMaksDiterima: s.nilaiMaks,
      }));
      await tx.statistikSeleksi.deleteMany({ where: { tahun: p.tahun, sekolahId: { in: sekolahDiimpor } } });
      await tx.statistikSeleksi.createMany({ data: baris });
      if (p.gantiStatistikKecamatan) {
        await tx.statistikKecamatan.deleteMany({ where: { tahun: p.tahun } });
        await tx.statistikKecamatan.createMany({ data: p.kecamatan.map((k) => ({ ...k, tahun: p.tahun })) });
      }
      const log = await tx.logImpor.create({
        data: {
          tahun: p.tahun,
          namaFile: p.namaFile,
          jumlahBaris: p.jumlahBaris,
          jumlahSekolah: sekolahDiimpor.length,
          adminId,
        },
      });
      return { log, jumlahStatistik: baris.length };
    },
    // Impor satu tahun bisa ribuan baris; batas bawaan 5 detik terlalu ketat untuk database yang baru bangun.
    { timeout: 30_000 },
  );

  return {
    logImporId: log.id,
    jumlahStatistik,
    jumlahSekolah: sekolahDiimpor.length,
    peringatan: [...peringatan],
  };
}
