"use client";

import { useEffect, useState } from "react";
import { daysUntil } from "@/lib/date";
import { currentWeekIndex, WEEKS } from "@/lib/plan";
import { DEFAULT_SETTINGS, saveSettings, subscribeSettings, type Settings } from "@/lib/settings";

export default function PlanView() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => subscribeSettings(setSettings), []);

  const now = currentWeekIndex();
  const left = daysUntil(settings.examDate);

  const toggleWeek = (code: string) => {
    void saveSettings({
      weeksDone: { ...settings.weeksDone, [code]: !settings.weeksDone[code] },
    });
  };

  const commitMaterial = (code: string) => {
    const value = draft.trim();
    void saveSettings({ materials: { ...settings.materials, [code]: value } });
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-surface p-4">
        <label
          htmlFor="exam-date"
          className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase"
        >
          受験日
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="exam-date"
            type="date"
            value={settings.examDate}
            onChange={(e) => void saveSettings({ examDate: e.target.value })}
            className="rounded-lg border border-line bg-surface2 px-2 py-1.5 font-mono text-sm"
          />
          <span className="font-mono text-sm tabular-nums text-muted">
            {left === null ? "—" : `あと${left}日`}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-faint">
          2026年 第6回はオンライン試験 11/6（金）・7（土）。申込期限は受験日より先に来る。
        </p>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        {WEEKS.map((week, i) => {
          const done = Boolean(settings.weeksDone[week.code]);
          return (
            <div key={week.code} className={i > 0 ? "border-t border-line" : ""}>
              <div className={`flex items-start gap-3 p-3 ${i === now ? "bg-surface2" : ""}`}>
                <button
                  onClick={() => toggleWeek(week.code)}
                  aria-pressed={done}
                  className="flex flex-1 items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 font-mono text-[11px] font-semibold ${
                      i === now ? "text-gk" : "text-faint"
                    }`}
                  >
                    {week.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${done ? "text-muted" : ""}`}>
                      {week.topic}
                    </span>
                    <span className="block text-[11px] text-faint">
                      {week.span} ・ {week.bridge}
                    </span>
                  </span>
                  <span className={`font-mono text-sm ${done ? "text-ok" : "text-linestrong"}`}>
                    {done ? "●" : "○"}
                  </span>
                </button>
              </div>

              <div className="px-3 pb-3">
                {editing === week.code ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && commitMaterial(week.code)}
                      placeholder="英語の素材（例：6 Minute English の回タイトル）"
                      className="min-w-0 flex-1 rounded-lg border border-line bg-surface2 px-2 py-1.5 text-xs"
                    />
                    <button
                      onClick={() => commitMaterial(week.code)}
                      className="rounded-lg bg-ink px-3 py-1.5 text-xs text-bg"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(week.code);
                      setDraft(settings.materials[week.code] ?? "");
                    }}
                    className="w-full rounded-lg border border-dashed border-line px-2 py-1.5 text-left text-[11px] text-muted"
                  >
                    {settings.materials[week.code] || "英語の素材を入れる"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <p className="text-xs leading-relaxed text-muted">
        毎週木曜に配信される 6 Minute English の最新回を、その週の素材にする。選ばない。冒頭1分だけを7日間回す。
      </p>
    </div>
  );
}
