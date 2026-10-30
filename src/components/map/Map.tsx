import type { CSSProperties } from "react";
import { Badge } from "../badge/Badge";
import { Icon } from "../icon/Icon";

// Peta placeholder statis. Posisi lewat custom property --x --y (pin/zona) dan --w --h (zona/jalan), dalam persen.
const pos = (vars: Record<string, string | number>) =>
  Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [`--${k}`, `${v}%`]),
  ) as CSSProperties;

const ROADS = [
  [0, 40, 100, 7],
  [0, 78, 100, 5],
  [28, 0, 6, 100],
  [70, 0, 6, 100],
];
export const Roads = () => (
  <>
    {ROADS.map(([x, y, w, h]) => (
      <span
        key={`${x}-${y}`}
        className="map__road"
        style={pos({ x, y, w, h })}
        aria-hidden="true"
      />
    ))}
  </>
);

const PIN_ICON: Record<string, string> = {
  aman: "check",
  bersaing: "scale",
  berisiko: "alert",
};
const LABEL: Record<string, string> = {
  aman: "Peluang besar",
  bersaing: "Masih mungkin",
  berisiko: "Peluang kecil",
};

type Pin = {
  x: number;
  y: number;
  kind: "aman" | "bersaing" | "berisiko";
  name: string;
};

/** Pin sekolah (ikon status + warna, target sentuh 48px) dan penanda rumah. */
export function MapSchools({
  pins,
  home,
  label,
}: {
  pins: Pin[];
  home: [number, number];
  label: string;
}) {
  return (
    <div className="map" role="group" aria-label={label}>
      <Roads />
      {pins.map((p) => (
        <button
          key={p.name}
          className={`map__pin map__pin--${p.kind}`}
          type="button"
          style={pos({ x: p.x, y: p.y })}
          aria-label={`${p.name}, ${LABEL[p.kind]}`}
        >
          <Icon name={PIN_ICON[p.kind]} />
        </button>
      ))}
      <span className="map__home" style={pos({ x: home[0], y: home[1] })}>
        <Icon name="home" className="icon icon--sm" />
        Rumah
      </span>
    </div>
  );
}

type Zone = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "cukup" | "terbatas" | "kurang" | "blank";
  name: string;
  value: string;
};

const ZONE_ICON: Record<Zone["kind"], string> = {
  cukup: "check",
  terbatas: "scale",
  kurang: "alert",
  blank: "alert",
};
/** Peta zona wilayah (koroplet): nama dan nilai selalu tertulis. */
export function MapZones({ zones, label }: { zones: Zone[]; label: string }) {
  return (
    <div className="map map--square map--zones" role="img" aria-label={label}>
      {zones.map((z) => (
        <div
          key={z.name}
          className={`map__zone map__zone--${z.kind}`}
          style={pos({ x: z.x, y: z.y, w: z.w, h: z.h })}
        >
          <strong>{z.name}</strong>
          <span className="map__zone-value">
            <Icon name={ZONE_ICON[z.kind]} className="icon icon--sm" />
            {z.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MapLegend({ zones }: { zones?: boolean }) {
  return zones ? (
    <ul className="map-legend" aria-label="Arti warna">
      <li>
        <Badge kind="aman">Cukup</Badge>
      </li>
      <li>
        <Badge kind="bersaing">Terbatas</Badge>
      </li>
      <li>
        <Badge kind="berisiko">Kurang</Badge>
      </li>
    </ul>
  ) : (
    <ul className="map-legend" aria-label="Arti warna dan ikon pin">
      <li>
        <Badge kind="aman" />
      </li>
      <li>
        <Badge kind="bersaing" />
      </li>
      <li>
        <Badge kind="berisiko" />
      </li>
    </ul>
  );
}
