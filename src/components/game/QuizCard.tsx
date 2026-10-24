"use client";

import { useState } from "react";
import NoteLink from "@/components/game/NoteLink";
import type { Question } from "@/lib/game/quiz";

/** 4択1問。選んだら正誤と解説、根拠のノートを出す。 */
export default function QuizCard({
  question,
  onAnswer,
  children,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
  /** 答えた後に出す追加の操作（次へ・台帳に登録など） */
  children?: React.ReactNode;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;

  const pick = (i: number) => {
    if (done) return;
    setPicked(i);
    onAnswer(i === question.answer);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[15px] leading-relaxed">{question.q}</p>
      <ol className="flex flex-col gap-1.5">
        {question.choices.map((c, i) => {
          const isAnswer = i === question.answer;
          const style = !done
            ? "border-line hover:border-ink"
            : isAnswer
              ? "border-ok text-ok"
              : i === picked
                ? "border-danger text-danger"
                : "border-line text-faint";
          return (
            <li key={i}>
              <button
                type="button"
                disabled={done}
                onClick={() => pick(i)}
                className={`flex w-full items-start gap-2 rounded-md border-2 px-2.5 py-1.5 text-left text-sm leading-snug ${style}`}
              >
                <span className="font-dot shrink-0">{"ABCD"[i]}</span>
                <span>{c}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {done && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2">
          <p className={`font-dot ${picked === question.answer ? "text-ok" : "text-danger"}`}>
            {picked === question.answer ? "せいかい！" : `ざんねん… 正解は ${"ABCD"[question.answer]}`}
          </p>
          <p className="text-sm leading-relaxed text-muted">{question.explain}</p>
          <NoteLink path={question.note} label={`ノートで確かめる：${question.note.split("/").pop()}`} />
          {children}
        </div>
      )}
    </div>
  );
}
