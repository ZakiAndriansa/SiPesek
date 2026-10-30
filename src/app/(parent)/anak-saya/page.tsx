import type { Metadata } from "next";
import {
  Button,
  ButtonGroup,
  Container,
  CtaBand,
  Dialog,
  Icon,
  PageHeader,
  Section,
  SectionHeading,
} from "@/components";
import {
  continueTarget,
  isComplete,
  STAGES,
  stageStatus,
  WIZARD_TOTAL,
  type Child,
} from "@/lib/accounts";
import { HELP_URL } from "@/lib/nav";
import { getSession } from "@/lib/session";
import { addChild, selectChild } from "@/lib/session-actions";

export const metadata: Metadata = {
  title: "Data Anak",
  description: "Pilih anak, lihat sampai tahap mana datanya, lalu lanjutkan ke langkah berikutnya.",
};

/** Kartu satu anak: 4 tahap sebagai progres + satu tombol ke tahap berikutnya. */
function ChildCard({ child, active }: { child: Child; active: boolean }) {
  const status = stageStatus(child);
  const target = continueTarget(child);
  const done = isComplete(child);
  return (
    <article className={`card child-card${active ? " child-card--active" : ""}`}>
      <div className="child-card__top">
        <h2 className="card__title">{child.name}</h2>
        {active && <span className="badge badge--brand">Sedang dilihat</span>}
      </div>
      <p className="card__text">
        {done
          ? "Data lengkap. Hasil, strategi, dan dokumen sudah bisa dibuka."
          : `Isi data: langkah ${Math.min(child.steps + 1, WIZARD_TOTAL)} dari ${WIZARD_TOTAL}. Hasil terbuka setelah data lengkap.`}
      </p>
      <ol className="journey" aria-label={`Tahap ${child.name}`}>
        {STAGES.map((s) => (
          <li key={s.key} className={`journey__step journey__step--${status[s.key]}`}>
            <span className="journey__num" aria-hidden="true">
              {status[s.key] === "selesai" ? (
                <Icon name="check" className="icon icon--sm" />
              ) : status[s.key] === "terkunci" ? (
                <Icon name="lock" className="icon icon--sm" />
              ) : (
                s.n
              )}
            </span>
            <span className="journey__label">
              {s.label}
              <span className="visually-hidden">{`: ${status[s.key]}`}</span>
            </span>
          </li>
        ))}
      </ol>
      <form action={selectChild} className="card__footer">
        <input type="hidden" name="anak" value={child.id} />
        <input type="hidden" name="kembali" value={target.href} />
        <Button variant="primary" block type="submit" icon="arrow-right">
          {target.label}
        </Button>
      </form>
    </article>
  );
}

export default async function AnakSayaPage() {
  const session = await getSession();
  const kids = session?.children ?? [];
  return (
    <>
      <Container>
        <PageHeader
        art="profile"
          title="Data Anak"
          desc="Pilih anak yang ingin dilihat. Data dan hasil tiap anak tersimpan terpisah."
        />
        {kids.length === 0 ? (
          <div className="card empty-state">
            <h2 className="card__title">Belum ada data anak</h2>
            <p className="card__text">Mulai dengan mengisi data singkat anak. Sekitar 8 menit, dan isian tersimpan otomatis.</p>
            <form action={addChild}>
              <Button variant="primary" lg type="submit" icon="arrow-right">
                Mulai isi data anak
              </Button>
            </form>
          </div>
        ) : (
          <div className="card-grid">
            {kids.map((c) => (
              <ChildCard key={c.id} child={c} active={c.id === session?.child?.id} />
            ))}
          </div>
        )}
        {kids.length > 0 && (
          <form action={addChild} className="child-add">
            <Button variant="secondary" block type="submit" iconLeft="plus">
              Tambah anak
            </Button>
          </form>
        )}
        <Section>
          <SectionHeading
            title="Hak & Privasi Akun Keluarga"
            desc="Bapak/Ibu memegang kendali penuh atas data yang telah dimasukkan."
          />
          <div className="card">
            <p className="card__text">
              Semua perhitungan peluang disimpan secara privat. Bapak/Ibu bisa mengunduh salinan data atau menghapus seluruh data kapan saja.
            </p>
            <ButtonGroup>
              <Button
                variant="secondary"
                iconLeft="download"
                toast={{ message: "Salinan data keluarga sedang disiapkan untuk diunduh.", variant: "info" }}
              >
                Unduh Salinan Data
              </Button>
              <Button variant="ghost" iconLeft="trash" opens="dlg-hapus">
                Hapus Seluruh Data
              </Button>
            </ButtonGroup>
          </div>
        </Section>
        <Section>
          <CtaBand
            title="Butuh bantuan saat mengisi data?"
            text="Tim pendamping siap membantu membaca rapor dan menandai titik rumah lewat WhatsApp."
          >
            <Button variant="inverse" href={HELP_URL} iconLeft="message" newTab>
              Chat lewat WhatsApp
            </Button>
          </CtaBand>
        </Section>
      </Container>
      <Dialog
        id="dlg-hapus"
        title="Hapus seluruh data?"
        footer={
          <>
            <Button variant="secondary" closes>
              Batal
            </Button>
            <Button
              variant="primary"
              closes
              toast={{ message: "Seluruh data anak sudah dihapus.", variant: "info" }}
            >
              Ya, hapus permanen
            </Button>
          </>
        }
      >
        <p>
          {kids.length > 0
            ? `Profil ${kids.map((k) => k.name).join(" dan ")} beserta hasil peluang dan strategi yang tersimpan akan terhapus permanen.`
            : "Seluruh data akun akan terhapus permanen."}
        </p>
      </Dialog>
    </>
  );
}
