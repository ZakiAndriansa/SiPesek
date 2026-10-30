import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";

const STATUS: Record<string, readonly [icon: string, label: string]> = {
  aman: ["check", "Peluang Besar"],
  bersaing: ["scale", "Memungkinkan"],
  berisiko: ["alert", "Peluang Kecil"],
  info: ["info", "Info"],
};

/** kind: aman | bersaing | berisiko | info (ikon + teks bawaan) atau brand | neutral (teks sendiri). */
export function Badge({
  kind,
  lg,
  children,
}: {
  kind: string;
  lg?: boolean;
  children?: ReactNode;
}) {
  const status = STATUS[kind];
  return (
    <span className={`badge badge--${kind}${lg ? " badge--lg" : ""}`}>
      {status && <Icon name={status[0]} className="icon badge__icon" />}
      {children ?? status?.[1]}
    </span>
  );
}
