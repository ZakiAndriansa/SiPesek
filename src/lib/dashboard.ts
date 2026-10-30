import "server-only";
import { prisma } from "@/lib/db";
import type { ResponsDashboard, SekolahRingkas } from "@/lib/kontrak";
import { pilihSekolahRingkas } from "@/lib/peluang/muat";

const persen = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

export async function tahunAktif(): Promise<number | null> {
  const t = await prisma.tahunSpmb.findFirst({ where: { aktif: true }, orderBy: { tahun: "desc" } });
  return t?.tahun ?? null;
}

/** Tahun dari query `?tahun=`, atau tahun aktif bila kosong atau tidak valid. */
export async function tahunDiminta(nilai: string | null): Promise<number | null> {
  const diminta = Number(nilai);
  return Number.isInteger(diminta) && diminta > 0 ? diminta : tahunAktif();
}

export async function muatDashboard(tahun: number): Promise<ResponsDashboard> {
  const [sekolah, statistik, kecamatan, rayon, dayaTampung, cekAnak] = await Promise.all([
    prisma.sekolah.findMany({ where: { status: "NEGERI" }, select: pilihSekolahRingkas, orderBy: { nama: "asc" } }),
    prisma.statistikSeleksi.findMany({ where: { tahun }, include: { subJalur: true, program: true } }),
    prisma.statistikKecamatan.findMany({ where: { tahun }, orderBy: { kecamatan: "asc" } }),
    prisma.rayon.findMany({
      include: { wilayah: true, sekolah: { where: { status: "NEGERI", kategori: "REGULER" }, select: { nama: true } } },
      orderBy: { kode: "asc" },
    }),
    prisma.dayaTampung.groupBy({ by: ["sekolahId"], where: { tahun }, _sum: { kuota: true } }),
    // Hanya cek atas nama anak dengan NISN lazim; cek lama tanpa anak tidak dihitung.
    prisma.cekPeluang.findMany({
      where: { tahunAcuan: tahun, anak: { nisnLazim: true } },
      select: { anakId: true, kecamatan: true, detail: { select: { sekolahId: true, label: true } } },
      orderBy: { dibuatPada: "desc" },
    }),
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

  // Satu anak dihitung sekali, dari cek terakhirnya (cekAnak sudah urut terbaru dulu).
  const cekTerakhir = new Map<number, (typeof cekAnak)[number]>();
  for (const c of cekAnak) if (c.anakId !== null && !cekTerakhir.has(c.anakId)) cekTerakhir.set(c.anakId, c);

  const minat = new Map<number, { jumlahCek: number; peluangKecil: number }>();
  const minatKecamatan = new Map<string, number>();
  for (const c of cekTerakhir.values()) {
    const kec = c.kecamatan ?? "Tidak diisi";
    minatKecamatan.set(kec, (minatKecamatan.get(kec) ?? 0) + 1);

    const labelPerSekolah = new Map<number, string[]>();
    for (const d of c.detail) labelPerSekolah.set(d.sekolahId, [...(labelPerSekolah.get(d.sekolahId) ?? []), d.label]);
    for (const [sekolahId, label] of labelPerSekolah) {
      const m = minat.get(sekolahId) ?? { jumlahCek: 0, peluangKecil: 0 };
      m.jumlahCek += 1;
      // "Peluang kecil" bila tidak ada jalur yang lebih baik di sekolah itu.
      if (label.includes("PELUANG_KECIL") && label.every((l) => l === "PELUANG_KECIL" || l === "TIDAK_DIHITUNG")) {
        m.peluangKecil += 1;
      }
      minat.set(sekolahId, m);
    }
  }

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
      totalCek: cekAnak.length,
      anakUnik: cekTerakhir.size,
      perSekolah: [...minat.entries()]
        .map(([sekolahId, m]) => ({ sekolahId, nama: sekolah.find((s) => s.id === sekolahId)?.nama ?? "", ...m }))
        .sort((a, b) => b.jumlahCek - a.jumlahCek),
      perKecamatan: [...minatKecamatan.entries()]
        .map(([kecamatan, jumlahCek]) => ({ kecamatan, jumlahCek }))
        .sort((a, b) => b.jumlahCek - a.jumlahCek),
    },
  };
}
