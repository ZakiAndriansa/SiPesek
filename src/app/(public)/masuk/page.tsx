import type { Metadata } from "next";
import { Suspense } from "react";
import { Alert, Badge, Container, MoreLink, PageHeader } from "@/components";
import { MasukGoogle } from "@/components/masuk-google/MasukGoogle";

export const metadata: Metadata = {
  title: "Masuk dengan Google",
  description: "Masuk dengan akun Google untuk menyimpan hasil cek peluang SPMB anak, tanpa membuat kata sandi baru.",
};

export default function MasukPage({ searchParams }: PageProps<"/masuk">) {
  return (
    <Container reading>
      <div className="masuk-google__badge">
        <Badge kind="brand">Akses Cepat & Aman</Badge>
      </div>

      <PageHeader
        art="login"
        title="Masuk untuk menyimpan hasil"
        desc="Pakai akun Google Bapak/Ibu. Tidak perlu membuat atau mengingat kata sandi baru."
      />

      {/* Pesan ini bergantung pada URL, jadi dialirkan setelah navigasi; sisanya ikut App Shell. */}
      <Suspense>
        <PesanLanjut searchParams={searchParams} />
      </Suspense>

      <div className="card masuk-google">
        <MasukGoogle />
        <p className="text-caption text-secondary">
          Dengan masuk, Bapak/Ibu setuju data dipakai untuk menghitung peluang SPMB. Data tidak dijual.
        </p>
        <MoreLink href="/privasi">Baca kebijakan privasi</MoreLink>
      </div>

      <p className="masuk-google__manfaat text-caption text-secondary">
        Gratis · Riwayat cek tersimpan · Bisa untuk lebih dari satu anak
      </p>

      <div className="card">
        <h2 className="card__title">Belum ingin membuat akun?</h2>
        <p className="card__text">Cek Cepat hanya butuh NISN anak. Hasilnya tidak disimpan.</p>
        <MoreLink href="/cek-cepat">Cek Cepat dengan NISN</MoreLink>
      </div>
      <p className="text-caption text-secondary">
        Petugas dinas pendidikan? <MoreLink href="/masuk-petugas">Masuk sebagai petugas</MoreLink>
      </p>
    </Container>
  );
}

async function PesanLanjut({ searchParams }: Pick<PageProps<"/masuk">, "searchParams">) {
  const { next } = await searchParams;
  if (next === "/cek-cepat/simpan") {
    return (
      <Alert kind="info" title="Masuk untuk menyimpan hasil Cek Cepat">
        Setelah masuk, Bapak/Ibu bisa memindahkan isian tadi ke akun. Jangan tutup atau muat ulang tab ini, karena hasil Cek Cepat belum tersimpan di mana pun.
      </Alert>
    );
  }
  if (!next) return null;
  return (
    <Alert kind="info" title="Masuk dulu untuk melanjutkan">
      Halaman yang Bapak/Ibu buka berisi data pribadi anak. Setelah masuk, kami langsung membukanya.
    </Alert>
  );
}
