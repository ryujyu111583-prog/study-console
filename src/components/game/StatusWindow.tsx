"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame } from "@/components/game/GameProvider";
import Sprite from "@/components/game/Sprite";
import { streakFrom } from "@/lib/log";
import { HERO_STEP, fmt, heroTitle, levelProgress } from "@/lib/game/levels";
import { BUDDY_LOOK } from "@/lib/game/sprites";
import { daysUntilExam } from "@/lib/game/world";

function Bar({ ratio, color }: { ratio: number; color: string }) {
  return (
    <span className="block h-2.5 overflow-hidden rounded-[2px] border-2 border-ink bg-surface2">
      <span
        className="block h-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%`, background: color }}
      />
    </span>
  );
}

/** 画面上部のステータス。ホームでは全部、ほかの画面では1行だけにして画面を広く使う。 */
export default function StatusWindow() {
  const { stats, logs, game } = useGame();
  const pathname = usePathname();
  const streak = streakFrom(logs);
  const ex = levelProgress(stats.heroXp, HERO_STEP);
  const hpColor = streak >= 7 ? "var(--ok)" : streak >= 3 ? "var(--gold)" : "var(--danger)";
  const title = game.title || heroTitle(stats.heroLevel);

  if (pathname !== "/") {
    return (
      <Link href="/" className="win font-dot flex flex-col gap-1 py-1.5 text-sm" aria-label="ステータス（ホームへ）">
        <span className="flex items-baseline justify-between gap-2">
          <span>
            勇者 <span className="text-gold">Lv{stats.heroLevel}</span>
          </span>
          <span className="tabular-nums" style={{ color: hpColor }}>
            連続{streak}日
          </span>
          <span className="text-gold tabular-nums">{fmt(stats.gold)}G</span>
          <span className="text-faint tabular-nums">魔王城 {daysUntilExam()}日</span>
        </span>
        <Bar ratio={ex.ratio} color="var(--ex)" />
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Link href="/map" className="win font-dot flex items-baseline justify-between gap-2 py-1.5">
        <span className="text-sm">魔王城（G検定 2027/1/16）まで</span>
        <span>
          あと <b className="text-xl font-normal text-gold tabular-nums">{daysUntilExam()}</b> 日
        </span>
      </Link>

      <section className="win font-dot grid grid-cols-[1fr_auto] gap-x-3" aria-label="ステータス">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="flex items-baseline justify-between">
            <span className="text-lg">勇者</span>
            <span className="text-lg text-gold">Lv {stats.heroLevel}</span>
          </p>
          <Link href="/book" className="-mt-1 text-xs text-gold">
            「{title}」
          </Link>
          <div className="grid grid-cols-[24px_1fr_auto] items-center gap-2 text-sm">
            <span>HP</span>
            <Bar ratio={streak / 30} color={hpColor} />
            <span className="min-w-[72px] text-right tabular-nums">連続 {streak}日</span>
            <span>EX</span>
            <Bar ratio={ex.ratio} color="var(--ex)" />
            <span className="min-w-[72px] text-right tabular-nums">{fmt(stats.heroXp)}</span>
            <span>G</span>
            <span className="text-xs text-faint">ATK {stats.atk} ・ DEF {stats.def}</span>
            <span className="min-w-[72px] text-right text-gold tabular-nums">{fmt(stats.gold)} G</span>
          </div>
          <p className="text-right text-xs text-faint">
            次のLvまで {fmt(ex.toNext)} ・ 今月 {fmt(stats.monthMinutes)}分
          </p>
        </div>
        <div className="flex flex-col items-center justify-end">
          <Sprite look={BUDDY_LOOK} size={44} className="bounce" label="相棒のプルン" />
          <span className="text-[10px] text-faint">プルン</span>
        </div>
      </section>
    </div>
  );
}
