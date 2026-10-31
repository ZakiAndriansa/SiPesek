import { Suspense, type ReactNode } from "react";
import {
  continueTarget,
  homeFor,
  isComplete,
  nextWizardHref,
  ROLE_LABEL,
  STAGES,
  stageStatus,
  WIZARD_TOTAL,
  WIZARD_TOTAL_ORTU,
  type Session,
} from "@/lib/accounts";
import { MenuAnakOrtu } from "@/features/ortu/MenuAnakOrtu";
import { POLICY } from "@/lib/nav";
import { getSession } from "@/lib/session";
import { BottomNav } from "../bottom-nav/BottomNav";
import { Footer } from "../footer/Footer";
import { DashBar, FocusBar, Navbar, type NavbarProps } from "../navbar/Navbar";
import { Sidebar, type DashMenu } from "../sidebar/Sidebar";

const SkipLink = () => (
  <a className="skip-link" href="#konten">
    Lewati ke konten
  </a>
);

const firstName = (name: string) => name.split(" ")[0];

/** Teks tombol "Lanjutkan" untuk orang tua di halaman publik. */
export function continueFor(session: Session) {
  if (session.account === "google") return { label: "Lihat data anak", href: "/anak-saya" };
  if (!session.child) return { label: "Mulai isi data anak", href: nextWizardHref(null) };
  return { label: `Lanjutkan: ${firstName(session.child.name)}`, href: continueTarget(session.child).href };
}

function stagesFor(session: Session) {
  // Akun Google: data asli diambil di klien, jadi tahap tidak dikunci; tiap halaman menjelaskan sendiri
  // bila anak belum punya hasil tersimpan.
  if (session.account === "google") return STAGES.map((s) => ({ ...s, state: "terbuka" as const }));
  const status = stageStatus(session.child);
  return STAGES.map((s) => ({ ...s, state: status[s.key] }));
}

function publicNav(session: Session | null): NavbarProps {
  if (!session) return { variant: "guest" };
  if (session.role === "orang-tua") {
    return { variant: "parent-public", user: session.name, photo: session.photo, cont: continueFor(session) };
  }
  return { variant: "staff-public", user: session.name, role: ROLE_LABEL[session.role], home: homeFor(session) };
}

/** Cangkang halaman publik dan area orang tua. Isi navbar dipilih dari sesi, bukan ditulis per halaman. */
export async function SiteChrome({
  area,
  children,
}: {
  area: "public" | "parent";
  children: ReactNode;
}) {
  const session = await getSession();
  const parent = area === "parent" && session?.role === "orang-tua" ? session : null;
  const nav: NavbarProps = parent
    ? {
        variant: "parent",
        user: parent.name,
        photo: parent.photo,
        kids: parent.children.map((c) => ({
          id: c.id,
          name: c.name,
          status: isComplete(c) ? "Data lengkap" : `Isi data: langkah ${Math.min(c.steps + 1, WIZARD_TOTAL)} dari ${WIZARD_TOTAL}`,
        })),
        activeId: parent.child?.id ?? null,
        stages: stagesFor(parent),
        lockedHref: nextWizardHref(parent.child),
        childMenu: parent.account === "google" ? <MenuAnakOrtu /> : undefined,
      }
    : publicNav(session);

  const chrome = (
    <>
      <SkipLink />
      <Navbar {...nav} />
      <main id="konten">{children}</main>
      <Footer parent={session?.role === "orang-tua"} />
      {parent && <BottomNav stages={stagesFor(parent)} lockedHref={nextWizardHref(parent.child)} />}
    </>
  );
  return parent ? <div className="has-bottom-nav">{chrome}</div> : chrome;
}

/** Cangkang beranda: navbar, isi, dan footer di lembar krem dengan latar gradien oranye. */
export async function LandingChrome({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <div className="landing-page">
      <div className="landing-sheet">
        <SkipLink />
        <Navbar {...publicNav(session)} />
        <main id="konten">{children}</main>
        <Footer parent={session?.role === "orang-tua"} />
      </div>
    </div>
  );
}

/** Cangkang wizard (mode fokus): tanpa menu utama, footer, dan navigasi bawah. */
const KELUAR_WIZARD = { href: "/anak-saya", label: "Simpan & keluar" };

/** `step` berasal dari URL, jadi header progres dialirkan di balik Suspense; sisanya ikut App Shell. */
export function FocusChrome({ step, children }: { step: Promise<number>; children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Suspense fallback={<FocusBar title="Data anak" subtitle={`Dari ${WIZARD_TOTAL} langkah`} exit={KELUAR_WIZARD} />}>
        <WizardBar step={step} />
      </Suspense>
      <main id="konten">{children}</main>
    </>
  );
}

async function WizardBar({ step: langkah }: { step: Promise<number> }) {
  const [step, session] = await Promise.all([langkah, getSession()]);
  // Akun Google: nama anak ada di API (dibaca di klien), dan langkahnya 4.
  const google = session?.account === "google";
  const total = google ? WIZARD_TOTAL_ORTU : WIZARD_TOTAL;
  const name = !google && session?.child ? firstName(session.child.name) : null;
  return (
    <FocusBar
      title={google ? "Isi data anak" : name ? `Data ${name}` : "Data anak baru"}
      subtitle={`Langkah ${Math.min(step, total)} dari ${total}`}
      progress={{ step: Math.min(step, total), total }}
      exit={KELUAR_WIZARD}
    />
  );
}

/** Cangkang Cek Cepat (tamu): header fokus, tanpa menu akun, footer, atau navigasi bawah. */
export function QuickChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <FocusBar
        title="Cek Cepat"
        subtitle="Tidak disimpan otomatis"
        brandHref="/"
        exit={{ href: "/", label: "Selesai" }}
      />
      <main id="konten">{children}</main>
    </>
  );
}

/** Cangkang dashboard: bar atas (peran + nama), sidebar, konten. Tanpa footer. */
export async function DashChrome({
  menu,
  children,
}: {
  menu: DashMenu;
  children: ReactNode;
}) {
  const session = await getSession();
  const role = session ? ROLE_LABEL[session.role] : menu.role;
  // Admin yang membuka dashboard kebijakan tetap punya jalan kembali ke panel admin.
  const items =
    session?.role === "admin" && menu === POLICY
      ? [...menu.items, ["/admin-aturan", "Kembali ke Panel Admin", "settings"] as const]
      : menu.items;
  return (
    <>
      <SkipLink />
      <DashBar home={session ? homeFor(session) : menu.home} user={session?.name ?? "Petugas"} role={role} />
      <main id="konten">
        <div className="container dash">
          <Sidebar menu={{ ...menu, role: menu === POLICY && session?.role === "admin" ? "Dashboard Kebijakan (Admin)" : menu.role, items }} />
          <div className="dash__main">{children}</div>
        </div>
      </main>
    </>
  );
}
