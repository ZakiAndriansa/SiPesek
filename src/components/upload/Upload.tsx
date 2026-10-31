"use client";
import { useState } from "react";
import { Icon } from "../icon/Icon";

/** Area pilih file; input asli menutupi seluruh area. */
export function Upload({
  title,
  hint,
  accept,
  label,
}: {
  title: string;
  hint: string;
  accept: string;
  label: string;
}) {
  // G-04: area menyala saat file diseret ke atasnya.
  const [dragging, setDragging] = useState(false);
  return (
    <label
      className={`upload${dragging ? " upload--drag" : ""}`}
      onDragEnter={() => setDragging(true)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={() => setDragging(false)}
    >
      <Icon name="upload" className="icon icon--lg upload__icon" />
      <span className="upload__title">{title}</span>
      <span className="upload__hint">{hint}</span>
      <input
        className="upload__input"
        type="file"
        accept={accept}
        aria-label={label}
      />
    </label>
  );
}
