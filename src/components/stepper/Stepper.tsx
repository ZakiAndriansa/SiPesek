import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";

type Props = {
  step: number;
  total: number;
  /** Tampilkan indikator "Tersimpan" di kanan. */ saved?: boolean;
  help?: ReactNode;
  /** Nama singkat tiap langkah, untuk tooltip dan pembaca layar. */
  labels?: string[];
  /** Tampilkan nama langkah di bawah bar (wizard Isi Data Anak). */
  tampilLabel?: boolean;
  /** Bila ada, segmen bar menjadi tombol untuk berpindah langkah (nomor mulai dari 1). Hanya dari komponen klien. */
  onPilih?: (step: number) => void;
  /** Langkah yang boleh dibuka lewat bar (bersama onPilih). Bawaan: langkah sebelum langkah aktif. */
  bisaDibuka?: (step: number) => boolean;
  /**
   * Bila ada, segmen bar menjadi tautan ke `${dasar}${nomor}` (bisa dipakai dari server component): mundur ke
   * langkah mana pun, maju sampai `terbuka`.
   */
  dasar?: string;
  /** Langkah terjauh yang boleh dibuka lewat tautan `dasar`. */
  terbuka?: number;
};

/** Header progres wizard: "Langkah x dari y" + bar bersegmen. Segmen bisa diklik bila `onPilih` atau `dasar` diberikan. */
export function Stepper({ step, total, saved, help, labels, tampilLabel, onPilih, bisaDibuka, dasar, terbuka }: Props) {
  const nama = (n: number) => (labels?.[n - 1] ? `Langkah ${n}: ${labels[n - 1]}` : `Langkah ${n}`);
  const boleh = (n: number) => {
    if (n === step) return false;
    if (dasar) return n < step || n <= (terbuka ?? step);
    return bisaDibuka ? bisaDibuka(n) : n < step;
  };
  const klik = !!onPilih || !!dasar;
  return (
    <div className="stepper">
      <div className="stepper__top">
        <span className="stepper__count">{`Langkah ${step} dari ${total}`}</span>
        {saved && (
          <span className="save-state">
            <Icon name="check-circle" className="icon icon--sm" />
            Tersimpan
          </span>
        )}
        {help}
      </div>
      {klik ? (
        <ol className="stepper__bar stepper__bar--klik" aria-label="Langkah">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const kelas = `stepper__segment${n <= step ? " stepper__segment--done" : ""}${n === step ? " stepper__segment--current" : ""}`;
            const kelasTombol = `stepper__tombol${n > step ? " stepper__tombol--maju" : ""}`;
            const label = `Buka ${nama(n).toLowerCase()}`;
            return (
              <li key={i} className="stepper__item">
                {boleh(n) ? (
                  dasar ? (
                    <Link href={`${dasar}${n}`} className={kelasTombol} title={label} aria-label={label}>
                      <span className={kelas} />
                    </Link>
                  ) : (
                    <button type="button" className={kelasTombol} title={label} aria-label={label} onClick={() => onPilih?.(n)}>
                      <span className={kelas} />
                    </button>
                  )
                ) : (
                  <span
                    className="stepper__diam"
                    title={labels?.[i]}
                    aria-label={n === step ? `${nama(n)}, langkah ini` : `${nama(n)}, belum bisa dibuka`}
                    aria-current={n === step ? "step" : undefined}
                    role="img"
                  >
                    <span className={kelas} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="stepper__bar" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <li
              key={i}
              className={`stepper__segment${i < step ? " stepper__segment--done" : ""}${i === step - 1 ? " stepper__segment--current" : ""}`}
            />
          ))}
        </ol>
      )}
      {tampilLabel && labels && (
        <ol className="stepper__nama" aria-hidden="true">
          {labels.slice(0, total).map((l, i) => (
            <li key={l} className={i + 1 === step ? "stepper__nama--aktif" : undefined}>
              {l}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
