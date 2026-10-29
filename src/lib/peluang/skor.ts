import type { PermintaanPeluang } from "@/lib/kontrak";
import type { RumusSkor } from "@/lib/validasi";

type Nilai = NonNullable<PermintaanPeluang["nilai"]>;

/**
 * Menghitung skor anak sesuai rumus juknis. Mengembalikan null bila nilai yang
 * dibutuhkan belum diisi.
 *
 * Penyederhanaan yang setara secara matematis:
 * 1. R1 + R2 + R3 + R4 + R5 = 5 × rata-rata rapor 5 semester.
 * 2. Kelas industri: jumlah semester dari (Σ bobot × nilai) / 5 = Σ bobot × rata-rata mapel 5 semester.
 */
export function hitungSkor(rumus: RumusSkor, nilai: Nilai | undefined, kelompokBobot?: string | null): number | null {
  if (!nilai) return null;
  switch (rumus.jenis) {
    case "RAPOR_TKA":
      if (nilai.rataRapor === undefined || nilai.tkaBin === undefined || nilai.tkaMtk === undefined) return null;
      return rumus.bobotRapor * 5 * nilai.rataRapor + rumus.bobotTka * (nilai.tkaBin + nilai.tkaMtk);
    case "RAPOR":
      if (nilai.rataRapor === undefined) return null;
      return 5 * nilai.rataRapor;
    case "RAPOR_BOBOT_MAPEL": {
      const bobot = kelompokBobot ? rumus.bobot[kelompokBobot] : undefined;
      if (!bobot || !nilai.mapel) return null;
      const m = nilai.mapel;
      return bobot.bin * m.bin + bobot.mtk * m.mtk + bobot.ipa * m.ipa + bobot.ips * m.ips + bobot.bing * m.bing;
    }
  }
}
