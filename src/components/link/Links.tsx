"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { openDialog } from "@/lib/dialog";
import { Icon } from "../icon/Icon";

/** Tautan mandiri dengan panah, target sentuh 48px. */
export function MoreLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="link link--standalone" href={href}>
      {children}
      <Icon name="arrow-right" className="icon link__icon" />
    </Link>
  );
}

/** Tautan keluar situs: tab baru, ikon, dan keterangan untuk pembaca layar. */
export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      className="link link--standalone"
      href={href}
      target="_blank"
      rel="noopener"
    >
      {children}
      <Icon name="external" className="icon link__icon" />
      <span className="visually-hidden">(membuka tab baru)</span>
    </a>
  );
}

/** Pemicu "Apa ini?" yang membuka dialog penjelasan. */
export function HelpLink({
  opens,
  children,
}: {
  opens: string;
  children: ReactNode;
}) {
  return (
    <button
      className="link link--help"
      type="button"
      data-dialog-open={opens}
      onClick={(e) => openDialog(opens, e.currentTarget)}
    >
      <Icon name="help" className="icon link__icon" />
      {children}
    </button>
  );
}
