import { AnimatedNumber } from "./AnimatedNumber";

/** items: [label, nilai, sumber]. Nilai tampil di atas label (diatur CSS). */
export function Stats({
  items,
}: {
  items: readonly (readonly [label: string, value: string, source: string])[];
}) {
  return (
    <ul className="stats" data-reveal-group="">
      {items.map(([label, value, source]) => (
        <li key={label} className="stats__item">
          <span className="stats__label">{label}</span>
          <span className="stats__value">
            <AnimatedNumber value={value} />
          </span>
          <span className="stats__source">{source}</span>
        </li>
      ))}
    </ul>
  );
}
