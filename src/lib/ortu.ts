import "server-only";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { sesiOrtu } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  AnakRingkas,
  IsiHasilTersimpan,
  PermintaanPeluang,
  ResponsGalat,
  ResponsPeluang,
  ResponsSalinan,
  RiwayatCek,
} from "@/lib/kontrak";
import { hitungPeluang } from "@/lib/peluang/mesin";
import { muatDataMesin, muatIdSubJalur } from "@/lib/peluang/muat";
import { tentukanAnakAktif } from "@/lib/anak-aktif";

export const BATAS_ANAK = 5;
/**
 * Orang tua yang masuk tidak dibatasi jumlah cek per hari. Rem ini hanya menahan skrip: manusia yang mengisi
 * atau mengubah isian tidak akan melewati 5 cek per menit.
 */
export const BATAS_CEK_PER_MENIT = 5;
/** Riwayat menyimpan cek terbaru per anak; yang lebih lama dihapus, agar satu akun tidak memenuhi database. */
export const SIMPAN_CEK_PER_ANAK = 20;
const SEMENIT_MS = 60 * 1000;

export const pesanNisnTerpakai = (milikSendiri: boolean) =>
  milikSendiri
    ? "NISN ini sudah ada di daftar anak Anda."
    : "NISN ini sudah didaftarkan akun lain. Hubungi admin SiPesek bila ini anak Anda.";

/**
 * Respons 429 (dengan Retry-After) bila akun sudah membuat BATAS_CEK_PER_MENIT cek dalam satu menit terakhir,
 * atau null bila masih boleh.
 */
export async function tolakBilaTerlaluCepat(orangTuaId: number): Promise<Response | null> {
  const terbaru = await prisma.cekPeluang.findMany({
    where: { anak: { orangTuaId }, dibuatPada: { gte: new Date(Date.now() - SEMENIT_MS) } },
    orderBy: { dibuatPada: "asc" },
    select: { dibuatPada: true },
    take: BATAS_CEK_PER_MENIT,
  });
  if (terbaru.length < BATAS_CEK_PER_MENIT) return null;
  const tunggu = Math.max(1, Math.ceil((terbaru[0].dibuatPada.getTime() + SEMENIT_MS - Date.now()) / 1000));
  const respons = Response.json(
    {
      galat:
        `Cek terlalu cepat: paling banyak ${BATAS_CEK_PER_MENIT} kali per menit, untuk melindungi SiPesek dari ` +
        `penyalahgunaan otomatis. Tunggu ${tunggu} detik, lalu coba lagi.`,
    } satisfies ResponsGalat,
    { status: 429 },
  );
  respons.headers.set("Retry-After", String(tunggu));
  return respons;
}

/**
 * Hitung peluang atas nama satu anak lalu simpan ringkasannya ke riwayat, lalu hapus cek anak itu yang lebih
 * lama dari SIMPAN_CEK_PER_ANAK cek terbaru. Pemilik anak dan batas per menit sudah diperiksa pemanggil. Yang disimpan hanya ringkasan: tanpa koordinat rumah dan tanpa nilai rapor atau
 * TKA mentah. Skor akhir disimpan tanpa rinciannya, karena rincian membuka rata-rata rapor dan nilai TKA.
 */
/** Hapus cek anak di luar SIMPAN_CEK_PER_ANAK terbaru (HasilCek ikut terhapus lewat cascade). */
export async function hapusCekLama(anakId: number) {
  const lama = await prisma.cekPeluang.findMany({
    where: { anakId },
    orderBy: [{ dibuatPada: "desc" }, { id: "desc" }],
    skip: SIMPAN_CEK_PER_ANAK,
    select: { id: true },
  });
  if (lama.length > 0) await prisma.cekPeluang.deleteMany({ where: { id: { in: lama.map((c) => c.id) } } });
}

