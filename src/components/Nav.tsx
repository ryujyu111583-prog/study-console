"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { play } from "@/lib/game/sfx";

/** コマンド窓。4列×2段に詰め、選んでいる画面に ▶ が点滅する。 */
const COMMANDS = [
  { href: "/", label: "仲間" },
  { href: "/battle", label: "たたかう" },
  { href: "/cards", label: "カード" },
  { href: "/map", label: "地図" },
  { href: "/guild", label: "ギルド" },
  { href: "/skills", label: "スキル" },
  { href: "/shop", label: "装備" },
  { href: "/mistakes", label: "図鑑" },
];

const SUB_LINKS = [
  { href: "/book", label: "冒険の書" },
  { href: "/links", label: "リンク" },
  { href: "/settings", label: "設定" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="win flex flex-col gap-0.5 py-1.5" aria-label="コマンド">
      <div className="grid grid-cols-4 gap-x-1">
        {COMMANDS.map((c) => {
          const active = pathname === c.href;
          return (
            <Link
              key={c.href}
              href={c.href}
              aria-current={active ? "page" : undefined}
              onClick={() => play("select")}
              className="font-dot relative py-1 pl-3.5 text-sm focus-visible:outline-2 focus-visible:outline-gold"
            >
              {active && <span className="cursor-blink absolute top-1 left-0 text-xs">▶</span>}
              {c.label}
            </Link>
          );
        })}
      </div>
      <div className="flex justify-end gap-4 text-[11px] text-faint">
        {SUB_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={pathname === l.href ? "page" : undefined}
            className={pathname === l.href ? "text-ink" : ""}
          >
            {pathname === l.href ? "▶ " : ""}
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
