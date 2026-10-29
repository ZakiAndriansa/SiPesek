/**
 * Mesin peluang SiPesek: fungsi murni tanpa akses database.
 * Data disiapkan oleh pemanggil (src/lib/peluang/muat.ts) agar mesin mudah diuji.
 */
import type {
  AlternatifSwasta,
  HasilJalur,
  HasilSekolah,
  Jenjang,
  LabelPeluang,
  PermintaanPeluang,
  SekolahRingkas,
} from "@/lib/kontrak";
import type { KodeSubJalur } from "@/lib/jalur";
import type { Aturan } from "@/lib/validasi";
import { bulat50, formatJarak, jarakMeter } from "./jarak";
import { hitungSkor } from "./skor";

export type SekolahMesin = SekolahRingkas & {
  biaya: AlternatifSwasta["biaya"];
};

export type StatistikMesin = {
  sekolahId: number;
  subJalurKode: KodeSubJalur;
  subJalurNama: string;
  metrik: "JARAK_METER" | "SKOR";
  program: { nama: string; kelompokBobot: string | null } | null;
  pendaftar: number | null;
  diterima: number;
  min: number | null;
  median: number | null;
  maks: number | null;
};

export type DataMesin = {
  tahun: number;
  aturan: Aturan;
  sekolah: SekolahMesin[];
  /** rayonKode → kecamatan utama dan irisan. */
  rayon: Map<string, Set<string>>;
  statistik: StatistikMesin[];
};

export type HasilMesin = {
  tahunAcuan: number;
  hasil: HasilSekolah[];
  swasta: { SMA: AlternatifSwasta[]; SMK: AlternatifSwasta[] };
  catatan: string;
};

const URUTAN_LABEL: Record<LabelPeluang, number> = {
  PELUANG_BESAR: 0,
  MASIH_MUNGKIN: 1,
  PELUANG_KECIL: 2,
  TIDAK_DIHITUNG: 3,
};

const JUMLAH_SWASTA = 5;

const angka = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });

function labelJarak(jarak: number, s: StatistikMesin): LabelPeluang {
  if (s.median !== null && jarak <= s.median) return "PELUANG_BESAR";
  if (s.maks !== null && jarak <= s.maks) return "MASIH_MUNGKIN";
  return "PELUANG_KECIL";
}

function labelSkor(skor: number, s: StatistikMesin): LabelPeluang {
  if (s.median !== null && skor >= s.median) return "PELUANG_BESAR";
  if (s.min !== null && skor >= s.min) return "MASIH_MUNGKIN";
  return "PELUANG_KECIL";
}

/** Apakah sub jalur ini terbuka bagi anak di sekolah ini. */
function berlaku(s: StatistikMesin, sekolah: SekolahMesin, p: PermintaanPeluang, data: DataMesin): boolean {
  switch (s.subJalurKode) {
    case "DOMISILI":
      // SMA memakai rayon (juknis 2026). SMK tidak memakai rayon.
      if (sekolah.jenjang === "SMK") return true;
      return sekolah.rayonKode !== null && (data.rayon.get(sekolah.rayonKode)?.has(p.kecamatan) ?? false);
    case "AFIRMASI_KETM":
      return p.kondisi.ketm;
    case "AFIRMASI_MBK":
      return p.kondisi.disabilitas;
    case "MUTASI_ANAK_GURU":
      return p.kondisi.anakGuruSekolahId === sekolah.id;
    case "MUTASI_PINDAH_TUGAS":
      return p.kondisi.pindahTugas;
    case "PRESTASI_AKD_RAPOR":
    case "PRESTASI_KELAS_INDUSTRI":
      return true;
    case "UNGGULAN_RAPOR":
      return sekolah.kategori === "UNGGULAN_PROVINSI";
    default:
      // Kejuaraan, kepemimpinan, CIBI, dan seleksi unggulan lain bergantung pada
      // sertifikat atau asesmen yang tidak ditanyakan di formulir.
      return false;
  }
}

