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
