// Data navigasi halaman untuk orang tua.
export type NavItem = readonly [href: string, label: string];
export const PUBLIC_NAV: NavItem[] = [
  ["/", "Beranda"],
  ["/panduan", "Panduan Jalur"],
  ["/tanya-jawab", "Tanya Jawab"],
];
