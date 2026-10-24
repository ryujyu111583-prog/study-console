"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import type { Question } from "@/lib/game/quiz";
import { monsterFor } from "@/lib/game/sprites";
import { MISTAKE_TYPES, addMistake } from "@/lib/mistakes";

/**
 * 間違えた問題を誤答台帳に入れる。誤りの型を選ぶのが台帳の約束なので、型の5択を出す。
 * 同じ問題がすでに台帳にあれば、登録ではなく案内だけ出す。
 */
export default function MissRegister({ question, area }: { question: Question; area: string }) {
  const { mistakes, say } = useGame();
  const [saved, setSaved] = useState<string | null>(null);
  const already = mistakes.some((m) => m.qid === question.id);

  if (saved || already) {
    return (
      <p className="text-xs text-faint">
        {saved ? `${monsterFor(saved).name}として台帳に登録した。` : "この問題は台帳に登録済み。たたかうの「台帳」で再戦できる。"}
      </p>
    );
  }

  const save = async (type: string) => {
    await addMistake({
      concept: question.q,
      type,
      correct: `${question.choices[question.answer]}。${question.explain}`,
      week: "",
      area,
      qid: question.id,
    });
    setSaved(type);
    say([`${monsterFor(type).name}を 図鑑に登録した。`, "同じ問題で 3回連続正解すると倒せる。"]);
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-faint">なぜ間違えた？ 型を選んで台帳へ</p>
      <div className="flex flex-wrap gap-1">
        {MISTAKE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => void save(t)}
            className="rounded-md border border-line px-2 py-0.5 text-[11px] hover:border-ink"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
