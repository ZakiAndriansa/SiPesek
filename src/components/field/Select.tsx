"use client";

import { Icon } from "../icon/Icon";
import { FieldError, ariaInvalid } from "./Field";
import { useFieldError } from "./Form";

type Props = {
  id: string;
  label: string;
  options: string[];
  /** Teks opsi kosong di awal (placeholder). */
  placeholder?: string;
  selected?: string;
  hint?: string;
  optional?: boolean;
  required?: boolean;
  errorRequired?: string;
};

export function Select({
  id,
  label,
  options,
  placeholder,
  selected,
  hint,
  optional,
  required,
  errorRequired,
}: Props) {
  const message = useFieldError(id);
  const describedBy =
    [hint && `${id}-hint`, required && `${id}-error`]
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
      <div className="field__select-wrap">
        <select
          className="field__select"
          id={id}
          name={id}
          required={required}
          data-error-required={errorRequired}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid(message)}
          defaultValue={selected}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <Icon name="chevron-down" className="icon field__select-icon" />
      </div>
      {required && <FieldError id={`${id}-error`} message={message} />}
    </div>
  );
}
