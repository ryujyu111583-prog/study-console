"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "今日" },
  { href: "/plan", label: "計画" },
  { href: "/mistakes", label: "誤答" },
  { href: "/links", label: "リンク" },
  { href: "/settings", label: "設定" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-5 gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-2 py-2 text-center text-xs font-medium ${
              active
                ? "bg-ink text-bg"
                : "bg-surface text-muted border border-line"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
