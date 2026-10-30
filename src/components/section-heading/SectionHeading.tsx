import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  desc?: string;
  center?: boolean;
  action?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  desc,
  center,
  action,
}: Props) {
  return (
    <div
      className={`section-heading${center ? " section-heading--center" : ""}${action ? " section-heading--split" : ""}`}
    >
      <div>
        {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
        <h2 className="section-heading__title">{title}</h2>
        {desc && <p className="section-heading__desc">{desc}</p>}
      </div>
      {action && <div className="section-heading__action">{action}</div>}
    </div>
  );
}
