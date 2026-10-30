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
    ["/kebijakan-rasio", "Rasio Kursi", "map"],
    ["/kebijakan-blank-spot", "Peta Blank Spot", "map-pin"],
    ["/kebijakan-pendaftar", "Pendaftar Sekolah", "school"],
    ["/kebijakan-ekspor", "Ekspor Laporan", "download"],
  ] as DashItem[],
};

export const ADMIN = {
  role: "Admin",
  home: "/admin-aturan",
  items: [
    ["/admin-aturan", "Aturan SPMB", "clipboard"],
    ["/admin-sekolah", "Data Sekolah", "school"],
    ["/admin-impor", "Impor Data Seleksi", "upload"],
    ["/admin-model", "Model Peluang", "settings"],
    ["/admin-pengguna", "Pengguna", "users"],
    ["/kebijakan-ringkasan", "Dashboard Kebijakan", "bar-chart"],
  ] as DashItem[],
};
