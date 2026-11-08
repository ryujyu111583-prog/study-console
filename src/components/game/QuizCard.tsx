"use client";

import { useState } from "react";
import FormulaDetail from "@/components/game/FormulaDetail";
import NoteLink from "@/components/game/NoteLink";
import SectionFigure from "@/components/game/SectionFigure";
import type { Question } from "@/lib/game/quiz";
import { visualFor } from "@/lib/game/visuals";
import { labFor } from "@/lib/game/sectionLab";
import Link from "next/link";

/** 4択1問。選んだら正誤と解説、根拠のノートを出す。 */
export default function QuizCard({
  question,
  onAnswer,
  hidden = [],
  children,
}: {
  question: Question;
  /** 特技「ヒント」で消した選択肢 */
  hidden?: number[];
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
      <p className="text-[15px] leading-relaxed">
        {question.q.split(/(〔[^〕]+〕)/).map((p, i) =>
          p.startsWith("〔") ? (
            <mark key={i} className="mx-0.5 bg-gold px-0.5 font-bold text-bg">
              {p.slice(1, -1)}
            </mark>
          ) : (
            p
          ),
        )}
      </p>
      <SectionFigure id={question.id} />
      <ol className="flex flex-col gap-1.5">
        {question.choices.map((c, i) => {
          const isAnswer = i === question.answer;
          const gone = !done && hidden.includes(i);
          const style = gone
            ? "border-line text-faint line-through opacity-40"
            : !done
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
                disabled={done || gone}
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
          {question.formula && <FormulaDetail formula={question.formula} open={picked !== question.answer} />}
          <NoteLink path={question.note} label={`ノートで確かめる：${question.note.split("/").pop()}`} />
          {visualFor(question.id) && (
            <a
              href={visualFor(question.id)!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-ex underline underline-offset-2"
            >
              📐 図解で見る：{visualFor(question.id)!.label}
            </a>
          )}
          {labFor(question.id) && (
            <Link href={labFor(question.id)!} className="inline-flex items-center gap-1 text-xs text-dsn underline underline-offset-2">
              🎚 断面ラボで寸法を動かして確かめる
            </Link>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
