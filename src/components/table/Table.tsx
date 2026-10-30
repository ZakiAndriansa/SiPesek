import type { ReactNode } from "react";

type Props = {
  caption: string;
  head: string[];
  rows: ReactNode[][];
  /** Indeks kolom angka (rata kanan). */
  num?: number[];
  /** Kolom pertama sebagai header baris. */
  rowHead?: boolean;
  /** Tanpa lebar minimum. Bawaan: tabel <= 3 kolom. */
  compact?: boolean;
};

/** Dibungkus agar bisa digeser di HP tanpa melebarkan halaman. */
export function Table({
  caption,
  head,
  rows,
  num = [],
  rowHead = true,
  compact = head.length <= 3,
}: Props) {
  const numClass = (i: number) => (num.includes(i) ? "table__num" : undefined);
  return (
    <div className="table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className={`table${compact ? " table--compact" : ""}`}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={numClass(i)}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) =>
                rowHead && i === 0 ? (
                  <th key={i} scope="row" className={numClass(i)}>
                    {cell}
                  </th>
                ) : (
                  <td key={i} className={numClass(i)}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