export async function hitungDanSimpan(
  p: PermintaanPeluang,
  anak: { id: number; nama: string; nisnLazim: boolean },
): Promise<ResponsPeluang> {
  const hasil = hitungPeluang(p, await muatDataMesin());

  const idSubJalur = await muatIdSubJalur();
  const skorPertama = hasil.hasil.flatMap((h) => h.jalur).find((j) => j.satuan === "skor" && j.nilaiAnak !== null);
  const bawah = skorPertama?.nilaiAnak != null ? Math.floor(skorPertama.nilaiAnak / 10) * 10 : null;
  const token = nanoid(12);

  const cek = await prisma.cekPeluang.create({
    data: {
      token,
      anakId: anak.id,
      tahunAcuan: hasil.tahunAcuan,
      kecamatan: p.kecamatan,
      jenjang: p.jenjang,
      jalurDicek: [...new Set(hasil.hasil.flatMap((h) => h.jalur.map((j) => j.subJalurKode)))],
      rentangSkor: bawah === null ? null : `${bawah}-${bawah + 9}`,
      hasil: {
        hasil: hasil.hasil,
        swasta: hasil.swasta,
        catatan: hasil.catatan,
        skorAnak: hasil.skorAnak.map((s) => ({ ...s, rincian: [] })),
      },
      detail: {
        create: hasil.hasil.flatMap((h) =>
          h.jalur.map((j) => ({ sekolahId: h.sekolah.id, subJalurId: idSubJalur.get(j.subJalurKode)!, label: j.label })),
        ),
      },
    },
  });
  await hapusCekLama(anak.id);

  return {
    token,
    anak: { id: anak.id, nama: anak.nama },
    nisnLazim: anak.nisnLazim,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...hasil,
  };
}

/**
 * Orang tua yang sedang masuk, atau null bila belum masuk atau akunnya sudah dihapus
 * (cookie lama yang masih berlaku tidak boleh dipakai untuk akun yang tidak ada).
 */
export async function orangTuaMasuk(request: NextRequest) {
  const sesi = await sesiOrtu(request);
  if (!sesi) return null;
  const ortu = await prisma.orangTua.findUnique({ where: { id: sesi.orangTuaId }, select: { id: true, nama: true, email: true } });
  return ortu && { ...ortu, foto: sesi.foto };
}

export const pilihAnak = {
  id: true,
  nama: true,
  nisnAkhir: true,
  nisnLazim: true,
  _count: { select: { cek: true } },
} as const;

type AnakTerpilih = { id: number; nama: string; nisnAkhir: string; nisnLazim: boolean; _count: { cek: number } };

export const keAnakRingkas = ({ _count, ...a }: AnakTerpilih): AnakRingkas => ({ ...a, jumlahCek: _count.cek });

type BarisRiwayat = {
  anakId: number;
  token: string;
  dibuatPada: Date;
  tahunAcuan: number;
  jenjang: string;
  kecamatan: string | null;
  jumlahSekolah: number;
  peluangBesar: number;
  masihMungkin: number;
  peluangKecil: number;
};

/**
 * Riwayat cek beberapa anak sekaligus, terbaru dulu. Ringkasan label dihitung di Postgres dari kolom JSON
 * `hasil`, sehingga kartu hasil (sekitar 48 KB per cek) tidak ikut ditarik ke aplikasi.
 */
export async function riwayatAnak(anakIds: number[]): Promise<Map<number, RiwayatCek[]>> {
  const peta = new Map<number, RiwayatCek[]>(anakIds.map((id) => [id, []]));
  if (anakIds.length === 0) return peta;
  const baris = await prisma.$queryRaw<BarisRiwayat[]>`
    SELECT c."anakId", c.token, c."dibuatPada", c."tahunAcuan", c.jenjang, c.kecamatan,
      r."jumlahSekolah", r."peluangBesar", r."masihMungkin", r."peluangKecil"
    FROM "CekPeluang" c
    CROSS JOIN LATERAL (
      SELECT count(*)::int AS "jumlahSekolah",
        (count(*) FILTER (WHERE e->>'labelTerbaik' = 'PELUANG_BESAR'))::int AS "peluangBesar",
        (count(*) FILTER (WHERE e->>'labelTerbaik' = 'MASIH_MUNGKIN'))::int AS "masihMungkin",
        (count(*) FILTER (WHERE e->>'labelTerbaik' = 'PELUANG_KECIL'))::int AS "peluangKecil"
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.hasil->'hasil') = 'array' THEN c.hasil->'hasil' ELSE '[]'::jsonb END
      ) AS e
    ) AS r
    WHERE c."anakId" IN (${Prisma.join(anakIds)})
    ORDER BY c."dibuatPada" DESC`;
  for (const b of baris) {
    peta.get(b.anakId)?.push({
      token: b.token,
      dibuatPada: b.dibuatPada.toISOString(),
      tahunAcuan: b.tahunAcuan,
      jenjang: b.jenjang as RiwayatCek["jenjang"],
      kecamatan: b.kecamatan,
      ringkas: {
        jumlahSekolah: b.jumlahSekolah,
        peluangBesar: b.peluangBesar,
        masihMungkin: b.masihMungkin,
        peluangKecil: b.peluangKecil,
      },
    });
  }
  return peta;
}

