"use client";

import { useEffect, useState } from "react";
import {
  addMistake,
  BUCKET_LABEL,
  bucketOf,
  markCorrect,
  markWrong,
  MISTAKE_TYPES,
  removeMistake,
  RESOLVE_STREAK,
  subscribeMistakes,
  type Mistake,
  type MistakeBucket,
} from "@/lib/mistakes";
import { currentWeek } from "@/lib/plan";

const ORDER: MistakeBucket[] = ["recurring", "watch", "resolved"];

export default function MistakesView() {
  const [items, setItems] = useState<Mistake[]>([]);
  const [open, setOpen] = useState(false);
  const [concept, setConcept] = useState("");
  const [type, setType] = useState<string>(MISTAKE_TYPES[0]);
  const [correct, setCorrect] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeMistakes(setItems), []);

  const submit = async () => {
    if (!concept.trim()) return;
    setSaving(true);
    try {
      await addMistake({
        concept: concept.trim(),
        type,
        correct: correct.trim(),
        week: currentWeek()?.code ?? "",
      });
      setConcept("");
      setCorrect("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const grouped = ORDER.map((bucket) => ({
    bucket,
    rows: items.filter((m) => bucketOf(m) === bucket),
  }));

  return (
    <div className="flex flex-col gap-5">
      {open ? (
        <section className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
          <input
            autoFocus
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="間違えた概念（例：過学習と未学習）"
            className="rounded-lg border border-line bg-surface2 px-2.5 py-2 text-sm"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-line bg-surface2 px-2.5 py-2 text-sm"
          >
            {MISTAKE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <textarea
            value={correct}
            onChange={(e) => setCorrect(e.target.value)}
            rows={2}
            placeholder="正しくは（一文で）"
            className="rounded-lg border border-line bg-surface2 px-2.5 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={saving || !concept.trim()}
              className="flex-1 rounded-lg bg-ink px-4 py-2 text-sm text-bg disabled:opacity-40"
            >
              追加
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted"
            >
              やめる
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-faint">
            概念そのものより「誤りの型」が本体。同じ型が複数の概念で起きていれば、それが本当の弱点。
          </p>
        </section>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg"
        >
          誤答を追加
        </button>
      )}

      {items.length === 0 && (
        <p className="text-xs leading-relaxed text-muted">
          まだ空です。セッションで間違えたものをその場で入れてください。再発項目は「今日」の画面に自動で出ます。
        </p>
      )}

      {grouped.map(({ bucket, rows }) =>
        rows.length === 0 ? null : (
          <section key={bucket} className="flex flex-col gap-2">
            <h2 className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
              {BUCKET_LABEL[bucket]}（{rows.length}）
            </h2>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              {rows.map((m, i) => (
                <article key={m.id} className={`p-3 ${i > 0 ? "border-t border-line" : ""}`}>
                  <p className="text-sm font-medium">{m.concept}</p>
                  <p className="font-mono text-[11px] text-faint">
                    {m.type} ・ 誤答{m.wrongCount}回 ・ 連続正答{m.correctStreak}/{RESOLVE_STREAK}
                    {m.week && ` ・ ${m.week}`}
                  </p>
                  {m.correct && (
                    <p className="mt-1 text-xs leading-relaxed text-muted">{m.correct}</p>
                  )}
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => void markCorrect(m)}
                      className="rounded-md border border-line px-2.5 py-1 text-[11px] text-ok"
                    >
                      正答
                    </button>
                    <button
                      onClick={() => void markWrong(m)}
                      className="rounded-md border border-line px-2.5 py-1 text-[11px] text-gk"
                    >
                      また間違えた
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`「${m.concept}」を台帳から消しますか？`)) {
                          void removeMistake(m.id);
                        }
                      }}
                      className="ml-auto rounded-md px-2.5 py-1 text-[11px] text-faint"
                    >
                      削除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
