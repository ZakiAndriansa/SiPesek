"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type FormEvent,
  type FocusEvent,
  type ReactNode,
} from "react";
import { useToast } from "../toast/Toast";

// Validasi form berbasis Constraint Validation API. Perilaku sama dengan field.js di baseline.
// errors[key]: undefined = belum dicek, "" = valid, selain itu = pesan error.
type Errors = Record<string, string>;
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const ErrorContext = createContext<Errors>({});
export const useFieldError = (key: string): string | undefined =>
  useContext(ErrorContext)[key];

const isControl = (el: EventTarget | null): el is Control =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLSelectElement ||
  el instanceof HTMLTextAreaElement;
const keyOf = (el: Control) =>
  el instanceof HTMLInputElement &&
  (el.type === "radio" || el.type === "checkbox")
    ? el.name
    : el.id;

function messageFor(el: Control): string {
  const v = el.validity;
  if (v.valueMissing)
    return el.dataset.errorRequired || "Bagian ini wajib diisi.";
  if (v.patternMismatch || v.tooShort || v.tooLong || v.typeMismatch)
    return el.dataset.errorPattern || "Format belum sesuai.";
  return "";
}

type FormProps = {
  children: ReactNode;
  id?: string;
  next?: string;
  toast?: string;
  reveal?: string;
  /** Dipanggil saat semua isian valid (menggantikan next/toast). */ onValid?: () => void;
};

export function Form({
  children,
  id,
  next,
  toast,
  reveal,
  onValid,
}: FormProps) {
  const [errors, setErrors] = useState<Errors>({});
  const latest = useRef<Errors>(errors);
  const touched = useRef(new Set<Control>());
  const router = useRouter();
  const { show } = useToast();

  const merge = (patch: Errors) => {
    latest.current = { ...latest.current, ...patch };
    setErrors(latest.current);
  };

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const patch: Errors = {};
    let firstInvalid: Control | null = null;
    for (const el of Array.from(form.elements).filter(isControl)) {
      touched.current.add(el);
      const message = messageFor(el);
      patch[keyOf(el)] = message;
      if (message && !firstInvalid) firstInvalid = el;
    }
    merge(patch);
    if (firstInvalid) return (firstInvalid as Control).focus();
    if (onValid) {
      onValid();
    } else if (toast) {
      show(toast, "success");
      form.closest("dialog")?.close();
    } else if (next) {
      router.push(next);
    }
  }

  function onBlur(event: FocusEvent<HTMLFormElement>) {
    const el = event.target;
    if (!isControl(el) || !(touched.current.has(el) || el.value)) return;
    touched.current.add(el);
    merge({ [keyOf(el)]: messageFor(el) });
  }

  // Setelah error tampil, cek ulang tiap perubahan agar pesan hilang begitu isian benar.
  function onChange(event: FormEvent<HTMLFormElement>) {
    const el = event.target;
    if (isControl(el) && latest.current[keyOf(el)])
      merge({ [keyOf(el)]: messageFor(el) });
  }

  return (
    <ErrorContext.Provider value={errors}>
      <form
        className="form"
        id={id}
        data-validate=""
        data-next={next}
        data-toast={toast}
        data-reveal={reveal}
        noValidate
        onSubmit={onSubmit}
        onBlur={onBlur}
        onInput={onChange}
        onChange={onChange}
      >
        {children}
      </form>
    </ErrorContext.Provider>
  );
}
