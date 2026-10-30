/**
 * Pembatas jumlah permintaan per kunci (mis. IP) dalam jendela waktu bergeser, disimpan di memori.
 * Cukup untuk satu proses Node di homeserver; hitungan kembali nol bila server dimulai ulang.
 */
export class PembatasJendela {
  private catatan = new Map<string, number[]>();

  constructor(
    private readonly batas: number,
    private readonly jendelaMs: number,
    private readonly sekarang: () => number = Date.now,
  ) {}

  /** Mencatat satu permintaan. Mengembalikan null bila diizinkan, atau lama tunggu (detik) bila melewati batas. */
  coba(kunci: string): number | null {
    const t = this.sekarang();
    const awal = t - this.jendelaMs;
    const daftar = (this.catatan.get(kunci) ?? []).filter((x) => x > awal);
    if (daftar.length >= this.batas) {
      this.catatan.set(kunci, daftar);
      return Math.max(1, Math.ceil((daftar[0] + this.jendelaMs - t) / 1000));
    }
    daftar.push(t);
    this.catatan.set(kunci, daftar);
    if (this.catatan.size > 10_000) this.bersihkan(awal);
    return null;
  }

  private bersihkan(awal: number) {
    for (const [kunci, daftar] of this.catatan) if (daftar[daftar.length - 1] <= awal) this.catatan.delete(kunci);
  }
}

/**
 * IP pengunjung dari header yang dipasang proxy. Urutannya: header khusus Vercel (tidak bisa dipalsukan
 * lewat Vercel), x-real-ip, lalu entri pertama x-forwarded-for. Null bila tidak ada sama sekali.
 */
export function ipKlien(headers: Headers): string | null {
  for (const nama of ["x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"]) {
    const ip = headers.get(nama)?.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return null;
}
