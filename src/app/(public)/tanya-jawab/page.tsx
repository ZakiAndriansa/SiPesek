import type { Metadata } from "next";
import {
  Button,
  ButtonGroup,
  Accordion,
  Container,
  PageHeader,
  CtaBand,
  Badge,
} from "@/components";
import { FAQ_GROUPS } from "@/data/faq";

export const metadata: Metadata = {
  title: "Tanya Jawab",
  description: "Jawaban atas pertanyaan yang sering diajukan orang tua seputar SPMB dan SIPESEK.",
};

export default function TanyaJawabPage() {
  return (
    <Container>
      
      <PageHeader
        reveal
        art="faq"
        title="Tanya Jawab & Bantuan"
        desc="Temukan jawaban cepat seputar metodologi prediksi, keamanan data keluarga, dan panduan teknis pengisian."
      />

      {/* Topic Chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }} data-reveal="" data-reveal-live="">
        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-ink)", alignSelf: "center", marginRight: "8px" }}>Kategori:</span>
        {FAQ_GROUPS.map((g) => (
          <a
            key={g.title}
            href={`#${g.title.toLowerCase().replace(/\s+/g, "-")}`}
            style={{ textDecoration: "none" }}
          >
            <Badge kind="neutral">{g.title}</Badge>
          </a>
        ))}
      </div>

      <div className="stack stack--lg" data-reveal-group="" data-reveal-live="">
        {FAQ_GROUPS.map((group, i) => {
          const sectionId = group.title.toLowerCase().replace(/\s+/g, "-");
          return (
            <section key={group.title} id={sectionId} className="card" style={{ padding: "32px", background: "var(--color-surface)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: "700", color: "var(--color-ink)", margin: 0 }}>
                  {group.title}
                </h2>
                <Badge kind="brand">{group.items.length} Pertanyaan</Badge>
              </div>
              <Accordion items={group.items} openFirst={i === 0} />
            </section>
          );
        })}

        <CtaBand
          title="Masih Ada Pertanyaan yang Belum Terjawab?"
          text="Tim pendamping orang tua kami siap membantu menjawab kebingungan seputar SPMB dengan ramah dan sabar."
        >
          <ButtonGroup>
          <Button
            variant="primary"
            href="https://wa.me/"
            iconLeft="message"
            newTab
          >
            Chat Tim Bantuan (WhatsApp)
            <span className="visually-hidden"> (membuka tab baru)</span>
          </Button>
          <Button variant="secondary" href="/cek-cepat">
            Coba Cek Cepat
          </Button>
          </ButtonGroup>
        </CtaBand>
      </div>
    </Container>
  );
}
