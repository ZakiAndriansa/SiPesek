import { Button, Container, PageHeader } from "@/components";
import { SiteChrome } from "@/components/shell/Shell";

export default function NotFound() {
  return (
    <SiteChrome>
      <Container>
        <PageHeader
        art="lost"
          title="Halaman tidak ditemukan"
          desc="Alamat yang Bapak/Ibu buka tidak ada atau sudah dipindahkan."
        />
        <Button variant="primary" href="/" icon="arrow-right">
          Kembali ke Beranda
        </Button>
      </Container>
    </SiteChrome>
  );
}
