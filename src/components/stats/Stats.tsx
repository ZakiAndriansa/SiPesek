/** items: [label, nilai, sumber]. Nilai tampil di atas label (diatur CSS). */
export function Stats({
  items,
}: {
  items: readonly (readonly [label: string, value: string, source: string])[];
}) {
  return (
    <ul className="stats">
      {items.map(([label, value, source]) => (
        <li key={label} className="stats__item">
          <span className="stats__label">{label}</span>
          <span className="stats__value">{value}</span>
          <span className="stats__source">{source}</span>
        </li>
      ))}
    </ul>
  );
}
