import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";

const ICON = {
  info: "info",
  success: "check-circle",
  warning: "scale",
  danger: "alert",
} as const;

/** Callout inline: ikon + judul + teks. Warna tidak pernah jadi satu-satunya sinyal. */
export function Alert({
  kind,
  title,
  action,
  children,
}: {
  kind: keyof typeof ICON;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`alert alert--${kind}`}
      role={kind === "danger" ? "alert" : "note"}
    >
      <Icon name={ICON[kind]} className="icon alert__icon" />
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        <p className="alert__text">{children}</p>
        {action}
      </div>
    </div>
  );
}
