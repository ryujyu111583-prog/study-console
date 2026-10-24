"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import { achievements } from "@/lib/game/daily";
import { REWARD, heroTitle } from "@/lib/game/levels";
import { reportLine } from "@/lib/game/reportText";
import { play, setSfxEnabled, sfxEnabled } from "@/lib/game/sfx";
import { setTitle } from "@/lib/game/state";

/** 冒険の書：実績と称号、効果音の設定。 */
export default function BookView() {
  const { logs, mistakes, game, stats, reports, say } = useGame();
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

      <section className="win flex flex-col gap-1 pt-4" aria-label="Claude からの報告">
        <span className="win-label">Claude からの報告</span>
        {reports.length === 0 ? (
          <p className="text-xs text-faint">
            まだ報告はない。ギルドの依頼を終えたら、結果のスクショを Claude Code に渡して「Study Quest に報告して」と言う。
          </p>
        ) : (
          reports.slice(0, 20).map((r) => (
            <p key={r.id} className="grid grid-cols-[44px_1fr] gap-2 text-xs">
              <span className="text-faint tabular-nums">{r.at.slice(5, 10).replace("-", "/")}</span>
              <span>{reportLine(r)}</span>
            </p>
          ))
        )}
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

      <section className="win pt-4 text-sm" aria-label="経験値の決まり">
        <span className="win-label">経験値とゴールドの決まり</span>
        <dl className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-0.5">
          {[
            ["記録 フル", `+${REWARD.fullXp}`, `+${REWARD.fullGold}G`],
            ["記録 最低ライン", `+${REWARD.minXp}`, `+${REWARD.minGold}G`],
            ["修行（タイマー）1分", `+${REWARD.minuteXp}`, `+${REWARD.minuteGold}G`],
            ["クイズ 1問正解", `+${REWARD.quizXp}`, `+${REWARD.quizGold}G`],
            ["暗記カード 1枚（1日30枚まで）", `+${REWARD.cardXp}`, ""],
            ["台帳のモンスターに正解", `+${REWARD.hitXp}`, ""],
            ["モンスター撃破（3連続正答）", `+${REWARD.defeatXp}`, `+${REWARD.defeatGold}G`],
            ["特技を唱えて言えた（1日1回）", `+${REWARD.skillXp}`, ""],
          ].map(([what, xp, gold]) => (
            <div key={what} className="contents">
              <dt>{what}</dt>
              <dd className="text-right text-gold tabular-nums">{xp}</dd>
              <dd className="text-right text-gold tabular-nums">{gold}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-faint">記録は過去の分もさかのぼって経験値になる。ボスは地図から。</p>
      </section>

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
