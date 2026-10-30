// Data navigasi. Tahap orang tua ada di lib/accounts.ts (STAGES) karena juga dipakai proxy.
export type NavItem = readonly [href: string, label: string];

/** Menu halaman publik (tamu dan pengguna yang sudah login). */
export const PUBLIC_NAV: NavItem[] = [
  ["/", "Beranda"],
  ["/panduan", "Panduan Jalur"],
  ["/tanya-jawab", "Tanya Jawab"],
];

export const HELP_URL = "https://wa.me/";
