"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { openDialog } from "@/lib/dialog";
import { stageOf } from "@/lib/accounts";
import { HELP_URL, PUBLIC_NAV } from "@/lib/nav";
import { bacaIsian } from "@/features/ortu/isian";
import { lupakanDataOrtu, useOrtu } from "@/features/ortu/store";
import { addChild, selectChild, signOut } from "@/lib/session-actions";
import { Brand } from "../brand/Brand";
import { Button } from "../button/Button";
import { Dialog } from "../dialog/Dialog";
import { Icon } from "../icon/Icon";
import { usePerluKonfirmasiKeluar } from "./penjaga-keluar";
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
      /** Pengganti pemilih anak prototipe (akun Google memakai data anak asli dari API). */
      childMenu?: ReactNode;
    };

const firstName = (name: string) => name.split(" ")[0];

function SignOutButton() {
  return (
    <form action={signOut} onSubmit={() => lupakanDataOrtu({ perangkat: true })}>
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
          <nav className="navbar__stages" aria-label="Menu">
            <ol className="navbar__stage-list">
              {props.stages.map((s) => (
                <li key={s.key}>
                  <StageLink stage={s} active={s.key === current} lockedHref={props.lockedHref} variant="top" />
                </li>
              ))}
            </ol>
          </nav>
          <div className="navbar__actions">
            {props.childMenu ?? <ChildMenu kids={props.kids} activeId={props.activeId} />}
            <AccountMenu
              user={props.user}
              photo={props.photo}
              role="Orang tua"
              links={[
                ["/anak-saya#privasi", "Data dan privasi"],
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
        <AccountMenu user={props.user} photo={props.photo} role="Orang tua" links={[["/anak-saya", "Data Anak"]]} />
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

/**
 * Bar atas dashboard: merek, label peran + nama, dan menu akun berisi Keluar. Tanpa `user` (pengunjung
 * dashboard kebijakan yang publik): tautan ke Beranda dan masuk petugas.
 */
export function DashBar({
  home,
  user,
  role,
  links = [["/", "Lihat situs publik"]],
}: {
  home: string;
  user?: string;
  role: string;
  links?: [string, string][];
}) {
  if (!user) {
    return (
      <header className="navbar">
        <div className="navbar__inner">
          <Brand href="/" />
          <div className="navbar__actions">
            {/* navbar__signin: disembunyikan di layar sempit; logo sudah mengarah ke Beranda. */}
            <Button variant="ghost" sm href="/" className="navbar__signin">
              Beranda
            </Button>
            <Button variant="secondary" sm href="/masuk-petugas">
              Masuk petugas
            </Button>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Brand href={home} />
        <div className="navbar__actions">
          <span className="navbar__role">
            <strong>{user}</strong>
            <span>{role}</span>
          </span>
          <AccountMenu user={user} role={role} links={links} />
        </div>
      </div>
    </header>
  );
}

type KeluarFokus = {
  href: string;
  label: string;
  /** Bila diisi: tombol Keluar ber-ikon ✕, dan bila halaman menandai ada isian (useIsianBelumTersimpan), minta konfirmasi. */
  konfirmasi?: { judul: string; isi: string };
};

/**
 * Chip privasi di header fokus: ikon gembok dan label (label tersembunyi di layar sempit, tetap terbaca pembaca layar).
 * Diketuk: penjelasan singkat muncul di bawahnya; tertutup dengan ketuk di luar atau Escape.
 */
function ChipPrivasi({ label, isi }: { label: string; isi: string }) {
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = `${useId()}-privasi`;
  useEffect(() => {
    if (!buka) return;
    const luar = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setBuka(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("pointerdown", luar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", luar);
      document.removeEventListener("keydown", esc);
    };
  }, [buka]);
  return (
    <span className="navbar__privasi" ref={ref}>
      <button
        type="button"
        className="navbar__privasi-chip"
        aria-expanded={buka}
        aria-controls={id}
        onClick={() => setBuka(!buka)}
      >
        <Icon name="lock" className="icon icon--sm" />
        <span className="navbar__privasi-teks">{label}</span>
      </button>
      {buka && (
        <span id={id} role="note" className="navbar__privasi-isi">
          <strong>{label}</strong>
          <span>{isi}</span>
        </span>
      )}
    </span>
  );
}

/** Tombol Keluar dengan konfirmasi bila keluar akan membuang isian. Label tersembunyi di layar sempit (ikon ✕ saja). */
function TombolKeluar({ href, label, konfirmasi }: Required<KeluarFokus>) {
  const router = useRouter();
  const perlu = usePerluKonfirmasiKeluar();
  const idDialog = "dlg-keluar-fokus";
  return (
    <>
      <Button
        variant="secondary"
        sm
        iconLeft="x"
        className="navbar__keluar"
        onClick={(e) => (perlu ? openDialog(idDialog, e.currentTarget) : router.push(href))}
      >
        <span className="navbar__keluar-teks">{label}</span>
      </Button>
      <Dialog
        id={idDialog}
        title={konfirmasi.judul}
        footer={
          <>
            {/* Urutan DOM: footer dialog membalik urutan di HP, jadi tombol utama tampil paling atas. */}
            <Button variant="secondary" closes onClick={() => router.push(href)}>
              Keluar
            </Button>
            <Button variant="primary" closes>
              Lanjutkan mengisi
            </Button>
          </>
        }
      >
        <p>{konfirmasi.isi}</p>
      </Dialog>
    </>
  );
}

type ProgresFokus = {
  step: number;
  total: number;
  /** Nama tiap langkah, untuk tooltip dan pembaca layar. */
  labels?: string[];
  /** Awal alamat tiap langkah, misalnya "/isi-data/" untuk /isi-data/1 dan seterusnya. Tanpa ini, bar tidak bisa diklik. */
  dasar?: string;
  /** Langkah terjauh yang boleh dibuka lewat bar (langkah sebelum langkah aktif selalu boleh). */
  terbuka?: number;
  /** Akun Google: langkah terjauh dibaca dari isian anak aktif yang tersimpan di perangkat. */
  dariIsianOrtu?: boolean;
};

/**
 * Bar langkah wizard di header. Segmen menjadi tautan ke langkahnya: mundur ke langkah mana pun, maju sampai
 * langkah terjauh yang sudah dicapai. Isian wizard tersimpan otomatis tiap berubah, jadi pindah langkah lewat
 * bar tidak membuang ketikan (sama seperti tombol Kembali).
 */
function BarLangkah({ step, total, labels, dasar, terbuka }: ProgresFokus & { terbuka: number }) {
  const nama = (k: number) => (labels?.[k - 1] ? `Langkah ${k}: ${labels[k - 1]}` : `Langkah ${k}`);
  return (
    <ol className="stepper__bar stepper__bar--klik" aria-label="Langkah">
      {Array.from({ length: total }, (_, i) => {
        const k = i + 1;
        const kelas = `stepper__segment${k <= step ? " stepper__segment--done" : ""}`;
        const boleh = !!dasar && k !== step && (k < step || k <= terbuka);
        return (
          <li key={i} className="stepper__item">
            {boleh ? (
              <Link
                href={`${dasar}${k}`}
                className={`stepper__tombol${k > step ? " stepper__tombol--maju" : ""}`}
                title={`Buka ${nama(k).toLowerCase()}`}
                aria-label={`Buka ${nama(k).toLowerCase()}`}
              >
                <span className={kelas} />
              </Link>
            ) : (
              <span
                className="stepper__diam"
                title={labels?.[i]}
                role="img"
                aria-label={k === step ? `${nama(k)}, langkah ini` : `${nama(k)}, belum bisa dibuka`}
                aria-current={k === step ? "step" : undefined}
              >
                <span className={kelas} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Wizard akun Google: batas langkah dari isian anak aktif di perangkat, dibaca setelah hidrasi. */
function BarLangkahOrtu(props: ProgresFokus) {
  const { aktif } = useOrtu();
  // Menambah anak baru (?baru=1): anak aktif masih anak lain, jadi belum ada langkah lain yang boleh dibuka.
  const baru = useSearchParams().get("baru") === "1";
  const [terbuka, setTerbuka] = useState(1);
  useEffect(() => {
    // Isian ada di localStorage, baru bisa dibaca di browser setelah hidrasi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTerbuka(aktif && !baru ? Math.min((bacaIsian(aktif.id)?.langkah ?? 0) + 1, props.total) : 1);
  }, [aktif, baru, props.total, props.step]);
  return <BarLangkah {...props} terbuka={terbuka} />;
}

/** Header mode fokus (wizard dan Cek Cepat): tanpa menu utama agar orang tua tidak keluar tanpa sengaja. */
export function FocusBar({
  title,
  subtitle,
  progress,
  brandHref,
  privasi,
  exit,
}: {
  title: string;
  /** Baris kecil di samping judul (wizard: "Langkah x dari y"). Tanpa subjudul, judul tampil lebih besar. */
  subtitle?: string;
  progress?: ProgresFokus;
  /** Bila diisi, logo menjadi tautan. Di wizard dibiarkan kosong agar tidak keluar tanpa sengaja. */
  brandHref?: string;
  /** Chip gembok di samping judul (Cek Cepat: "Tidak disimpan"). */
  privasi?: { label: string; isi: string };
  exit: KeluarFokus;
}) {
  return (
    <header className="navbar navbar--focus">
      {/* Dengan chip privasi (Cek Cepat), judul diletakkan tepat di tengah bar. */}
      <div className={`navbar__inner${privasi ? " navbar__inner--tengah" : ""}`}>
        {brandHref ? (
          <Brand href={brandHref} />
        ) : (
          <span className="brand" aria-label="SiPesek">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand__logo" src="/logo/logo-hifi.svg" alt="" aria-hidden="true" width={34} height={34} />
            <span className="navbar__focus-brand">SiPesek</span>
          </span>
        )}
        <div className={`navbar__focus${privasi ? " navbar__focus--baris" : ""}`}>
          <p className={`navbar__focus-title${subtitle ? "" : " navbar__focus-title--tunggal"}`}>
            <strong>{title}</strong>
            {subtitle && <span>{subtitle}</span>}
          </p>
          {privasi && <ChipPrivasi label={privasi.label} isi={privasi.isi} />}
          {progress &&
            (progress.dariIsianOrtu ? (
              <BarLangkahOrtu {...progress} />
            ) : (
              <BarLangkah {...progress} terbuka={progress.terbuka ?? progress.step} />
            ))}
        </div>
        <div className="navbar__actions">
          <Button variant="ghost" sm href={HELP_URL} newTab iconLeft="message" className="navbar__help">
            Bantuan
          </Button>
          {exit.konfirmasi ? (
            <TombolKeluar href={exit.href} label={exit.label} konfirmasi={exit.konfirmasi} />
          ) : (
            <Button variant="secondary" sm href={exit.href}>
              {exit.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
