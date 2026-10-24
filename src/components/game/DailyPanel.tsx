"use client";

import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import { dayKey } from "@/lib/date";
import { DAILY_BONUS_GOLD, chestReward, dailyQuests } from "@/lib/game/daily";
import { play } from "@/lib/game/sfx";
import { claimDailyBonus, openChest } from "@/lib/game/state";
import { streakFrom } from "@/lib/log";

/** ホームの一番上：今日やること（デイリークエスト）と宝箱。 */
export default function DailyPanel() {
  const { logs, game, say } = useGame();
  const [busy, setBusy] = useState(false);
  const today = dayKey();
  const quests = dailyQuests(logs, game, today);
  const doneCount = quests.filter((q) => q.done).length;
  const allDone = doneCount === quests.length;
  const claimed = game.daily.bonus === today;
  const chestOpened = game.daily.chest === today;
  const next = quests.find((q) => !q.done);

  const chest = async () => {
    setBusy(true);
    try {
      const { gold, rare } = chestReward(streakFrom(logs), today);
      await openChest(gold);
      play("chest");
      say(
        rare
          ? ["宝箱を開けた！", `なんと 黄金の袋だ！ ${gold}G を手に入れた！`]
          : ["宝箱を開けた！", `${gold}G を手に入れた！（連続日数が長いほど増える）`],
      );
    } finally {
      setBusy(false);
    }
  };

  const claim = async () => {
    setBusy(true);
    try {
      await claimDailyBonus(DAILY_BONUS_GOLD);
      play("coin");
      say(["今日のクエストを すべて達成した！", `デイリーボーナス ${DAILY_BONUS_GOLD}G を受け取った！`]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="win flex flex-col gap-2 pt-4" aria-label="今日のクエスト">
      <span className="win-label">
        今日のクエスト <span className="text-gold">{doneCount}/{quests.length}</span>
      </span>
      <ul className="flex flex-col gap-1">
        {quests.map((q) => (
          <li key={q.id}>
            <Link href={q.href} className="flex items-baseline gap-2">
              <span className={q.done ? "text-ok" : "text-faint"}>{q.done ? "■" : "□"}</span>
              <span className={q.done ? "text-faint line-through" : ""}>{q.label}</span>
              <span className="ml-auto text-[11px] text-faint">{q.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy || chestOpened}
          onClick={() => void chest()}
          className="rounded-md border-2 border-gold py-1.5 text-sm text-gold disabled:border-line disabled:text-faint"
        >
          {chestOpened ? "宝箱は また明日" : "▣ 宝箱を開ける"}
        </button>
        <button
          type="button"
          disabled={busy || !allDone || claimed}
          onClick={() => void claim()}
          className="rounded-md border-2 border-ink py-1.5 text-sm disabled:border-line disabled:text-faint"
        >
          {claimed ? "ボーナス受取済み" : allDone ? `ボーナス ${DAILY_BONUS_GOLD}G` : "3つ達成でボーナス"}
        </button>
      </div>
      {next && (
        <p className="text-xs text-faint">
          つぎ：<Link href={next.href} className="text-ink underline">{next.label}</Link>
        </p>
      )}
    </section>
  );
}
