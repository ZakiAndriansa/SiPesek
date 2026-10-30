"use client";

import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";
import { useFieldError } from "../field/Form";

type ChoiceProps = {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  title: string;
  desc?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  errorRequired?: string;
};

/** Radio atau checkbox berbentuk kartu (min 56px). */
export function Choice({
  type,
  name,
  value,
  title,
  desc,
  checked,
  disabled,
  required,
  errorRequired,
}: ChoiceProps) {
  const message = useFieldError(name);
  return (
    <label className={`choice choice--${type}`}>
      <input
        className="choice__input"
        type={type}
        name={name}
        value={value}
        defaultChecked={checked}
        disabled={disabled}
        required={required}
        data-error-required={errorRequired}
        aria-invalid={message === undefined ? undefined : message !== ""}
      />
      <span className="choice__indicator" aria-hidden="true">
        {type === "radio" ? (
          <span className="choice__dot" />
        ) : (
          <Icon name="check" />
        )}
      </span>
      <span className="choice__body">
        <span className="choice__title">{title}</span>
        {desc && <span className="choice__desc">{desc}</span>}
      </span>
    </label>
  );
}

type GroupProps = {
  legend: ReactNode;
  hint?: ReactNode;
  cols2?: boolean;
  /** Nama input di dalam grup. Wajib bila grup punya pesan error. */
  errorName?: string;
  children: ReactNode;
};

export function ChoiceGroup({
  legend,
  hint,
  cols2,
  errorName,
  children,
}: GroupProps) {
  const message = useFieldError(errorName ?? "");
  return (
    <fieldset
      className={`choice-group${message ? " choice-group--error" : ""}`}
    >
      <legend className="choice-group__legend">{legend}</legend>
      {hint && <p className="choice-group__hint">{hint}</p>}
      <div
        className={`choice-group__options${cols2 ? " choice-group__options--2col" : ""}`}
      >
        {children}
      </div>
      {errorName && (
        <p
          className="choice-group__error"
          data-field-error=""
          hidden={!message}
        >
          <Icon name="alert" />
          <span data-field-error-text="">{message ?? ""}</span>
        </p>
      )}
    </fieldset>
  );
}
