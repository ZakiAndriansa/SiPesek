"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashItem } from "@/lib/nav";
import { Icon } from "../icon/Icon";

export type DashMenu = { role: string; home: string; items: DashItem[] };

/** Menu samping dashboard; < 1024px menjadi deret tombol (diatur CSS). */
export function Sidebar({ menu }: { menu: DashMenu }) {
  const pathname = usePathname();
  return (
    <aside>
      <nav className="sidebar" aria-label={`Menu ${menu.role}`}>
        <p className="sidebar__title">{menu.role}</p>
        <ul className="sidebar__list">
          {menu.items.map(([href, label, icon]) => (
            <li key={href}>
              <Link
                className="sidebar__link"
                href={href}
                aria-current={href === pathname ? "page" : undefined}
              >
                <Icon name={icon} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
