"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { stageOf } from "@/lib/accounts";
import { HELP_URL, PUBLIC_NAV } from "@/lib/nav";
import { addChild, selectChild, signOut } from "@/lib/session-actions";
import { Brand } from "../brand/Brand";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { Menu } from "./Menu";
import { StageLink, type StageItem } from "./StageLink";

export type NavChild = { id: string; name: string; status: string };

export type NavbarProps =
  | { variant: "guest" }
  | { variant: "parent-public"; user: string; photo: string | null; cont: { label: string; href: string } }
  | { variant: "staff-public"; user: string; role: string; home: string }
  | {
      variant: "parent";
      user: string;
      photo: string | null;
      kids: NavChild[];
      activeId: string | null;
      stages: StageItem[];
      lockedHref: string;
    };

const firstName = (name: string) => name.split(" ")[0];

function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="menu__item">
        <Icon name="log-out" className="icon icon--sm" />
        Keluar
      </button>
    </form>
  );
}

/** Foto profil Google bila ada; kembali ke huruf awal nama bila tidak ada atau gagal dimuat. */
function Avatar({ user, photo }: { user: string; photo?: string | null }) {
  const [gagal, setGagal] = useState(false);
  const foto = useRef<HTMLImageElement>(null);
  // Gambar bisa sudah gagal dimuat sebelum React hydrate, sehingga onError tidak sempat terpanggil.
  useEffect(() => {
    const img = foto.current;
    if (img?.complete && img.naturalWidth === 0) setGagal(true);
  }, [photo]);
  if (photo && !gagal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={foto}
        className="navbar__avatar navbar__avatar--foto"
        src={photo}
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        // Server gambar Google menolak sebagian permintaan yang membawa Referer.
        referrerPolicy="no-referrer"
        onError={() => setGagal(true)}
      />
    );
  }
  return (
    <span className="navbar__avatar" aria-hidden="true">
      {user.replace(/^(Ibu|Pak|Bapak)\s+/, "").charAt(0)}
    </span>
  );
}

function AccountMenu({
  user,
  photo,
  role,
  links,
}: {
  user: string;
  photo?: string | null;
  role: string;
  links: [string, string][];
}) {
  return (
    <Menu id="menu-akun" label={`Menu akun ${user}`} trigger={<Avatar user={user} photo={photo} />}>
      <p className="menu__head">
        <strong>{user}</strong>
        <span>{role}</span>
      </p>
      {links.map(([href, label]) => {
        const external = href.startsWith("http");
        return external ? (
          <a key={href} className="menu__item" href={href} target="_blank" rel="noopener">
            {label}
          </a>
        ) : (
          <Link key={href} className="menu__item" href={href}>
            {label}
          </Link>
        );
      })}
      <hr className="menu__sep" />
      <SignOutButton />
    </Menu>
  );
}

function ChildMenu({ kids, activeId }: { kids: NavChild[]; activeId: string | null }) {
  const pathname = usePathname();
  const active = kids.find((k) => k.id === activeId);
  return (
    <Menu
      id="menu-anak"
      label={active ? `Anak yang dilihat: ${active.name}. Ganti anak` : "Pilih anak"}
      trigger={
        <span className="navbar__child">
          <span className="navbar__child-hint">Anak</span>
          <span className="navbar__child-name">{active ? firstName(active.name) : "Belum ada"}</span>
        </span>
      }
    >
      <p className="menu__head">
        <strong>Lihat data anak</strong>
        <span>Hasil tiap anak tersimpan terpisah.</span>
      </p>
      {kids.map((k) => (
        <form key={k.id} action={selectChild}>
          <input type="hidden" name="anak" value={k.id} />
          <input type="hidden" name="kembali" value={pathname} />
          <button
            type="submit"
            className="menu__item menu__item--child"
            aria-current={k.id === activeId ? "true" : undefined}
          >
            <span>
              <strong>{k.name}</strong>
              <small>{k.status}</small>
            </span>
            {k.id === activeId && <Icon name="check" className="icon icon--sm" />}
          </button>
        </form>
      ))}
      <hr className="menu__sep" />
      <form action={addChild}>
        <button type="submit" className="menu__item">
          <Icon name="plus" className="icon icon--sm" />
          Tambah anak
        </button>
      </form>
    </Menu>
  );
}

