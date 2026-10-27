"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import MissRegister from "@/components/game/MissRegister";
import QuizCard from "@/components/game/QuizCard";
import { fmt } from "@/lib/game/levels";
import { eventMultiplier } from "@/lib/game/magic";
import { pickQuestions, type Question } from "@/lib/game/quiz";
import { play } from "@/lib/game/sfx";
import { answerQuiz, recordBoss } from "@/lib/game/state";
import type { Area } from "@/lib/game/world";
import { lastBeforeToday, neglectOf } from "@/lib/game/vitality";

/** ボス戦：その地方の問題を10問。正答数がそのまま結果になる。 */
export default function BossRun({ area, onExit }: { area: Area; onExit: () => void }) {
  const { game, stats, say } = useGame();
  const [questions] = useState<Question[]>(() => pickQuestions(area.id, area.questions));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState<Question[]>([]);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const q = questions[index];
  // 放置ボーナスは挑んだ時点の値で固定する（1問目で「触れた日」が今日になっても、その日のうちは続く）
  // 週のイベントも掛ける
  const [mult] = useState(
    () =>
      (area.track === "ml" ? neglectOf(lastBeforeToday(game.areaTouch[area.id])).multiplier : 1) *
      eventMultiplier(area.track),
  );

  const onAnswer = (correct: boolean) => {
    setAnswered(true);
    void answerQuiz(game, area.id, area.track, correct, mult);
    if (correct) {
      setScore((s) => s + 1);
      play("hit");
      say(`勇者の攻撃！ ${area.boss}に ${10 + Math.floor(stats.atk / 5)} のダメージ！`);
    } else {
      setMisses((m) => [...m, q]);
      play("miss");
      say(`${area.boss}の攻撃！ 勇者は ひるんだ…`);
    }
  };

  const next = async () => {
    setAnswered(false);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      return;
    }
    setFinished(true);
    const result = await recordBoss(game, area, score);
    if (result.firstClear) {
      play("levelUp");
      say([`${area.boss}を たおした！（${score}/${questions.length}）`, `${fmt(area.xp)} の経験値と ${fmt(area.gold)}G を獲得！`]);
    } else if (result.cleared) {
      play("defeat");
      say([`${area.boss}を 再び たおした！（${score}/${questions.length}）`, "報酬は初回だけ。最高記録を記録した。"]);
    } else {
      play("miss");
      say([`${area.boss}は まだ倒れない…（${score}/${questions.length}）`, `合格ラインは ${area.pass}問。間違えた問題を台帳に入れて出直そう。`]);
    }
  };

  if (finished) {
    const cleared = score >= area.pass;
    return (
      <div className="flex flex-col gap-2">
        <p className={`font-dot text-lg ${cleared ? "text-gold" : "text-danger"}`}>
          {cleared ? "VICTORY!" : "撤退…"} {score}/{questions.length}
        </p>
        {misses.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-faint">間違えた問題（台帳に入れると、たたかうの「台帳」で再戦できる）</p>
            {misses.map((m) => (
              <div key={m.id} className="flex flex-col gap-1 border-t border-line pt-2">
                <p className="text-sm">{m.q}</p>
                <p className="text-xs text-ok">正解：{m.choices[m.answer]}</p>
                <MissRegister question={m} area={area.id} />
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={onExit} className="font-dot self-end rounded-md border-2 border-ink px-4 py-1">
          地図へもどる
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-faint">
        <span>
          {index + 1}/{questions.length} 問目 ・ 合格 {area.pass}問
        </span>
        <span className="flex gap-0.5" aria-label={`正解 ${score}`}>
          {questions.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 ${i < index + (answered ? 1 : 0) ? (misses.some((m) => m.id === questions[i].id) ? "bg-danger" : "bg-ok") : "bg-line"}`}
            />
          ))}
        </span>
      </div>
      <QuizCard key={q.id} question={q} onAnswer={onAnswer}>
        <button type="button" onClick={() => void next()} className="font-dot self-end rounded-md border-2 border-ink px-4 py-1">
          {index + 1 < questions.length ? "つぎ ▶" : "結果を見る ▶"}
        </button>
      </QuizCard>
      {index === 0 && !answered && (
        <button type="button" onClick={onExit} className="self-start text-xs text-faint">
          やめる
        </button>
      )}
    </div>
  );
}
