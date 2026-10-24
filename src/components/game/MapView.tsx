"use client";

import { useMemo, useState } from "react";
import BossRun from "@/components/game/BossRun";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import Sprite from "@/components/game/Sprite";
import WorldMap from "@/components/game/WorldMap";
import { fmt } from "@/lib/game/levels";
import { noteFor } from "@/lib/game/obsidian";
import { buildWorld } from "@/lib/game/overworld";
import { hasQuiz } from "@/lib/game/quiz";
import { play } from "@/lib/game/sfx";
import { recordBoss } from "@/lib/game/state";
import { AREAS, G_ROAD, areaById, daysUntilExam, type Area } from "@/lib/game/world";
import { TRACK_LABEL, type Track } from "@/lib/tracks";

const noteLabel = (id: string) => noteFor(id)?.split("/").pop() ?? "";

const TRACK_COLOR: Record<Track, string> = {
  stat: "var(--stat)",
  inv: "var(--inv)",
  ml: "var(--ml)",
  en: "var(--en)",
};

export default function MapView() {
  const { game, mistakes, stats, say } = useGame();
  const [selected, setSelected] = useState<string>(
    () => G_ROAD.find((id) => !game.bosses[id]?.clearedAt) ?? "g1",
  );
  const [score, setScore] = useState(7);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const area = areaById(selected) ?? AREAS[0];
  const record = game.bosses[area.id];
  const monsters = mistakes.filter((m) => m.area === area.id).length;
  const cleared = AREAS.filter((a) => game.bosses[a.id]?.clearedAt).length;
  const heroAt = G_ROAD.find((id) => !game.bosses[id]?.clearedAt) ?? AREAS.find((a) => !game.bosses[a.id]?.clearedAt)?.id ?? "maou";
  const revealed = !!game.bosses.maou?.clearedAt;
  const knownShare = useMemo(() => buildWorld().knownShare, []);

  const pick = (a: Area) => {
    if (running) return;
    setSelected(a.id);
    setScore(a.pass);
    say([`${a.name}（${a.topic}）`, `ボス：${a.boss}`, a.howTo]);
  };

  const challenge = async () => {
    setBusy(true);
    try {
      const unit = area.questions === 100 ? "%" : `/${area.questions}`;
      const damage = score * (10 + Math.floor(stats.atk / 5));
      const result = await recordBoss(game, area, score);
      play(result.cleared ? "defeat" : "miss");
      if (result.firstClear) {
        say([
          `勇者の攻撃！ ${area.boss}に ${fmt(damage)} のダメージ！（${score}${unit}）`,
          `${area.boss}を たおした！`,
          `${fmt(area.xp)} の経験値と ${fmt(area.gold)}G を獲得！`,
        ]);
      } else if (result.cleared) {
        say([`${area.boss}を 再び たおした！（${score}${unit}）`, "報酬は初回だけ。最高記録を更新した。"]);
      } else {
        say([
          `${area.boss}に ${fmt(damage)} のダメージ！（${score}${unit}）`,
          `しかし ${area.boss}は まだ倒れない。合格ラインは ${area.pass}${unit}。`,
          "間違えた問題を誤答台帳に入れて、また挑もう。",
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="win p-1.5" aria-label="世界地図">
        <WorldMap
          areas={AREAS}
          cleared={(id) => !!game.bosses[id]?.clearedAt}
          selected={selected}
          heroAt={heroAt}
          revealed={revealed}
          onPick={pick}
          onFrontier={(f) =>
            say(
              revealed
                ? [`${f.name}`, `うわさ：${f.rumor}。`, "霧は薄れた。だが、まだ道は無い。"]
                : ["？？？", "濃い霧で、なにも見えない。", "魔王ディープを倒すまで、境界の海は越えられない。"],
            )
          }
        />
        <p className="px-1 pt-1.5 text-xs text-faint">
          制覇 {cleared}/{AREAS.length} ・ 魔王城まで あと {daysUntilExam()} 日
        </p>
        <p className="px-1 text-xs text-faint">
          人間界は 世界の陸地の <span className="text-gold">{Math.round(knownShare * 100)}%</span>。残りは まだ誰も知らない。
        </p>
      </section>

      <section className="win flex flex-col gap-2 pt-4" aria-label={`${area.name}のボス`}>
        <span className="win-label" style={{ color: TRACK_COLOR[area.track] }}>
          {area.name}
        </span>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Sprite look={area.look} size={area.id === "maou" ? 96 : 72} className="bounce" label={area.boss} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-base">{area.boss}</p>
            <p className="text-xs text-faint">
              {TRACK_LABEL[area.track]} ・ {area.topic}
            </p>
            <p className="text-xs">
              {record?.clearedAt ? (
                <span className="text-gold">★ 撃破 {record.clearedAt}</span>
              ) : (
                <span className="text-faint">未撃破</span>
              )}
              {record && <span className="ml-2 text-faint">最高 {record.best}{area.questions === 100 ? "%" : `/${area.questions}`}</span>}
            </p>
            <p className="text-xs text-faint">
              この地のモンスター {monsters}匹 ・ 初回報酬 {fmt(area.xp)}EX / {fmt(area.gold)}G
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">
          {hasQuiz(area.id) ? `この地方の問題を${area.questions}問。${area.pass}問以上で撃破。` : area.howTo}
        </p>
        <NoteLink id={area.id} label={`予習：${noteLabel(area.id)}`} />
        {running ? (
          <BossRun area={area} onExit={() => setRunning(false)} />
        ) : hasQuiz(area.id) ? (
          <button
            type="button"
            onClick={() => {
              setRunning(true);
              play("select");
              say([`${area.boss}が 立ちはだかった！`, `${area.questions}問中 ${area.pass}問 正解で撃破。`]);
            }}
            className="font-dot rounded-md border-2 border-ink py-2 text-base"
          >
            {area.boss}に挑む（{area.questions}問）
          </button>
        ) : (
          <>
        <div className="flex items-center gap-2">
          <span className="text-sm">結果</span>
          <button type="button" onClick={() => setScore((s) => Math.max(0, s - 1))} className="h-9 w-9 rounded-md border-2 border-ink" aria-label="1減らす">
            −
          </button>
          <input
            id="boss-score"
            type="number"
            inputMode="numeric"
            min={0}
            max={area.questions}
            value={score}
            onChange={(e) => setScore(Math.max(0, Math.min(area.questions, Number(e.target.value) || 0)))}
            className="h-9 w-16 rounded-md border-2 border-ink bg-surface2 text-center text-lg tabular-nums"
          />
          <button type="button" onClick={() => setScore((s) => Math.min(area.questions, s + 1))} className="h-9 w-9 rounded-md border-2 border-ink" aria-label="1増やす">
            ＋
          </button>
          <span className="text-sm text-faint">{area.questions === 100 ? "%" : `/ ${area.questions}`}</span>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void challenge()}
          className="rounded-md border-2 border-ink py-2 text-base disabled:opacity-40"
        >
          {area.boss}に挑む
        </button>
          </>
        )}
      </section>
    </div>
  );
}
