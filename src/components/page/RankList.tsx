"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "../badge/Badge";
import { Icon } from "../icon/Icon";

type Item = { name: string; role: string; jalur: string; kind: string };

/**
 * Urutan pilihan sekolah. Tombol panah menukar posisi; fokus tetap di tombol yang ditekan.
 * `tetap`: tanpa tombol panah, untuk daftar rekomendasi yang urutannya tidak bisa disimpan (Cek Cepat).
 */
export function RankList({ items, tetap = false }: { items: Item[]; tetap?: boolean }) {
  const [order, setOrder] = useState(items);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const refocus = useRef<string | null>(null);

  useEffect(() => {
    if (refocus.current) buttons.current[refocus.current]?.focus();
    refocus.current = null;
  });

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    refocus.current = `${order[index].name}:${dir}`;
    setOrder(next);
  }

  return (
    <ol className="rank">
      {order.map((item, i) => (
        <li key={item.name} className="card rank__item">
          <span className="rank__num" aria-hidden="true">
            {i + 1}
          </span>
          <div className="rank__body">
            <span className="rank__role">{item.role}</span>
            <h3 className="card__title">{item.name}</h3>
            <span className="card__text">{item.jalur}</span>
            <Badge kind={item.kind} />
          </div>
          {!tetap && (
            <div className="rank__moves">
              {(
                [
                  [-1, "up", "Naikkan"],
                  [1, "down", "Turunkan"],
                ] as const
              ).map(([dir, name, verb]) => (
                <button
                  key={name}
                  ref={(el) => {
                    buttons.current[`${item.name}:${dir}`] = el;
                  }}
                  className="button button--ghost button--icon"
                  type="button"
                  aria-label={`${verb} ${item.name}`}
                  data-move={name}
                  onClick={() => move(i, dir)}
                >
                  <Icon name={`arrow-${name}`} className="icon button__icon" />
                </button>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
