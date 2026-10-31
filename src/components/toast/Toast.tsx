"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { Icon } from "../icon/Icon";

const ICONS: Record<string, string> = {
  info: "#i-info",
  success: "#i-check-circle",
  danger: "#i-alert",
};
const DURATION = 8000;

type ToastData = { id: number; message: string; variant: string };
type Ctx = {
  show: (message: string, variant?: string) => void;
  items: ToastData[];
  dismiss: (id: number) => void;
};

const ToastContext = createContext<Ctx>({ show() {}, items: [], dismiss() {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastData[]>([]);
  const nextId = useRef(0);
  const show = useCallback((message: string, variant = "info") => {
    const v = ICONS[variant] ? variant : "info";
    setItems((list) => [
      ...list,
      { id: nextId.current++, message, variant: v },
    ]);
  }, []);
  const dismiss = useCallback(
    (id: number) => setItems((list) => list.filter((t) => t.id !== id)),
    [],
  );
  const value = useMemo(
    () => ({ show, items, dismiss }),
    [show, items, dismiss],
  );
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

/** Tutup otomatis 8 detik, berhenti saat disentuh kursor atau fokus. */
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const stop = () => window.clearTimeout(timer.current);
  const start = () => {
    stop();
    timer.current = window.setTimeout(onDismiss, DURATION);
  };
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // A-04: masuk dari bawah 200ms, keluar memudar 120ms. Toast lain bergeser halus (layout).
    <m.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0, 0, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      className={`toast toast--${toast.variant}`}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      <svg className="icon toast__icon" aria-hidden="true" data-toast-icon="">
        <use href={ICONS[toast.variant]} />
      </svg>
      <p className="toast__message" data-toast-message="">
        {toast.message}
      </p>
      <button
        className="button button--ghost button--icon toast__close"
        type="button"
        aria-label="Tutup notifikasi"
        data-toast-close=""
        onClick={onDismiss}
      >
        <Icon name="x" className="icon button__icon" />
      </button>
    </m.div>
  );
}

export function ToastRegion() {
  const { items, dismiss } = useToast();
  return (
    <div className="toast-region" data-toast-region="" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
