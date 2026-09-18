"use client";

import { useState } from "react";
import { LINK_GROUPS } from "@/lib/links";

export default function LinksView() {
  const [active, setActive] = useState(LINK_GROUPS[0].id);
  const group = LINK_GROUPS.find((g) => g.id === active) ?? LINK_GROUPS[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="tablist">
        {LINK_GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === active}
            onClick={() => setActive(g.id)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium ${
              g.id === active
                ? "border-linestrong bg-surface2 text-ink"
                : "border-line bg-surface text-muted"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {group.items.map((item, i) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-3 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-faint">{item.host}</span>
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted">{item.note}</span>
          </a>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-faint">
        毎日15分のシャドーイングは 6 Minute English だけを週1本固定で使う。TEDやCNN 10 は、ながら枠と週末用。
        触れる量を増やす枠と、同じ素材を削る枠は分けて管理する。
      </p>
    </div>
  );
}
