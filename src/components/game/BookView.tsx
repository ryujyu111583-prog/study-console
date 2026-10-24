"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import { achievements } from "@/lib/game/daily";
import { heroTitle } from "@/lib/game/levels";
import { play, setSfxEnabled, sfxEnabled } from "@/lib/game/sfx";
import { setTitle } from "@/lib/game/state";

/** 冒険の書：実績と称号、効果音の設定。 */
export default function BookView() {
  const { logs, mistakes, game, stats, say } = useGame();
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(sfxEnabled()), []);

  const list = achievements(logs, mistakes, game, stats);
  const earned = list.filter((a) => a.now >= a.goal);
  const groups = [...new Set(list.map((a) => a.group))];

  const choose = async (title: string) => {
    await setTitle(title);
    play("select");
    say(title ? `勇者は「${title}」を名乗ることにした。` : "称号をレベルに合わせた。");
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="win flex flex-col gap-2 pt-4" aria-label="称号">
        <span className="win-label">
          称号 <span className="text-gold">{earned.length}/{list.length}</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => void choose("")}
            className={`rounded-md border-2 px-2 py-0.5 text-xs ${game.title === "" ? "border-gold text-gold" : "border-line"}`}
          >
            {heroTitle(stats.heroLevel)}（Lv）
          </button>
          {earned.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => void choose(a.title)}
              className={`rounded-md border-2 px-2 py-0.5 text-xs ${game.title === a.title ? "border-gold text-gold" : "border-line"}`}
            >
              {a.title}
            </button>
          ))}
        </div>
        <p className="text-xs text-faint">実績を達成すると称号が増える。選んだ称号はホームに出る。</p>
      </section>

      {groups.map((g) => (
        <section key={g} className="win flex flex-col gap-1.5 pt-4" aria-label={g}>
          <span className="win-label">{g}</span>
          {list
            .filter((a) => a.group === g)
            .map((a) => {
              const done = a.now >= a.goal;
              return (
                <div key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3">
                  <span className={done ? "text-gold" : ""}>
                    {done ? "★ " : "☆ "}
                    {a.label}
                  </span>
                  <span className="text-xs text-faint tabular-nums">
                    {Math.min(a.now, a.goal)}/{a.goal}
                  </span>
                  <span className="col-span-2 block h-1.5 border border-line bg-surface2">
                    <span
                      className="block h-full"
                      style={{ width: `${Math.min(1, a.now / a.goal) * 100}%`, background: done ? "var(--gold)" : "var(--ex)" }}
                    />
                  </span>
                </div>
              );
            })}
        </section>
      ))}

      <section className="win flex items-center justify-between pt-4" aria-label="設定">
        <span className="win-label">設定</span>
        <span>効果音</span>
        <button
          type="button"
          onClick={() => {
            const on = !sound;
            setSfxEnabled(on);
            setSound(on);
            if (on) play("coin");
          }}
          className="rounded-md border-2 border-ink px-4 py-1"
          aria-pressed={sound}
        >
          {sound ? "♪ ON" : "OFF"}
        </button>
      </section>
    </div>
  );
}
