import { Icon } from "../icon/Icon";

/** Mobile: Sebelumnya / "Halaman x dari y" / Berikutnya. >= 600px: nomor halaman (diatur CSS). */
export function Pagination({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  return (
    <nav className="pagination" aria-label={label}>
      <ul className="pagination__list">
        <li>
          {current > 1 ? (
            <a className="pagination__link" href="#" rel="prev">
              <Icon name="chevron-left" className="icon icon--sm" />
              Sebelumnya
            </a>
          ) : (
            <a className="pagination__link" aria-disabled="true">
              <Icon name="chevron-left" className="icon icon--sm" />
              Sebelumnya
            </a>
          )}
        </li>
        {Array.from({ length: total }, (_, i) => (
          <li key={i}>
            <a
              className="pagination__link pagination__page"
              href="#"
              aria-current={i + 1 === current ? "page" : undefined}
            >
              {i + 1}
            </a>
          </li>
        ))}
        <li className="pagination__status">{`Halaman ${current} dari ${total}`}</li>
        <li>
          {current < total ? (
            <a className="pagination__link" href="#" rel="next">
              Berikutnya
              <Icon name="chevron-right" className="icon icon--sm" />
            </a>
          ) : (
            <a className="pagination__link" aria-disabled="true">
              Berikutnya
              <Icon name="chevron-right" className="icon icon--sm" />
            </a>
          )}
        </li>
      </ul>
    </nav>
  );
}
