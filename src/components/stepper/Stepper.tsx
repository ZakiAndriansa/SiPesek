import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";

type Props = {
  step: number;
  total: number;
  /** Tampilkan indikator "Tersimpan" di kanan. */ saved?: boolean;
  help?: ReactNode;
  /** Nama singkat tiap langkah, untuk tooltip dan pembaca layar. */
  labels?: string[];
  /** Bila ada, segmen bar menjadi tombol untuk berpindah langkah (nomor mulai dari 1). */
  onPilih?: (step: number) => void;
  /** Langkah yang boleh dibuka lewat bar. Bawaan: langkah sebelum langkah aktif. */
  bisaDibuka?: (step: number) => boolean;
};

/** Header progres wizard: "Langkah x dari y" + bar bersegmen. Segmen bisa diklik bila `onPilih` diberikan. */
export function Stepper({ step, total, saved, help, labels, onPilih, bisaDibuka }: Props) {
  const nama = (n: number) => (labels?.[n - 1] ? `Langkah ${n}: ${labels[n - 1]}` : `Langkah ${n}`);
  const boleh = (n: number) => (bisaDibuka ? bisaDibuka(n) : n < step);
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
      {onPilih ? (
        <ol className="stepper__bar stepper__bar--klik" aria-label="Langkah">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const kelas = `stepper__segment${n <= step ? " stepper__segment--done" : ""}${n === step ? " stepper__segment--current" : ""}`;
            return (
              <li key={i} className="stepper__item">
                {boleh(n) ? (
                  <button
                    type="button"
                    className={`stepper__tombol${n > step ? " stepper__tombol--maju" : ""}`}
                    title={`Buka ${nama(n).toLowerCase()}`}
                    aria-label={`Buka ${nama(n).toLowerCase()}`}
                    onClick={() => onPilih(n)}
                  >
                    <span className={kelas} />
                  </button>
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
    </div>
  );
}
