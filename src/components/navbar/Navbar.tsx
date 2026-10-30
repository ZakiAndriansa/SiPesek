"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { PUBLIC_NAV } from "@/lib/nav";
import { Brand } from "../brand/Brand";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";

/** Menu publik (Beranda, Panduan, Tanya Jawab) dengan panel lipat di bawah 1024px. */
function PublicLinks() {
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

/** Navbar halaman publik: menu utama dan tombol "Mulai cek peluang". */
export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Brand href="/" />
        <PublicLinks />
        <div className="navbar__actions">
          <Button variant="primary" sm href="/cek">
            Mulai cek peluang
          </Button>
        </div>
      </div>
    </header>
  );
}
