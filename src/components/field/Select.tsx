"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../icon/Icon";
import { FieldError } from "./Field";
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
  /** Tampilkan kotak cari di daftar pilihan. Bawaan: hanya bila pilihannya banyak. */
  cari?: boolean;
};

/** Kotak cari baru muncul bila pilihan sebanyak ini atau lebih; daftar pendek lebih cepat dipilih langsung. */
const BATAS_CARI = 7;

/** Huruf kecil tanpa tanda diakritik, agar "pancoran" cocok dengan "Pancoran Mas". */
const rata = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Dropdown bergaya SiPesek dengan pencarian. `<select>` asli tetap ada (tersembunyi) sebagai sumber nilai:
 * FormData, validasi Form (required), dan pendengar `change` di halaman tetap bekerja seperti sebelumnya.
 * Tampilan dan papan ketik mengikuti pola combobox WAI-ARIA: tombol membuka daftar, kotak cari menyaring,
 * panah atas dan bawah memindah pilihan, Enter memilih, Escape menutup.
 */
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
  cari,
}: Props) {
  const message = useFieldError(id);
  const uid = useId();
  const listId = `${uid}-daftar`;
  const labelId = `${id}-label`;
  const describedBy =
    [hint && `${id}-hint`, required && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;

  const awal = selected ?? (placeholder ? "" : (options[0] ?? ""));
  const [nilai, setNilai] = useState(awal);
  const [buka, setBuka] = useState(false);
  const [kata, setKata] = useState("");
  const [aktif, setAktif] = useState(0);
  const selectRef = useRef<HTMLSelectElement>(null);
  const tombolRef = useRef<HTMLButtonElement>(null);
  const cariRef = useRef<HTMLInputElement>(null);
  const daftarRef = useRef<HTMLUListElement>(null);
  const bungkusRef = useRef<HTMLDivElement>(null);
  const pakaiCari = cari ?? options.length >= BATAS_CARI;

  // Isian opsional dengan placeholder bisa dikosongkan lagi lewat pilihan placeholder di urutan pertama.
  const semua = useMemo(
    () => [...(placeholder && !required ? [{ v: "", t: placeholder }] : []), ...options.map((o) => ({ v: o, t: o }))],
    [options, placeholder, required],
  );
  const tersaring = useMemo(() => {
    const k = rata(kata.trim());
    return k ? semua.filter((o) => rata(o.t).includes(k)) : semua;
  }, [kata, semua]);

  // Form.reset() mengembalikan <select> asli; tampilan ikut membaca ulang nilainya.
  useEffect(() => {
    const form = selectRef.current?.form;
    if (!form) return;
    const ulang = () => setTimeout(() => setNilai(selectRef.current?.value ?? ""));
    form.addEventListener("reset", ulang);
    return () => form.removeEventListener("reset", ulang);
  }, []);

  // Tutup bila mengetuk di luar daftar.
  useEffect(() => {
    if (!buka) return;
    const luar = (e: PointerEvent) => {
      if (!bungkusRef.current?.contains(e.target as Node)) setBuka(false);
    };
    document.addEventListener("pointerdown", luar);
    return () => document.removeEventListener("pointerdown", luar);
  }, [buka]);

  // Saat dibuka: fokus ke kotak cari (atau daftar), dan sorot pilihan yang sedang terpilih.
  useEffect(() => {
    if (!buka) return;
    (pakaiCari ? cariRef.current : daftarRef.current)?.focus();
  }, [buka, pakaiCari]);

  // Opsi yang disorot selalu terlihat saat digulir dengan papan ketik.
  useEffect(() => {
    if (!buka) return;
    daftarRef.current?.querySelector<HTMLElement>(`[data-indeks="${aktif}"]`)?.scrollIntoView({ block: "nearest" });
  }, [aktif, buka]);

  function bukaDaftar() {
    setKata("");
    setAktif(Math.max(0, semua.findIndex((o) => o.v === nilai)));
    setBuka(true);
  }

  function tutup(kembaliFokus = true) {
    setBuka(false);
    if (kembaliFokus) tombolRef.current?.focus();
  }

  function pilih(o: string) {
    const el = selectRef.current;
    setNilai(o);
    tutup();
    if (!el || el.value === o) return;
    el.value = o;
    // Peristiwa asli agar Form (validasi ulang) dan pendengar onChange di halaman ikut bereaksi.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function tombolKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      bukaDaftar();
    }
  }

  function daftarKey(e: KeyboardEvent<HTMLElement>) {
    const n = tersaring.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (n) setAktif((a) => (a + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (n) setAktif((a) => (a - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setAktif(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setAktif(Math.max(0, n - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (tersaring[aktif] !== undefined) pilih(tersaring[aktif].v);
    } else if (e.key === "Escape") {
      e.preventDefault();
      tutup();
    } else if (e.key === "Tab") {
      tutup(false);
    }
  }

  const opsiAktif = buka && tersaring[aktif] !== undefined ? `${uid}-opsi-${aktif}` : undefined;

  return (
    <div className={`field${message ? " field--error" : ""}`}>
      <label className="field__label" id={labelId} htmlFor={id}>
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
      <div className="field__select-wrap" ref={bungkusRef}>
        {/* Sumber nilai untuk FormData dan validasi. Fokus dari label atau dari Form dialihkan ke tombol. */}
        <select
          ref={selectRef}
          className="field__select-asli"
          id={id}
          name={id}
          required={required}
          data-error-required={errorRequired}
          aria-hidden="true"
          tabIndex={-1}
          defaultValue={awal}
          onFocus={() => tombolRef.current?.focus()}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <button
          ref={tombolRef}
          type="button"
          className={`field__select${nilai ? "" : " field__select--kosong"}`}
          aria-haspopup="listbox"
          aria-expanded={buka}
          aria-controls={buka ? listId : undefined}
          aria-labelledby={`${labelId} ${uid}-nilai`}
          aria-describedby={describedBy}
          onClick={() => (buka ? tutup() : bukaDaftar())}
          onKeyDown={tombolKey}
        >
          <span id={`${uid}-nilai`} className="field__select-nilai">
            {nilai || placeholder || "Pilih"}
          </span>
        </button>
        <Icon name="chevron-down" className={`icon field__select-icon${buka ? " field__select-icon--buka" : ""}`} />

        {buka && (
          <div className="field__select-panel">
            {pakaiCari && (
              <div className="field__select-cari">
                <Icon name="search" className="icon icon--sm field__select-cari-icon" />
                <input
                  ref={cariRef}
                  type="text"
                  className="field__select-cari-input"
                  placeholder="Ketik untuk mencari"
                  aria-label={`Cari ${label}`}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={opsiAktif}
                  autoComplete="off"
                  value={kata}
                  onChange={(e) => {
                    setKata(e.target.value);
                    setAktif(0);
                  }}
                  onKeyDown={daftarKey}
                />
              </div>
            )}
            <ul
              ref={daftarRef}
              id={listId}
              className="field__select-daftar"
              role="listbox"
              aria-labelledby={labelId}
              aria-activedescendant={pakaiCari ? undefined : opsiAktif}
              tabIndex={pakaiCari ? -1 : 0}
              onKeyDown={pakaiCari ? undefined : daftarKey}
            >
              {tersaring.map((o, i) => (
                <li
                  key={o.v || "__kosong"}
                  id={`${uid}-opsi-${i}`}
                  data-indeks={i}
                  role="option"
                  aria-selected={o.v === nilai}
                  className={`field__select-opsi${i === aktif ? " field__select-opsi--aktif" : ""}${o.v ? "" : " field__select-opsi--kosong"}`}
                  onPointerMove={() => setAktif(i)}
                  onClick={() => pilih(o.v)}
                >
                  <span>{o.t}</span>
                  {o.v === nilai && <Icon name="check" className="icon icon--sm field__select-centang" />}
                </li>
              ))}
              {tersaring.length === 0 && (
                <li className="field__select-kosong" role="presentation">
                  Tidak ada yang cocok dengan &ldquo;{kata}&rdquo;.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {required && <FieldError id={`${id}-error`} message={message} />}
    </div>
  );
}
