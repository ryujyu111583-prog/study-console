"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import Sprite from "@/components/game/Sprite";
import { monsterFor } from "@/lib/game/sprites";
import { AREAS, areaById } from "@/lib/game/world";
import {
  addMistake,
  BUCKET_LABEL,
  bucketOf,
  markCorrect,
  markWrong,
  MISTAKE_TYPES,
  removeMistake,
  RESOLVE_STREAK,
  type MistakeBucket,
} from "@/lib/mistakes";

const ORDER: MistakeBucket[] = ["recurring", "watch", "resolved"];

export default function MistakesView() {
  const { mistakes: items, say } = useGame();
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState("");
  const [concept, setConcept] = useState("");
  const [type, setType] = useState<string>(MISTAKE_TYPES[0]);
  const [correct, setCorrect] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!concept.trim()) return;
    setSaving(true);
    try {
      await addMistake({
        concept: concept.trim(),
        type,
        correct: correct.trim(),
        week: "",
        area,
      });
      say([`${monsterFor(type).name}を 図鑑に登録した。`, "明日から戦闘に現れる。"]);
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
          <select
            id="mistake-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-lg border border-line bg-surface2 px-2.5 py-2 text-sm"
          >
            <option value="">出現地（未設定）</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}（{a.topic}）
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

      <p className="-mt-2 text-right">
        <NoteLink id="ledger" label="vault の誤答台帳を開く" />
      </p>

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
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sprite look={monsterFor(m.type).look} size={28} label={monsterFor(m.type).name} />
                    {m.concept}
                  </p>
                  <p className="font-mono text-[11px] text-faint">
                    {m.type} ・ 誤答{m.wrongCount}回 ・ 連続正答{m.correctStreak}/{RESOLVE_STREAK}
                    {m.week && ` ・ ${m.week}`}
                    {areaById(m.area) && ` ・ ${areaById(m.area)?.name}`}
                  </p>
                  <NoteLink id={m.area} />
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
                      className="rounded-md border border-line px-2.5 py-1 text-[11px] text-ml"
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
