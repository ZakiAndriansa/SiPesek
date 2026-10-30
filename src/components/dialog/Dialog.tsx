"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerDialog, triggerOf } from "@/lib/dialog";
import { Button } from "../button/Button";

/** <dialog> native: bottom sheet di < 600px, modal tengah di >= 600px. Esc ditangani browser. */
export function Dialog({
  id,
  title,
  footer,
  children,
}: {
  id: string;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    registerDialog(id, ref.current);
    return () => registerDialog(id, null);
  }, [id]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      id={id}
      data-dialog=""
      aria-labelledby={`${id}-title`}
      onClick={(event) => {
        // Klik di backdrop: target adalah elemen dialog itu sendiri
        if (event.target === event.currentTarget)
          event.currentTarget.close("backdrop");
      }}
      onClose={(event) => {
        const trigger = triggerOf(event.currentTarget);
        if (trigger && document.contains(trigger)) trigger.focus();
      }}
    >
      <span className="dialog__handle" aria-hidden="true" />
      <div className="dialog__header">
        <h2 className="dialog__title" id={`${id}-title`}>
          {title}
        </h2>
        <Button
          variant="ghost"
          iconOnly
          className="dialog__close"
          icon="x"
          closes
          aria-label="Tutup"
        />
      </div>
      <div className="dialog__body">{children}</div>
      <div className="dialog__footer">
        {footer ?? (
          <Button variant="primary" closes>
            Saya mengerti
          </Button>
        )}
      </div>
    </dialog>
  );
}
