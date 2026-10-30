"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { openDialog } from "@/lib/dialog";
import { Icon } from "../icon/Icon";
import { useToast } from "../toast/Toast";

type Props = {
  variant: "primary" | "secondary" | "ghost" | "inverse" | "inverse-outline";
  sm?: boolean;
  lg?: boolean;
  block?: boolean;
  iconOnly?: boolean;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  form?: string;
  /** Ikon setelah / sebelum teks. */
  icon?: string;
  iconLeft?: string;
  /** Perilaku deklaratif: buka dialog, tutup dialog, tampilkan toast, cetak. */
  opens?: string;
  closes?: boolean;
  toast?: { message: string; variant?: string };
  print?: boolean;
  newTab?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  "aria-label"?: string;
  children?: ReactNode;
};

export function Button({
  variant,
  sm,
  lg,
  block,
  iconOnly,
  className,
  href,
  type = "button",
  form,
  icon,
  iconLeft,
  opens,
  closes,
  toast,
  print,
  newTab,
  onClick,
  children,
  ...rest
}: Props) {
  const { show } = useToast();
  const cls = `button button--${variant}${sm ? " button--sm" : ""}${lg ? " button--lg" : ""}${block ? " button--block" : ""}${iconOnly ? " button--icon" : ""}${className ? ` ${className}` : ""}`;
  const inner = (
    <>
      {iconLeft && <Icon name={iconLeft} className="icon button__icon" />}
      {children}
      {icon && <Icon name={icon} className="icon button__icon" />}
    </>
  );

  if (href) {
    const external = /^https?:/.test(href);
    const props = {
      className: cls,
      ...(newTab ? { target: "_blank", rel: "noopener" } : {}),
      ...rest,
    };
    return external ? (
      <a href={href} {...props}>
        {inner}
      </a>
    ) : (
      <Link href={href} {...props}>
        {inner}
      </Link>
    );
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (opens) openDialog(opens, event.currentTarget);
    if (closes) event.currentTarget.closest("dialog")?.close();
    if (toast) show(toast.message, toast.variant);
    if (print) window.print();
    onClick?.(event);
  }

  return (
    <button
      className={cls}
      type={type}
      form={form}
      onClick={handleClick}
      data-dialog-open={opens}
      data-dialog-close={closes ? "" : undefined}
      data-toast-trigger={toast ? "" : undefined}
      data-toast-variant={toast?.variant}
      data-toast-message={toast?.message}
      data-print={print ? "" : undefined}
      {...rest}
    >
      {inner}
    </button>
  );
}

export function ButtonGroup({ children }: { children: ReactNode }) {
  return <div className="button-group">{children}</div>;
}
