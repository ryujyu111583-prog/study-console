"use client";

import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import { dayKey, shortDate } from "@/lib/date";
import { play } from "@/lib/game/sfx";
import { checkIn, checkOut } from "@/lib/game/state";
import { DONE_HEAL, FAINT_GOLD, MISS_DAMAGE } from "@/lib/game/vitality";

/** ホームの一番上：今日の G検定で HP がどうなるかと、宿屋。 */
export default function InnPanel() {
  const { game, stats, say } = useGame();
  const [busy, setBusy] = useState(false);
  const { hp, todayDone, resting, lastFaint, innDaysThisMonth } = stats.vit;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const faintedRecently = lastFaint !== null && lastFaint >= dayKey(weekAgo);

  const toggle = async () => {
    setBusy(true);
    try {
      if (resting) {
        await checkOut(game);
        play("select");
        say(["宿屋を出た。", "今日から また G検定を休むと HP が減る。"]);
      } else {
        await checkIn();
        play("coin");
        say(["宿屋に泊まった。", "出るまでの日は HP が減らず、連続日数も切れない。"]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="win flex flex-col gap-1.5 pt-4" aria-label="G検定と宿屋">
      <span className="win-label">G検定の守り</span>
      {resting ? (
        <p className="text-sm">
          <span className="text-gold">宿屋に泊まっている。</span>G検定を休んでも HP は減らない。
        </p>
      ) : todayDone ? (
        <p className="text-sm">
          <span className="text-ok">今日の G検定は済み。</span>明日の朝 HP +{DONE_HEAL}。
        </p>
      ) : (
        <p className="text-sm">
          <span className={hp <= MISS_DAMAGE * 2 ? "text-danger" : "text-gold"}>今日まだ G検定に触れていない。</span>
          このままだと明日の朝 HP −{MISS_DAMAGE}
          {hp <= MISS_DAMAGE && `、気絶して ${FAINT_GOLD}G を落とす`}。
          <Link href="/battle" className="ml-1 underline">
            クイズ1問で守れる
          </Link>
        </p>
      )}
      {faintedRecently && (
        <p className="text-xs text-danger">
          {shortDate(lastFaint)} に気絶して {FAINT_GOLD}G を落とした。
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-faint">
          減るのは G検定（ML）だけ ・ 今月の宿泊 {innDaysThisMonth}日
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => void toggle()}
          className="rounded-md border-2 border-line px-3 py-1 text-xs disabled:opacity-40"
        >
          {resting ? "宿屋を出る" : "宿屋に泊まる"}
        </button>
      </div>
    </section>
  );
}
