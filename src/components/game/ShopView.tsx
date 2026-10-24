"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import { fmt } from "@/lib/game/levels";
import { ITEMS, SLOT_LABEL, itemById, type Item, type Slot } from "@/lib/game/items";
import { play } from "@/lib/game/sfx";
import { buyItem, equipItem } from "@/lib/game/state";

const SLOTS: Slot[] = ["weapon", "armor", "charm"];

export default function ShopView() {
  const { game, stats, say } = useGame();
  const [slot, setSlot] = useState<Slot>("weapon");
  const [pending, setPending] = useState<string | null>(null);

  const buy = async (item: Item) => {
    if (stats.gold < item.price) {
      say(["店主「ゴールドが足りないようだね。」", `あと ${fmt(item.price - stats.gold)}G。修行で稼いでおいで。`]);
      return;
    }
    setPending(null);
    await buyItem(item);
    play("coin");
    say([`${item.name}を買った！`, `勇者は ${item.name}を装備した。`]);
  };

  const equip = async (item: Item) => {
    const isOn = game.equip[item.slot] === item.id;
    await equipItem(item.slot, isOn ? null : item.id);
    say(isOn ? `${item.name}を外した。` : `勇者は ${item.name}を装備した。`);
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="win pt-4 text-sm" aria-label="装備">
        <span className="win-label">そうび</span>
        <dl className="grid grid-cols-[56px_1fr] gap-y-0.5">
          {SLOTS.map((s) => (
            <div key={s} className="contents">
              <dt className="text-faint">{SLOT_LABEL[s]}</dt>
              <dd>{itemById(game.equip[s])?.name ?? "なし"}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1 text-xs text-faint">
          ATK {stats.atk} ・ DEF {stats.def} ・ 所持金 <span className="text-gold">{fmt(stats.gold)}G</span>
        </p>
      </section>

      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="店">
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={s === slot}
            onClick={() => setSlot(s)}
            className={`rounded-md border-2 py-1.5 text-sm ${s === slot ? "border-ink" : "border-line text-faint"}`}
          >
            {SLOT_LABEL[s]}
          </button>
        ))}
      </div>

      <section className="win flex flex-col pt-4" aria-label={`${SLOT_LABEL[slot]}の店`}>
        <span className="win-label">{slot === "weapon" ? "武器屋" : slot === "armor" ? "防具屋" : "道具屋"}</span>
        {ITEMS.filter((i) => i.slot === slot).map((item, idx) => {
          const owned = game.owned.includes(item.id);
          const on = game.equip[item.slot] === item.id;
          return (
            <article key={item.id} className={`flex flex-col gap-1 py-2 ${idx > 0 ? "border-t border-line" : ""}`}>
              <p className="flex items-baseline justify-between gap-2">
                <span className={on ? "text-gold" : ""}>
                  {on && "E "}
                  {item.name}
                </span>
                <span className="text-sm text-gold tabular-nums">{owned ? "所持" : `${fmt(item.price)}G`}</span>
              </p>
              <p className="text-xs text-faint">
                {item.atk ? `ATK+${item.atk} ・ ` : ""}
                {item.def ? `DEF+${item.def} ・ ` : ""}
                {item.note}
              </p>
              {owned ? (
                <button type="button" onClick={() => void equip(item)} className="self-start rounded-md border-2 border-line px-3 py-0.5 text-xs">
                  {on ? "外す" : "装備する"}
                </button>
              ) : pending === item.id ? (
                <div className="flex gap-2 text-xs">
                  <span className="self-center">{fmt(item.price)}Gで 買いますか？</span>
                  <button type="button" onClick={() => void buy(item)} className="rounded-md border-2 border-ink px-3 py-0.5">
                    はい
                  </button>
                  <button type="button" onClick={() => setPending(null)} className="rounded-md border-2 border-line px-3 py-0.5">
                    いいえ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPending(item.id)}
                  className={`self-start rounded-md border-2 px-3 py-0.5 text-xs ${stats.gold >= item.price ? "border-ink" : "border-line text-faint"}`}
                >
                  買う
                </button>
              )}
            </article>
          );
        })}
      </section>
      <p className="text-center text-xs text-faint">装備の強さはボス戦の演出だけ。撃破の判定は演習の正答数で決まる。</p>
    </div>
  );
}
