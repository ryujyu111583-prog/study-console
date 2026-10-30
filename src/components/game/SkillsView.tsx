"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import SkillCast from "@/components/game/SkillCast";
import { MEMBER_JOB } from "@/lib/game/levels";
import { EFFECTS, effectOf } from "@/lib/game/magic";
import { canUnlock, skillById, skillsOf, type SkillNode } from "@/lib/game/skills";
import { play } from "@/lib/game/sfx";
import { unlockSkill } from "@/lib/game/state";
import { TRACK_LABEL, TRACKS, type Track } from "@/lib/tracks";

const COLOR: Record<Track, string> = {
  stat: "var(--stat)",
  inv: "var(--inv)",
  ml: "var(--ml)",
  en: "var(--en)",
  dsn: "var(--dsn)",
};

// ツリーの1マス。3列、段の高さ 64。
const CELL_W = 100;
const CELL_H = 64;
const cx = (n: SkillNode) => 18 + n.col * CELL_W + 42;
const cy = (n: SkillNode) => 10 + n.row * CELL_H + 18;

export default function SkillsView() {
  const { game, stats, say } = useGame();
  const [track, setTrack] = useState<Track>("ml");
  const nodes = skillsOf(track);
  const [selected, setSelected] = useState<string>(nodes[0].id);
  const node = skillById(selected)?.track === track ? skillById(selected)! : nodes[0];
  const sp = stats.sp[track];
  const has = (id: string) => game.skills.includes(id);
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;

  const unlock = async () => {
    await unlockSkill(node.id);
    play("quest");
    say([`${TRACK_LABEL[track]}の${MEMBER_JOB[track]}は ${node.skill} を覚えた！`, `「${node.topic}」の特技。戦闘中に唱えられる。`]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-5 gap-1.5" role="tablist" aria-label="仲間">
        {TRACKS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === track}
            onClick={() => {
              setTrack(t);
              setSelected(skillsOf(t)[0].id);
            }}
            className={`rounded-md border-2 py-1.5 text-sm ${t === track ? "border-ink" : "border-line text-faint"}`}
            style={t === track ? { color: COLOR[t] } : undefined}
          >
            {TRACK_LABEL[t]}
            {stats.sp[t] > 0 && <span className="ml-1 text-xs text-gold">{stats.sp[t]}</span>}
          </button>
        ))}
      </div>

      <section className="win pt-4" aria-label={`${TRACK_LABEL[track]}のスキルツリー`}>
        <span className="win-label">
          {TRACK_LABEL[track]}の{MEMBER_JOB[track]} ・ Lv{stats.memberLevel[track]} ・ <span className="text-gold">SP {sp}</span>
        </span>
        <div className="relative mx-auto" style={{ width: 336, maxWidth: "100%", height: rows * CELL_H + 10 }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 336 ${rows * CELL_H + 10}`} aria-hidden>
            {nodes.flatMap((n) =>
              n.requires.map((r) => {
                const from = skillById(r)!;
                return (
                  <line
                    key={`${r}-${n.id}`}
                    x1={cx(from)}
                    y1={cy(from)}
                    x2={cx(n)}
                    y2={cy(n)}
                    stroke={has(r) ? COLOR[track] : "#3a3f66"}
                    strokeWidth="3"
                  />
                );
              }),
            )}
          </svg>
          {nodes.map((n) => {
            const owned = has(n.id);
            const open = n.requires.every(has);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n.id)}
                className={`absolute flex h-9 w-[84px] items-center justify-center rounded-md border-2 bg-surface px-1 text-center text-[11px] leading-tight ${
                  owned ? "border-gold text-gold" : open ? "border-ink" : "border-line text-faint"
                } ${n.id === node.id ? "outline-2 outline-offset-2 outline-ink" : ""}`}
                style={{ left: `${((18 + n.col * CELL_W) / 336) * 100}%`, top: 10 + n.row * CELL_H }}
              >
                {n.topic}
              </button>
            );
          })}
        </div>
      </section>

      <section className="win flex flex-col gap-2 pt-4" aria-label="スキルの詳細">
        <span className="win-label">{has(node.id) ? "覚えた特技" : "スキル"}</span>
        {has(node.id) ? (
          <SkillCast node={node} />
        ) : (
          <>
            <p className="text-base">
              {node.topic} <span className="ml-1 text-sm text-gold">→ 特技「{node.skill}」</span>
            </p>
            <p className="text-sm leading-relaxed text-muted">唱えるときの問い：{node.prompt}</p>
            <NoteLink id={node.id} />
            <p className="text-xs text-faint">
              必要SP {node.cost}
              {node.requires.length > 0 && ` ・ 前提：${node.requires.map((r) => skillById(r)?.topic).join("、")}`}
            </p>
            <button
              type="button"
              disabled={!canUnlock(node, game.skills, sp)}
              onClick={() => void unlock()}
              className="rounded-md border-2 border-ink py-2 disabled:border-line disabled:text-faint"
            >
              {node.requires.every(has) ? (sp >= node.cost ? "SPを使って覚える" : "SPが足りない") : "前のスキルが先"}
            </button>
          </>
        )}
        {track !== "en" && (
          <p className="text-xs text-gold">
            たたかうでの効果：{EFFECTS[effectOf(node)].name}（MP{EFFECTS[effectOf(node)].mp}）— {EFFECTS[effectOf(node)].desc}
          </p>
        )}
        <p className="text-xs text-faint">SPは仲間のLvが1上がるごとに1。論点を学んでから開くと、特技が復習カードになる。</p>
      </section>
    </div>
  );
}
