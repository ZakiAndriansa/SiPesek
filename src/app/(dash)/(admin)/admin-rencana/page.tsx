import type { Metadata } from "next";
import { Badge, DashSection, PageHeader } from "@/components";

export const metadata: Metadata = {
  title: "Rencana Pengembangan",
  description: "Fitur panel admin yang direncanakan setelah SPMB 2026.",
};

// Fitur yang belum punya backend sengaja tidak ditampilkan sebagai tombol aktif, agar tidak terlihat berfungsi.
const RENCANA = [
  {
    judul: "Konfigurasi model peluang",
    sekarang: "Ambang label Peluang besar, Masih mungkin, dan Peluang kecil memakai median dan batas data tahun lalu, diatur di Aturan SPMB.",
    rencana: "Mengatur ambang dari panel setelah dievaluasi dengan hasil SPMB 2027, lengkap dengan catatan versi.",
  },
  {
    judul: "Pengguna dan hak akses",
    sekarang: "Satu akun admin dibuat oleh pengelola server. Dashboard Kebijakan terbuka untuk umum tanpa akun.",
    rencana: "Banyak admin dengan peran berbeda dan log aktivitas setiap perubahan data.",
  },
  {
    judul: "Validasi NISN resmi",
    sekarang: "NISN diperiksa formatnya, kewajaran tahun lahirnya, dan keunikannya antarakun.",
    rencana: "Pencocokan dengan data Pusdatin Kemendikdasmen melalui kerja sama resmi, dan verifikasi akun belajar.id anak.",
  },
];

export default function AdminRencanaPage() {
  return (
    <>
      <PageHeader title="Rencana pengembangan" desc="Fitur panel admin yang direncanakan setelah SPMB 2026, beserta cara kerja saat ini." />
      {RENCANA.map((r) => (
        <DashSection key={r.judul} title={r.judul}>
          <div className="card">
            <p>
              <Badge kind="neutral">Saat ini</Badge> {r.sekarang}
            </p>
            <p>
              <Badge kind="info">Rencana</Badge> {r.rencana}
            </p>
          </div>
        </DashSection>
      ))}
    </>
  );
}
