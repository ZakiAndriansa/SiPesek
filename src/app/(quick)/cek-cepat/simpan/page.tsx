import type { Metadata } from "next";
import { Container, PageHeader } from "@/components";
import { SaveDraft } from "@/features/cek-cepat/SaveDraft";

export const metadata: Metadata = {
  title: "Simpan Hasil ke Akun · SiPesek",
  robots: { index: false, follow: false },
};

export default function SimpanPage() {
  return (
    <Container reading>
      <PageHeader title="Simpan hasil ke akun" desc="Hasil Cek Cepat tadi masuk ke riwayat anak di akun Bapak/Ibu, jadi bisa dibuka lagi kapan saja tanpa mengisi ulang." />
      <SaveDraft />
    </Container>
  );
}
