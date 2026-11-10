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
 * Satu menu area orang tua (Data Anak, Hasil Sekolah, Strategi, Dokumen). Tampil sebagai menu ber-ikon,
 * bukan langkah bernomor: halaman-halaman ini boleh dibuka dengan urutan apa pun begitu data anak lengkap.
 * Menu terkunci tetap tampil (gembok) dan mengarah ke langkah data yang belum selesai, bukan ke halaman error.
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
  return (
    <Link
      className={`stage stage--${variant}${locked ? " stage--locked" : ""}`}
      href={locked ? lockedHref : stage.href}
      aria-current={active ? "page" : undefined}
      aria-label={locked ? `${stage.label}, terkunci. ${LOCK_HINT}` : stage.label}
      title={locked ? LOCK_HINT : undefined}
    >
      {variant === "top" ? (
        <>
          <Icon name={locked ? "lock" : stage.icon} className="icon stage__ikon" />
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
