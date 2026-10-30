"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

/** Pola WAI-ARIA tabs dengan aktivasi otomatis: panah kiri/kanan, Home, End. */
export function Tabs({
  label,
  tabs,
  panelClassName,
}: {
  label: string;
  tabs: Tab[];
  panelClassName?: string;
}) {
  const enabled = tabs.map((_, i) => i).filter((i) => !tabs[i].disabled);
  const [selected, setSelected] = useState(enabled[0]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const pos = enabled.indexOf(index);
    const target: Record<string, number> = {
      ArrowRight: enabled[(pos + 1) % enabled.length],
      ArrowLeft: enabled[(pos - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled[enabled.length - 1],
    };
    if (!(event.key in target)) return;
    event.preventDefault();
    setSelected(target[event.key]);
    refs.current[target[event.key]]?.focus();
  }

  return (
    <div className="tabs" data-tabs="">
      <div className="tabs__list" role="tablist" aria-label={label}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="tabs__tab"
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            aria-selected={selected === i}
            tabIndex={selected === i ? 0 : -1}
            disabled={t.disabled}
            onClick={() => setSelected(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.id}
          className={`tabs__panel${panelClassName ? ` ${panelClassName}` : ""}`}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          tabIndex={0}
          hidden={selected !== i}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
