"use client";

import { useState, type ChangeEvent } from "react";
import { Choice, ChoiceGroup } from "./Choice";

type Item = { value: string; title: string; desc?: string; checked?: boolean };

/** Daftar centang dengan penghitung "n dari m dokumen siap". */
export function Checklist({
  legend,
  name,
  items,
}: {
  legend: string;
  name: string;
  items: Item[];
}) {
  const [count, setCount] = useState(items.filter((i) => i.checked).length);
  const onChange = (event: ChangeEvent<HTMLDivElement>) =>
    setCount(
      event.currentTarget.querySelectorAll("input[type=checkbox]:checked")
        .length,
    );
  return (
    <div data-checklist="" className="stack" onChange={onChange}>
      <ChoiceGroup legend={legend}>
        {items.map((i) => (
          <Choice
            key={i.value}
            type="checkbox"
            name={name}
            value={i.value}
            title={i.title}
            desc={i.desc}
            checked={i.checked}
          />
        ))}
      </ChoiceGroup>
      <p
        className="text-label-md"
        data-checklist-count=""
        aria-live="polite"
      >{`${count} dari ${items.length} dokumen siap`}</p>
    </div>
  );
}
