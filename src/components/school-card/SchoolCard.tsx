import type { ReactNode } from "react";
import { Badge } from "../badge/Badge";
import { Icon } from "../icon/Icon";

type Props = {
  name: string;
  type?: string;
  kec: string;
  jalur?: string;
  /** Label peluang (aman | bersaing | berisiko) atau jenis badge lain dengan `badgeText`. */
  kind?: string;
  badgeText?: string;
  range?: string;
  facts: readonly (readonly [label: string, value: string])[];
  reason: string;
  /** Tombol aksi. */
  children: ReactNode;
};

export function SchoolCard({
  name,
  type = "SMA · Negeri",
  kec,
  jalur,
  kind,
  badgeText,
  range,
  facts,
  reason,
  children,
}: Props) {
  return (
    <article className="school-card">
      <div className="school-card__header">
        <h3 className="school-card__name">
          {name}
          <span className="school-card__type">{type}</span>
        </h3>
        <span className="school-card__badge">
          {kind && <Badge kind={kind}>{badgeText}</Badge>}
        </span>
      </div>
      <ul className="school-card__meta">
        <li className="school-card__meta-item">
          <Icon name="map-pin" className="icon icon--sm" />
          {kec}
        </li>
        {jalur && (
          <li className="school-card__meta-item">
            <Icon name="clipboard" className="icon icon--sm" />
            {jalur}
          </li>
        )}
      </ul>
      {range && <p className="text-label-md">{`Peluang sekitar ${range}`}</p>}
      <dl className="school-card__facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="school-card__fact-label">{label}</dt>
            <dd className="school-card__fact-value">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="school-card__reason">{reason}</p>
      <div className="button-group school-card__action">{children}</div>
    </article>
  );
}
