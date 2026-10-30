"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../icon/Icon";

/** Tombol + panel dropdown. Esc dan klik di luar menutup; fokus kembali ke tombol. */
export function Menu({
  id,
  label,
  trigger,
  children,
  align = "end",
}: {
  id: string;
  /** Label untuk pembaca layar, misal "Ganti anak". */
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div
      className="menu"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        className="menu__trigger"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen(!open)}
      >
        {trigger}
        <Icon name="chevron-down" className="icon icon--sm menu__chevron" />
      </button>
      <div
        className={`menu__panel menu__panel--${align}`}
        id={id}
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button")) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
