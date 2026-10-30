import type { ComponentType } from "react";
import { DataAnak } from "./steps/DataAnak";
import {
  KondisiKeluarga,
  KondisiKeluargaDialogs,
} from "./steps/KondisiKeluarga";
import { NilaiRapor, NilaiRaporDialogs } from "./steps/NilaiRapor";
import { Prestasi } from "./steps/Prestasi";
import { TitikRumah, TitikRumahDialogs } from "./steps/TitikRumah";

/** Nilai awal per id field (misal dari Cek Cepat). */
export type StepProps = { data?: Record<string, string> };

export type Step = {
  title: string;
  desc: string;
  /** Teks tombol utama; bawaan "Lanjut". */
  nextText?: string;
  /** Tampilkan tombol "Lewati Langkah Ini". */
  skippable?: boolean;
  Body: ComponentType<StepProps>;
  Dialogs?: ComponentType;
};

// Urutan di sini menentukan nomor langkah, tombol Lanjut/Kembali, dan jumlah di Stepper.
export const STEPS: Step[] = [
  {
    title: "Data anak",
    desc: "Mulai dari identitas singkat anak.",
    Body: DataAnak,
  },
  {
    title: "Nilai rapor",
    desc: "Isi rata-rata nilai tiap semester. Boleh dikosongkan dulu dan dilengkapi nanti.",
    Body: NilaiRapor,
    Dialogs: NilaiRaporDialogs,
  },
  {
    title: "Kondisi keluarga",
    desc: "Informasi ini menentukan apakah anak bisa memakai Jalur keluarga kurang mampu (Afirmasi).",
    Body: KondisiKeluarga,
    Dialogs: KondisiKeluargaDialogs,
  },
  {
    title: "Prestasi",
    desc: "Isi bila anak punya juara lomba. Langkah ini boleh dilewati.",
    skippable: true,
    Body: Prestasi,
  },
  {
    title: "Titik rumah",
    desc: "Tandai letak rumah agar jarak ke sekolah bisa dihitung.",
    nextText: "Lihat Peluang",
    Body: TitikRumah,
    Dialogs: TitikRumahDialogs,
  },
];

export const TOTAL = STEPS.length;
export const stepHref = (n: number) => `/isi-data/${n}`;
/** Tujuan setelah langkah terakhir dan sebelum langkah pertama. */
export const AFTER_LAST = "/peta-sekolah?selesai=1";
export const BEFORE_FIRST = "/anak-saya";

/** Ubah parameter URL menjadi langkah, atau null bila bukan angka 1..TOTAL. */
export function getStep(param: string): { n: number; step: Step } | null {
  const n = Number(param);
  return Number.isInteger(n) && n >= 1 && n <= TOTAL
    ? { n, step: STEPS[n - 1] }
    : null;
}