function nilaiJalur(
  s: StatistikMesin,
  sekolah: SekolahMesin,
  p: PermintaanPeluang,
  data: DataMesin,
  jarak: number | null,
): HasilJalur {
  const pembanding = {
    tahun: data.tahun,
    pendaftar: s.pendaftar,
    diterima: s.diterima,
    min: s.min,
    median: s.median,
    maks: s.maks,
  };
  const dasar = {
    subJalurKode: s.subJalurKode,
    namaJalur: s.subJalurNama,
    programKeahlian: s.program?.nama ?? null,
    satuan: s.metrik === "JARAK_METER" ? ("meter" as const) : ("skor" as const),
    pembanding,
  };
  const tidakDihitung = (kalimat: string): HasilJalur => ({ ...dasar, label: "TIDAK_DIHITUNG", nilaiAnak: null, kalimat });
  const tempat = s.program ? `${sekolah.nama} (${s.program.nama})` : sekolah.nama;

  if (s.diterima < data.aturan.minDiterima) {
    return tidakDihitung(`Tahun ${data.tahun} hanya ${s.diterima} siswa diterima lewat jalur ini, terlalu sedikit untuk diperkirakan.`);
  }

  if (s.metrik === "JARAK_METER") {
    if (jarak === null) return tidakDihitung(`Lokasi ${sekolah.nama} belum tercatat, jadi jaraknya belum bisa dihitung.`);
    const label = labelJarak(jarak, s);
    return {
      ...dasar,
      label,
      nilaiAnak: bulat50(jarak),
      kalimat:
        `Tahun ${data.tahun}, siswa terjauh yang diterima lewat jalur ${s.subJalurNama.toLowerCase()} di ${tempat} ` +
        `tinggal ${formatJarak(s.maks ?? 0)} dari sekolah, dan separuh yang diterima tinggal dalam ${formatJarak(s.median ?? 0)}. ` +
        `Rumah Bapak/Ibu sekitar ${formatJarak(bulat50(jarak))}.`,
    };
  }

  const rumus = data.aturan.rumusSkor[`${sekolah.jenjang}:${s.subJalurKode}`];
  const skor = rumus ? hitungSkor(rumus, p.nilai, s.program?.kelompokBobot) : null;
  if (!rumus || skor === null) {
    const ambang = s.min !== null ? ` Skor terendah yang diterima tahun ${data.tahun}: ${angka(s.min)}.` : "";
    const alasan = rumus ? "Isi nilai rapor" + (sekolah.jenjang === "SMA" ? " dan TKA" : "") + " untuk menghitung peluang jalur ini." : "Skor jalur ini ditentukan dari sertifikat atau seleksi terpisah, jadi tidak diperkirakan.";
    return tidakDihitung(alasan + ambang);
  }
  return {
    ...dasar,
    label: labelSkor(skor, s),
    nilaiAnak: Math.round(skor * 100) / 100,
    kalimat:
      `Tahun ${data.tahun}, skor terendah yang diterima lewat jalur ${s.subJalurNama.toLowerCase()} di ${tempat} ` +
      `adalah ${angka(s.min ?? 0)}, dan separuh yang diterima punya skor ${angka(s.median ?? 0)} atau lebih. ` +
      `Perkiraan skor anak Bapak/Ibu ${angka(skor)}.`,
  };
}

const cocokJenjang = (j: Jenjang, minat: PermintaanPeluang["jenjang"]) => minat === "SEMUA" || minat === j;

export function hitungPeluang(p: PermintaanPeluang, data: DataMesin): HasilMesin {
  const jarakKe = (s: SekolahMesin) =>
    s.lat !== null && s.lng !== null ? jarakMeter(p.lokasi, { lat: s.lat, lng: s.lng }) : null;

  const hasil: HasilSekolah[] = [];
  for (const sekolah of data.sekolah) {
    if (sekolah.status !== "NEGERI" || !cocokJenjang(sekolah.jenjang, p.jenjang)) continue;
    const jarak = jarakKe(sekolah);
    const jalur = data.statistik
      .filter((s) => s.sekolahId === sekolah.id && berlaku(s, sekolah, p, data))
      .map((s) => nilaiJalur(s, sekolah, p, data, jarak));
    // Jalur skor yang tidak bisa dihitung karena nilai belum diisi hanya ditampilkan
    // bila sekolah itu tidak punya jalur lain yang terhitung.
    const terhitung = jalur.filter((j) => j.label !== "TIDAK_DIHITUNG");
    if (jalur.length === 0) continue;
    const tampil = terhitung.length > 0 ? terhitung : jalur;
    tampil.sort((a, b) => URUTAN_LABEL[a.label] - URUTAN_LABEL[b.label]);
    hasil.push({
      sekolah: tanpaBiaya(sekolah),
      jarakMeter: jarak === null ? null : bulat50(jarak),
      labelTerbaik: tampil[0].label,
      jalur: tampil,
    });
  }
  hasil.sort(
    (a, b) =>
      URUTAN_LABEL[a.labelTerbaik] - URUTAN_LABEL[b.labelTerbaik] ||
      (a.jarakMeter ?? Infinity) - (b.jarakMeter ?? Infinity),
  );

  const swastaTerdekat = (j: Jenjang): AlternatifSwasta[] =>
    cocokJenjang(j, p.jenjang)
      ? data.sekolah
          .filter((s) => s.status === "SWASTA" && s.jenjang === j)
          .map((s) => ({ s, jarak: jarakKe(s) }))
          .filter((x): x is { s: SekolahMesin; jarak: number } => x.jarak !== null)
          .sort((a, b) => a.jarak - b.jarak)
          .slice(0, JUMLAH_SWASTA)
          .map(({ s, jarak }) => ({ sekolah: tanpaBiaya(s), jarakMeter: bulat50(jarak), biaya: s.biaya }))
      : [];

  return {
    tahunAcuan: data.tahun,
    hasil,
    swasta: { SMA: swastaTerdekat("SMA"), SMK: swastaTerdekat("SMK") },
    catatan: `Perkiraan berdasarkan hasil SPMB ${data.tahun}. Bukan jaminan dan bukan aplikasi resmi.`,
  };
}

function tanpaBiaya({ id, npsn, nama, jenjang, status, kategori, alamat, kecamatan, lat, lng, akreditasi, rayonKode }: SekolahMesin): SekolahRingkas {
  return { id, npsn, nama, jenjang, status, kategori, alamat, kecamatan, lat, lng, akreditasi, rayonKode };
}
