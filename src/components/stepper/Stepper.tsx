import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";

type Props = {
  step: number;
  total: number;
  /** Tampilkan indikator "Tersimpan" di kanan. */ saved?: boolean;
  help?: ReactNode;
};

/** Header progres wizard: "Langkah x dari y" + bar bersegmen. */
export function Stepper({ step, total, saved, help }: Props) {
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
      <ol className="stepper__bar" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            className={`stepper__segment${i < step ? " stepper__segment--done" : ""}${i === step - 1 ? " stepper__segment--current" : ""}`}
          />
        ))}
      </ol>
    </div>
  );
}
