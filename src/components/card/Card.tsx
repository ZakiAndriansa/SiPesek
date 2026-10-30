import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "../icon/Icon";

type Props = {
  title: string;
  /** Ikon di kotak atas, atau angka langkah. */
  icon?: string;
  num?: number;
  text?: string;
  /** Bila diisi, seluruh kartu bisa diklik lewat judul. */
  href?: string;
  id?: string;
  featured?: boolean;
  className?: string;
  meta?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
};

export function Card({
  title,
  icon,
  num,
  text,
  href,
  id,
  featured,
  className = "",
  meta,
  footer,
  children,
}: Props) {
  return (
    <article
      className={`card${href ? " card--interactive" : ""}${featured ? " card--featured" : ""} ${className}`}
      id={id}
    >
      {icon && (
        <span className="card__icon" aria-hidden="true">
          <Icon name={icon} />
        </span>
      )}
      {num && (
        <span className="card__icon" aria-hidden="true">
          <b>{num}</b>
        </span>
      )}
      <h3 className="card__title">
        {href ? (
          <Link className="card__link" href={href}>
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      {text && <p className="card__text">{text}</p>}
      {children}
      {meta && <div className="card__meta">{meta}</div>}
      {footer && <div className="card__footer">{footer}</div>}
    </article>
  );
}
