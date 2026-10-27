"use client";

import Sprite from "@/components/game/Sprite";
import { MISTAKE_MONSTER } from "@/lib/game/sprites";
import { areaById } from "@/lib/game/world";
import { MISTAKE_TYPES, bucketOf, type Mistake } from "@/lib/mistakes";

/**
 * モンスター図鑑：誤りの型（＝種族）×地方で「出会った／倒した」を出す。
 * 台帳から毎回数えるので、保存するものは無い。同じ型が多くの地方に出ていれば、それが本当の弱点。
 */
export default function Bestiary({ mistakes }: { mistakes: Mistake[] }) {
  const rows = MISTAKE_TYPES.map((type) => {
    const mine = mistakes.filter((m) => m.type === type);
    // 地方ごとに：その型の誤答がすべて解消済みなら「倒した」
    const byArea = new Map<string, boolean>();
    for (const m of mine) {
      const key = m.area || "";
      byArea.set(key, (byArea.get(key) ?? true) && bucketOf(m) === "resolved");
    }
    const areas = [...byArea.entries()].map(([id, beaten]) => ({ id, beaten }));
    return { type, monster: MISTAKE_MONSTER[type], areas, beaten: areas.filter((a) => a.beaten).length };
  });

  return (
    <section className="win flex flex-col gap-2 pt-4" aria-label="モンスター図鑑">
      <span className="win-label">モンスター図鑑</span>
      <ul className="flex flex-col gap-2">
        {rows.map(({ type, monster, areas, beaten }) => {
          const met = areas.length > 0;
          return (
            <li key={type} className="grid grid-cols-[40px_1fr] items-center gap-2">
              <Sprite look={monster.look} size={40} className={met ? "" : "opacity-20 grayscale"} label={met ? monster.name : "未発見"} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="flex items-baseline justify-between gap-2 text-sm">
                  <span>{met ? monster.name : "？？？"}</span>
                  <span className="text-[11px] text-faint tabular-nums">
                    出会った {areas.length}地方 ・ 倒した <span className="text-ok">{beaten}</span>
                  </span>
                </p>
                <p className="text-[11px] text-faint">{type}</p>
                {met && (
                  <p className="flex flex-wrap gap-1">
                    {areas.map((a) => (
                      <span
                        key={a.id}
                        className={`rounded border px-1 text-[10px] ${a.beaten ? "border-ok text-ok" : "border-danger text-danger"}`}
                      >
                        {areaById(a.id)?.name ?? "地方なし"}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-faint">赤＝まだ台帳に残っている地方、緑＝その地方の分はすべて倒した。</p>
    </section>
  );
}
