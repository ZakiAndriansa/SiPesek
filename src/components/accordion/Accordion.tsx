import { Icon } from "../icon/Icon";

/**
 * items: [pertanyaan, jawaban?]. Native <details>, bisa dibuka dengan keyboard tanpa JS.
 * Item tanpa jawaban tampil sebagai baris statis.
 */
export function Accordion({
  items,
  openFirst,
  noHint,
}: {
  items: readonly (readonly [q: string, a?: string])[];
  openFirst?: boolean;
  noHint?: boolean;
}) {
  const icon = (
    <span className="accordion__icon" aria-hidden="true">
      <Icon name="plus" className="icon icon--sm accordion__plus" />
      <Icon name="minus" className="icon icon--sm accordion__minus" />
    </span>
  );
  return (
    <>
      {/* Petunjuk cukup sekali per halaman: hanya di daftar yang membuka pertanyaan pertama. */}
      {openFirst && !noHint && items.length > 1 && (
        <p className="accordion__hint">Ketuk pertanyaan untuk melihat jawabannya.</p>
      )}
      <div className="accordion">
        {items.map(([q, a], i) =>
          a ? (
            <details
              key={q}
              className="accordion__item"
              open={openFirst && i === 0 ? true : undefined}
            >
              <summary className="accordion__summary">
                {q}
                {icon}
              </summary>
              <div className="accordion__panel">
                <p>{a}</p>
              </div>
            </details>
          ) : (
            <div key={q} className="accordion__item">
              <div className="accordion__summary accordion__summary--static">
                {q}
                {icon}
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}
