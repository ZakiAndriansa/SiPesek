"use client";

import type { InputHTMLAttributes } from "react";
import { Icon } from "../icon/Icon";
import { useFieldError } from "./Form";

export const ariaInvalid = (message: string | undefined) =>
  message === undefined ? undefined : message !== "";

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p className="field__error" id={id} data-field-error="" hidden={!message}>
      <Icon name="alert" />
      <span data-field-error-text="">{message ?? ""}</span>
    </p>
  );
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  errorRequired?: string;
  errorPattern?: string;
};

/** Label permanen di atas, input, hint, dan pesan error (dibaca dari <Form>). */
export function Field({
  id,
  label,
  hint,
  optional,
  errorRequired,
  errorPattern,
  type = "text",
  required,
  ...input
}: FieldProps) {
  const message = useFieldError(id);
  const hasError = required || !!errorPattern;
  const describedBy =
    [hint && `${id}-hint`, hasError && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={`field${message ? " field--error" : ""}`}>
      <label className="field__label" htmlFor={id}>
        {optional ? `${label} ` : label}
        {optional && (
          <span className="field__optional">(boleh dikosongkan)</span>
        )}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <input
        className="field__input"
        id={id}
        name={id}
        type={type}
        required={required}
        data-error-required={errorRequired}
        data-error-pattern={errorPattern}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid(message)}
        {...input}
      />
      {hasError && <FieldError id={`${id}-error`} message={message} />}
    </div>
  );
}