/** Menu publik (Beranda, Panduan, Tanya Jawab) dengan panel lipat di bawah 1024px. */
function PublicLinks({ extra }: { extra?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <>
      <nav
        className="navbar__nav"
        id="navbar-menu"
        aria-label="Utama"
        data-open={open}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <ul className="navbar__list">
          {PUBLIC_NAV.map(([href, label]) => (
            <li key={href}>
              <Link
                className="navbar__link"
                href={href}
                onClick={() => setOpen(false)}
                aria-current={href === pathname ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        {extra && <div className="navbar__nav-extra">{extra}</div>}
      </nav>
      <button
        ref={toggle}
        className="navbar__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="navbar-menu"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        onClick={() => setOpen(!open)}
      >
        <Icon name={open ? "x" : "menu"} className="icon icon--sm" />
      </button>
    </>
  );
}

/** Navbar sesuai keadaan sesi (docs/navigation-plan.md bagian 4). */
export function Navbar(props: NavbarProps) {
  const pathname = usePathname();

  if (props.variant === "parent") {
    const current = stageOf(pathname);
    return (
      <header className="navbar">
        <div className="navbar__inner">
          <Brand href="/anak-saya" />
          <nav className="navbar__stages" aria-label="Tahap">
            <ol className="navbar__stage-list">
              {props.stages.map((s) => (
                <li key={s.key}>
                  <StageLink stage={s} active={s.key === current} lockedHref={props.lockedHref} variant="top" />
                </li>
              ))}
            </ol>
          </nav>
          <div className="navbar__actions">
            <ChildMenu kids={props.kids} activeId={props.activeId} />
            <AccountMenu
              user={props.user}
              photo={props.photo}
              role="Orang tua"
              links={[
                ["/panduan", "Panduan Jalur"],
                ["/tanya-jawab", "Tanya Jawab"],
                [HELP_URL, "Butuh bantuan? (WhatsApp)"],
              ]}
            />
          </div>
        </div>
      </header>
    );
  }

  let actions: React.ReactNode;
  let extra: React.ReactNode = null;
  if (props.variant === "guest") {
    const next = pathname === "/masuk" ? undefined : pathname;
    const masuk = next && next !== "/" ? `/masuk?next=${encodeURIComponent(next)}` : "/masuk";
    actions = (
      <>
        <Button variant="ghost" sm href={masuk} className="navbar__signin">
          Masuk
        </Button>
        <Button variant="primary" sm href="/cek-cepat">
          Cek Cepat
        </Button>
      </>
    );
    extra = (
      <Button variant="secondary" block href={masuk}>
        Masuk
      </Button>
    );
  } else if (props.variant === "parent-public") {
    actions = (
      <>
        <Button variant="primary" sm href={props.cont.href} className="navbar__continue">
          {props.cont.label}
        </Button>
        <AccountMenu user={props.user} photo={props.photo} role="Orang tua" links={[["/anak-saya", "Anak Saya"]]} />
      </>
    );
  } else {
    actions = (
      <>
        <Button variant="primary" sm href={props.home} className="navbar__continue">
          Buka Dashboard
        </Button>
        <AccountMenu user={props.user} role={props.role} links={[[props.home, "Dashboard"]]} />
      </>
    );
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Brand href="/" />
        <PublicLinks extra={extra} />
        <div className="navbar__actions">{actions}</div>
      </div>
    </header>
  );
}

/** Bar atas dashboard: merek, label peran + nama, dan menu akun berisi Keluar. */
export function DashBar({ home, user, role }: { home: string; user: string; role: string }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Brand href={home} />
        <div className="navbar__actions">
          <span className="navbar__role">
            <strong>{user}</strong>
            <span>{role}</span>
          </span>
          <AccountMenu user={user} role={role} links={[["/", "Lihat situs publik"]]} />
        </div>
      </div>
    </header>
  );
}

/** Header mode fokus (wizard dan Cek Cepat): tanpa menu utama agar orang tua tidak keluar tanpa sengaja. */
export function FocusBar({
  title,
  subtitle,
  progress,
  brandHref,
  exit,
}: {
  title: string;
  subtitle: string;
  progress?: { step: number; total: number };
  /** Bila diisi, logo menjadi tautan. Di wizard dibiarkan kosong agar tidak keluar tanpa sengaja. */
  brandHref?: string;
  exit: { href: string; label: string };
}) {
  return (
    <header className="navbar navbar--focus">
      <div className="navbar__inner">
        {brandHref ? (
          <Brand href={brandHref} />
        ) : (
          <span className="brand" aria-label="SiPesek">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/logo/logo-hifi.svg" alt="" aria-hidden="true" width={34} height={34} />
            <span className="navbar__focus-brand">SiPesek</span>
          </span>
        )}
        <div className="navbar__focus">
          <p className="navbar__focus-title">
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </p>
          {progress && (
            <ol className="stepper__bar" aria-hidden="true">
              {Array.from({ length: progress.total }, (_, i) => (
                <li
                  key={i}
                  className={`stepper__segment${i < progress.step ? " stepper__segment--done" : ""}`}
                />
              ))}
            </ol>
          )}
        </div>
        <div className="navbar__actions">
          <Button variant="ghost" sm href={HELP_URL} newTab iconLeft="message" className="navbar__help">
            Bantuan
          </Button>
          <Button variant="secondary" sm href={exit.href}>
            {exit.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
