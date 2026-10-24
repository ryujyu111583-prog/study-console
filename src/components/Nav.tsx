"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { play } from "@/lib/game/sfx";

/** コマンド窓。選んでいる画面に ▶ が点滅する。 */
const COMMANDS = [
  { href: "/", label: "仲間", sub: "今日の記録" },
  { href: "/battle", label: "たたかう", sub: "誤答と戦闘" },
  { href: "/map", label: "地図", sub: "ボスと魔王城" },
  { href: "/skills", label: "スキル", sub: "ツリーと修行" },
  { href: "/shop", label: "装備", sub: "武器屋・防具屋" },
  { href: "/mistakes", label: "誤答台帳", sub: "モンスター図鑑" },
];

const SUB_LINKS = [
  { href: "/book", label: "冒険の書" },
  { href: "/links", label: "リンク" },
  { href: "/settings", label: "設定" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="win flex flex-col gap-1" aria-label="コマンド">
      <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
        {COMMANDS.map((c) => {
          const active = pathname === c.href;
          return (
            <Link
              key={c.href}
              href={c.href}
              aria-current={active ? "page" : undefined}
              onClick={() => play("select")}
              className="relative py-1 pl-5 focus-visible:outline-2 focus-visible:outline-gold"
            >
              {active && <span className="cursor-blink absolute top-1 left-0">▶</span>}
              <span className="block text-base leading-tight">{c.label}</span>
              <span className="block text-[11px] leading-tight text-faint">{c.sub}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-end gap-4 text-xs text-faint">
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
