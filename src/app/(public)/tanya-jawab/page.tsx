import type { Metadata } from "next";
import {
  Button,
  ButtonGroup,
  Accordion,
  Container,
  PageHeader,
  CtaBand,
  Badge,
  MoreLink,
} from "@/components";
import { ctaUntuk } from "@/components/landing/cta";
import { FAQ_GROUPS } from "@/data/faq";
import { EMAIL_KONTAK } from "@/data/kontak";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Tanya Jawab",
  description: "Jawaban singkat seputar cara SiPesek menghitung peluang, keamanan data anak, dan akun.",
};

export default async function TanyaJawabPage() {
  const cta = ctaUntuk(await getSession());
  return (
    <Container>

      <PageHeader
        reveal
        art="faq"
        title="Tanya Jawab"
        desc="Jawaban singkat seputar cara SiPesek menghitung peluang, keamanan data anak, dan akun."
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
              {group.link && (
                <div style={{ marginTop: "16px" }}>
                  <MoreLink href={group.link.href}>{group.link.label}</MoreLink>
                </div>
              )}
            </section>
          );
        })}

        <CtaBand
          title="Masih ada pertanyaan?"
          text={`Kirim email ke ${EMAIL_KONTAK} dan ceritakan pertanyaan Bapak/Ibu.`}
        >
          <ButtonGroup>
            <Button variant="primary" href={`mailto:${EMAIL_KONTAK}`} iconLeft="message">
              Kirim Email
            </Button>
            <Button variant="secondary" href={cta.href}>
              {cta.ctaLabel}
            </Button>
          </ButtonGroup>
        </CtaBand>
      </div>
    </Container>
  );
}
