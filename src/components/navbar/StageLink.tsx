import Link from "next/link";
import type { StageKey, StageState } from "@/lib/accounts";
import { Icon } from "../icon/Icon";

export type StageItem = {
  key: StageKey;
  n: number;
  label: string;
  short: string;
  href: string;
  icon: string;
  state: StageState;
};

const LOCK_HINT = "Lengkapi data anak dulu";

/**
 * Satu tahap perjalanan orang tua. Tahap terkunci tetap tampil (gembok) dan
 * mengarah ke langkah data yang belum selesai, bukan ke halaman error.
 */
export function StageLink({
  stage,
  active,
  lockedHref,
  variant,
}: {
  stage: StageItem;
  active: boolean;
  lockedHref: string;
  variant: "top" | "bottom";
}) {
  const locked = stage.state === "terkunci";
  const status = locked ? `, terkunci. ${LOCK_HINT}` : stage.state === "selesai" ? ", selesai" : "";
  const marker = locked ? (
    <Icon name="lock" className="icon stage__lock" />
  ) : stage.state === "selesai" && !active ? (
    <Icon name="check" className="icon stage__check" />
  ) : (
    <span aria-hidden="true">{stage.n}</span>
  );
  return (
    <Link
      className={`stage stage--${variant}${locked ? " stage--locked" : ""}`}
      href={locked ? lockedHref : stage.href}
      aria-current={active ? "page" : undefined}
      aria-label={`Tahap ${stage.n}: ${stage.label}${status}`}
      title={locked ? LOCK_HINT : undefined}
    >
      {variant === "top" ? (
        <>
          <span className="stage__num">{marker}</span>
          <span className="stage__label">{stage.label}</span>
        </>
      ) : (
        <>
          <span className="stage__icon-wrap">
            <Icon name={locked ? "lock" : stage.icon} />
          </span>
          <span className="stage__label">{stage.short}</span>
        </>
      )}
    </Link>
  );
}