/**
 * Semua data akun untuk "Unduh Salinan Data" dengan jumlah query tetap (anak, riwayat, dan isi hasil), berapa
 * pun banyaknya anak dan cek. Sebelumnya browser memanggil satu API per anak dan satu per cek.
 */
export async function salinanAkun(ortu: { id: number; nama: string; email: string }): Promise<ResponsSalinan> {
  const anak = (
    await prisma.anak.findMany({ where: { orangTuaId: ortu.id }, select: pilihAnak, orderBy: { id: "asc" } })
  ).map(keAnakRingkas);
  const ids = anak.map((a) => a.id);
  const [riwayat, isi] = await Promise.all([
    riwayatAnak(ids),
    ids.length === 0
      ? Promise.resolve([])
      : prisma.cekPeluang.findMany({ where: { anakId: { in: ids } }, select: { token: true, hasil: true } }),
  ]);
  const hasilPerToken = new Map(isi.map((c) => [c.token, c.hasil as IsiHasilTersimpan]));
  return {
    akun: { nama: ortu.nama, email: ortu.email },
    anak: anak.map((a) => ({
      id: a.id,
      nama: a.nama,
      nisnAkhir: a.nisnAkhir,
      nisnLazim: a.nisnLazim,
      riwayat: (riwayat.get(a.id) ?? []).map((r) => ({ ...r, hasil: hasilPerToken.get(r.token) ?? null })),
    })),
  };
}

type CekTersimpan = { token: string; tahunAcuan: number; dibuatPada: Date; hasil: unknown };

/** Bentuk GET /api/hasil/[token] dari baris CekPeluang dan anaknya (dipakai juga oleh GET /api/ortu/anak). */
export function keResponsHasil(cek: CekTersimpan, anak: { id: number; nama: string; nisnLazim: boolean }): ResponsPeluang {
  return {
    token: cek.token,
    anak: { id: anak.id, nama: anak.nama },
    nisnLazim: anak.nisnLazim,
    tahunAcuan: cek.tahunAcuan,
    dibuatPada: cek.dibuatPada.toISOString(),
    ...(cek.hasil as IsiHasilTersimpan),
  };
}

/**
 * Hasil terakhir anak aktif (aturan sama dengan store di browser), agar halaman tahap cukup satu panggilan.
 * Null bila akun belum punya anak atau anak aktif belum punya hasil.
 */
export async function hasilTerakhirAnakAktif(
  anak: Array<AnakRingkas & { riwayat: RiwayatCek[] }>,
  pilihan: number | null,
): Promise<ResponsPeluang | null> {
  const id = tentukanAnakAktif(anak, pilihan);
  const aktif = anak.find((a) => a.id === id);
  const token = aktif?.riwayat[0]?.token;
  if (!aktif || !token) return null;
  // Token berasal dari riwayat anak milik akun ini, jadi kepemilikannya sudah terjamin.
  const cek = await prisma.cekPeluang.findUnique({
    where: { token },
    select: { token: true, tahunAcuan: true, dibuatPada: true, hasil: true },
  });
  return cek ? keResponsHasil(cek, aktif) : null;
}
