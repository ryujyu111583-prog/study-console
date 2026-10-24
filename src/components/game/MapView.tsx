"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import Sprite from "@/components/game/Sprite";
import { fmt } from "@/lib/game/levels";
import { recordBoss } from "@/lib/game/state";
import { play } from "@/lib/game/sfx";
import { AREAS, G_ROAD, areaById, daysUntilExam, type Area } from "@/lib/game/world";
import { TRACK_LABEL, type Track } from "@/lib/tracks";

import { noteFor } from "@/lib/game/obsidian";

const noteLabel = (id: string) => noteFor(id)?.split("/").pop() ?? "";

const TRACK_COLOR: Record<Track, string> = {
  stat: "var(--stat)",
  inv: "var(--inv)",
  ml: "var(--ml)",
  en: "var(--en)",
};

// 陸地（viewBox 360x520）。G検定大陸を中央に、統計・英語・投資を離れ島に置く。
const LANDS = [
  "M30 480 C10 420 40 380 50 330 C60 270 60 220 90 170 C110 120 120 70 180 40 C230 20 260 50 250 100 C240 150 220 190 215 240 C210 300 190 350 170 390 C150 440 120 500 70 505 C50 507 38 498 30 480Z",
  "M14 40 C10 20 40 10 70 18 C96 26 92 70 84 110 C78 150 80 175 60 182 C30 190 12 160 14 120Z",
  "M270 190 C290 170 340 180 348 220 C356 260 345 320 320 330 C290 342 270 310 272 270 C273 240 262 210 270 190Z",
  "M262 380 C280 360 340 360 348 400 C356 440 340 490 300 494 C268 497 250 470 252 440 C253 415 250 395 262 380Z",
];

export default function MapView() {
  const { game, mistakes, stats, say } = useGame();
  const [selected, setSelected] = useState<string>(
    () => G_ROAD.find((id) => !game.bosses[id]?.clearedAt) ?? "g1",
  );
  const [score, setScore] = useState(7);
  const [busy, setBusy] = useState(false);
  const area = areaById(selected) ?? AREAS[0];
  const record = game.bosses[area.id];
  const monsters = mistakes.filter((m) => m.area === area.id).length;
  const cleared = AREAS.filter((a) => game.bosses[a.id]?.clearedAt).length;

  const pick = (a: Area) => {
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

  const road = G_ROAD.map((id) => areaById(id)!).map((a) => `${a.x},${a.y}`).join(" ");

  return (
    <div className="flex flex-col gap-4">
      <section className="win p-1.5" aria-label="世界地図">
        <svg viewBox="0 0 360 520" className="block h-auto w-full" role="img" aria-label={`世界地図。制覇 ${cleared}/${AREAS.length}`}>
          <rect width="360" height="520" fill="#123a73" />
          {Array.from({ length: 26 }, (_, i) => (
            <path key={i} d={`M${(i * 53) % 340 + 8} ${(i * 97) % 500 + 10} h6`} stroke="#3d6fb0" strokeWidth="2" />
          ))}
          {LANDS.map((d, i) => (
            <path key={i} d={d} fill="#3f8f45" stroke="#e9d9a0" strokeWidth="4" />
          ))}
          {/* 魔王城のまわりは荒れ地 */}
          <ellipse cx="214" cy="60" rx="38" ry="24" fill="#4a3a52" />
          <polyline points={road} fill="none" stroke="#e9d9a0" strokeWidth="3" strokeDasharray="5 4" />
          {AREAS.map((a) => {
            const done = !!game.bosses[a.id]?.clearedAt;
            const isMaou = a.id === "maou";
            return (
              <g key={a.id} onClick={() => pick(a)} className="cursor-pointer" role="button" aria-label={a.name}>
                {isMaou ? (
                  <g transform={`translate(${a.x - 14} ${a.y - 18})`}>
                    <rect x="0" y="8" width="28" height="20" fill={done ? "#777" : "#2a1030"} stroke="#f4f4f4" strokeWidth="2" />
                    <rect x="2" y="0" width="6" height="10" fill="#2a1030" stroke="#f4f4f4" strokeWidth="2" />
                    <rect x="20" y="0" width="6" height="10" fill="#2a1030" stroke="#f4f4f4" strokeWidth="2" />
                    <rect x="11" y="18" width="6" height="10" fill="#ffd84a" />
                  </g>
                ) : (
                  <rect
                    x={a.x - 9}
                    y={a.y - 9}
                    width="18"
                    height="18"
                    fill={done ? "#ffd84a" : TRACK_COLOR[a.track]}
                    stroke="#05060f"
                    strokeWidth="3"
                  />
                )}
                {a.id === selected && (
                  <rect x={a.x - 14} y={a.y - 14} width="28" height="28" fill="none" stroke="#f4f4f4" strokeWidth="2">
                    <animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite" />
                  </rect>
                )}
                {done && !isMaou && (
                  <text x={a.x} y={a.y + 4} textAnchor="middle" fontSize="11" fill="#05060f">★</text>
                )}
              </g>
            );
          })}
          <text x="24" y="206" fill="#f4f4f4" fontSize="11" fontFamily="DotGothic16, monospace">統計の島</text>
          <text x="282" y="350" fill="#f4f4f4" fontSize="11" fontFamily="DotGothic16, monospace">英語の島</text>
          <text x="270" y="512" fill="#f4f4f4" fontSize="11" fontFamily="DotGothic16, monospace">投資の島</text>
          <text x="60" y="512" fill="#f4f4f4" fontSize="11" fontFamily="DotGothic16, monospace">G検定大陸</text>
        </svg>
        <p className="px-1 pt-1 text-xs text-faint">
          制覇 {cleared}/{AREAS.length} ・ 魔王城まで あと {daysUntilExam()} 日 ・ 場所をタップ
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
        <p className="text-sm leading-relaxed">{area.howTo}</p>
        <NoteLink id={area.id} label={`予習：${noteLabel(area.id)}`} />
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
      </section>
    </div>
  );
}
