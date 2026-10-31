// Data navigasi. Tahap orang tua ada di lib/accounts.ts (STAGES) karena juga dipakai proxy.
export type NavItem = readonly [href: string, label: string];
export type DashItem = readonly [href: string, label: string, icon: string];

/** Menu halaman publik (tamu dan pengguna yang sudah login). */
export const PUBLIC_NAV: NavItem[] = [
  ["/", "Beranda"],
  ["/panduan", "Panduan Jalur"],
  ["/tanya-jawab", "Tanya Jawab"],
];

export const HELP_URL = "https://wa.me/";

export const POLICY = {
  role: "Pembuat Kebijakan",
  home: "/kebijakan-ringkasan",
  items: [
    ["/kebijakan-ringkasan", "Ringkasan", "bar-chart"],
    ["/kebijakan-rasio", "Peluang per Kecamatan", "map"],
    ["/kebijakan-blank-spot", "Rayon dan Sekolah", "map-pin"],
    ["/kebijakan-pendaftar", "Tekanan Pendaftar", "school"],
    ["/kebijakan-ekspor", "Ekspor Data", "download"],
  ] as DashItem[],
};

export const ADMIN = {
  role: "Admin",
  home: "/admin-sekolah",
  items: [
    ["/admin-sekolah", "Data Sekolah", "school"],
    ["/admin-impor", "Impor Data Seleksi", "upload"],
    ["/admin-aturan", "Aturan SPMB", "clipboard"],
    ["/admin-rencana", "Rencana Pengembangan", "settings"],
    ["/kebijakan-ringkasan", "Dashboard Kebijakan", "bar-chart"],
  ] as DashItem[],
};
