import Link from "next/link";
import { Icon } from "../icon/Icon";

/** items: [teks, href]; item terakhir adalah halaman sekarang (href diabaikan). */
export function Breadcrumb({
  items,
}: {
  items: readonly (readonly [label: string, href?: string])[];
}) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {items.map(([label, href], i) =>
          i < items.length - 1 ? (
            <li key={label} className="breadcrumb__item">
              <Link className="breadcrumb__link" href={href ?? "#"}>
                {label}
              </Link>
              <Icon
                name="chevron-right"
                className="icon breadcrumb__separator"
              />
            </li>
          ) : (
            <li key={label} className="breadcrumb__item">
              <span className="breadcrumb__current" aria-current="page">
                {label}
              </span>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
