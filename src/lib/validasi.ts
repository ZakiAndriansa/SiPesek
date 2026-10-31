import { z } from "zod";

const nilai100 = z.number().min(0).max(100);

const bobotMapel = z.object({ bin: z.number(), mtk: z.number(), ipa: z.number(), ips: z.number(), bing: z.number() });

const rumusSkor = z.discriminatedUnion("jenis", [
  z.object({ jenis: z.literal("RAPOR_TKA"), bobotRapor: z.number(), bobotTka: z.number(), skorMaks: z.number() }),
  z.object({ jenis: z.literal("RAPOR"), skorMaks: z.number() }),
  z.object({
    jenis: z.literal("RAPOR_BOBOT_MAPEL"),
    skorMaks: z.number(),
    bobot: z.record(z.string(), bobotMapel),
  }),
]);

/** Bentuk kolom TahunSpmb.aturan. Kunci rumusSkor: "<JENJANG>:<KODE_SUB_JALUR>". */
export const skemaAturan = z.object({
  rumusSkor: z.record(z.string(), rumusSkor),
  sumber: z.string(),
  batasLabel: z.object({ jarak: z.literal("median|maks"), skor: z.literal("median|min") }),
  minDiterima: z.number().int().min(1),
});

export type Aturan = z.infer<typeof skemaAturan>;
export type RumusSkor = z.infer<typeof rumusSkor>;

export const skemaPermintaanPeluang = z.object({
  anakId: z.number().int().positive().optional(),
  nisn: z.string().trim().max(20).optional(),
  jenjang: z.enum(["SMA", "SMK", "SEMUA"]),
  lokasi: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  kecamatan: z.string().min(1).max(60),
  kondisi: z.object({
    ketm: z.boolean(),
    disabilitas: z.boolean(),
    anakGuruSekolahId: z.number().int().nullable(),
    pindahTugas: z.boolean(),
  }),
  nilai: z
    .object({
      rataRapor: nilai100.optional(),
      tkaBin: nilai100.optional(),
      tkaMtk: nilai100.optional(),
      mapel: z.object({ bin: nilai100, mtk: nilai100, ipa: nilai100, ips: nilai100, bing: nilai100 }).optional(),
    })
    .optional(),
});

// Simpan hasil Cek Cepat: permintaan peluang mode tamu ditambah data anak (lihat PermintaanSimpanCek).
export const skemaSimpanCek = skemaPermintaanPeluang.omit({ anakId: true }).extend({
  nisn: z.string().trim().min(1).max(20),
  nama: z.string().trim().min(1).max(80),
  setuju: z.literal(true),
});

export const skemaMasukGoogle = z.object({ credential: z.string().min(20).max(8000) });

// Format NISN diperiksa terpisah oleh periksaNisn() agar pesannya jelas untuk orang tua.
export const skemaTambahAnak = z.object({
  nama: z.string().trim().min(1).max(80),
  nisn: z.string().trim().min(1).max(20),
  setuju: z.literal(true),
});

const angkaAtauNull = z.number().nullable();

export const skemaPermintaanImpor = z.object({
  tahun: z.number().int().min(2020).max(2100),
  namaFile: z.string().min(1).max(200),
  jumlahBaris: z.number().int().min(0),
  gantiStatistikKecamatan: z.boolean(),
  statistik: z
    .array(
      z.object({
        kodeSekolah: z.string().min(1),
        namaSekolah: z.string(),
        subJalur: z.string().min(1),
        program: z.string().nullable(),
        bidang: z.string().nullable(),
        pendaftar: z.number().int().nullable(),
        pendaftarPilihan1: z.number().int().nullable(),
        diterima: z.number().int().min(0),
        nilaiMin: angkaAtauNull,
        nilaiMedian: angkaAtauNull,
        nilaiMaks: angkaAtauNull,
      }),
    )
    .max(5000),
  kecamatan: z
    .array(
      z.object({
        kecamatan: z.string().min(1),
        cakupan: z.enum(["SMA", "SMK", "SEMUA"]),
        pendaftarUnik: z.number().int().min(0),
        diterimaUnik: z.number().int().min(0),
      }),
    )
    .max(2000),
});
