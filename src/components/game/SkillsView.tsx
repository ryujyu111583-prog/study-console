"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import DrillPanel from "@/components/game/DrillPanel";
import NoteLink from "@/components/game/NoteLink";
import SkillCast from "@/components/game/SkillCast";
import { BRANCH_STEP, MEMBER_JOB, levelProgress } from "@/lib/game/levels";
import {
  MODE_LABEL,
  branchById,
  branchesOf,
  canUnlock,
  nodesOf,
  skillById,
  type SkillNode,
} from "@/lib/game/skills";
import { play } from "@/lib/game/sfx";
import { branchLevel, unlockSkill } from "@/lib/game/state";
import { TRACK_LABEL, TRACKS, type Track } from "@/lib/tracks";

const COLOR: Record<Track, string> = {
  stat: "var(--stat)",
  inv: "var(--inv)",
  ml: "var(--ml)",
  en: "var(--en)",
};

// ツリーの1マス。3列、段の高さ 64。
const CELL_W = 100;
const CELL_H = 64;
const cx = (n: SkillNode) => 18 + n.col * CELL_W + 42;
const cy = (n: SkillNode) => 10 + n.row * CELL_H + 18;

export default function SkillsView() {
  const { game, stats, say } = useGame();
  const [track, setTrack] = useState<Track>("ml");
  const branches = branchesOf(track);
  const [branchId, setBranchId] = useState(branches[0].id);
  const branch = branchById(branchId)?.track === track ? branchById(branchId)! : branches[0];
  const nodes = nodesOf(branch.id);
  const [selected, setSelected] = useState<string>(nodes[0].id);
  const node = skillById(selected)?.branch === branch.id ? skillById(selected)! : nodes[0];
  // 修行の窓を閉じたら中身を作り直す
  const [drillKey, setDrillKey] = useState(0);
  const sp = stats.sp[track];
  const has = (id: string) => game.skills.includes(id);
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  const bl = levelProgress(game.branchXp[branch.id] ?? 0, BRANCH_STEP);

  const pickBranch = (id: string) => {
    setBranchId(id);
    setSelected(nodesOf(id)[0].id);
    setDrillKey((k) => k + 1);
  };

  const unlock = async () => {
    await unlockSkill(node.id);
    play("quest");
    say(
      branch.mode === "recall"
        ? [`${TRACK_LABEL[track]}の${MEMBER_JOB[track]}は ${node.skill} を覚えた！`, `「${node.topic}」の特技。戦闘中に唱えられる。`]
        : node.seconds
          ? [`${branch.name}の段位「${node.skill}」を開いた！`, `1問${node.seconds}秒で修行できる。`]
          : [`${node.skill} を手に入れた！`, `「${node.topic}」の${node.items?.length ?? 0}問が、${branch.name}の修行に加わった。`],
    );
  };

  const requirement = () => {
    if (!node.requires.every(has)) return "前のスキルが先";
    if (branchLevel(game, branch.id) < (node.lv ?? 1)) return `${branch.name} Lv${node.lv} が要る`;
    if (sp < node.cost) return "SPが足りない";
    return node.cost === 0 ? "覚える（SP不要）" : "SPを使って覚える";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="仲間">
        {TRACKS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === track}
            onClick={() => {
              setTrack(t);
              pickBranch(branchesOf(t)[0].id);
            }}
            className={`rounded-md border-2 py-1.5 text-sm ${t === track ? "border-ink" : "border-line text-faint"}`}
            style={t === track ? { color: COLOR[t] } : undefined}
          >
            {TRACK_LABEL[t]}
            {stats.sp[t] > 0 && <span className="ml-1 text-xs text-gold">{stats.sp[t]}</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="系統">
        {branches.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={b.id === branch.id}
            onClick={() => pickBranch(b.id)}
            className={`rounded-md border-2 px-2 py-0.5 text-xs ${b.id === branch.id ? "border-gold text-gold" : "border-line text-muted"}`}
          >
            {b.name}
            <span className="ml-1 text-[10px] text-faint">Lv{branchLevel(game, b.id)}</span>
          </button>
        ))}
      </div>

      <section className="win pt-4" aria-label={`${branch.name}のスキルツリー`}>
        <span className="win-label">
          {TRACK_LABEL[track]}の{MEMBER_JOB[track]} ・ Lv{stats.memberLevel[track]} ・ <span className="text-gold">SP {sp}</span>
        </span>
        <div className="mb-2 flex items-center gap-2 text-xs text-faint">
          <span className="text-ink">
            {branch.name} Lv{bl.level}
          </span>
          <span className="h-1.5 flex-1 border border-line" aria-hidden>
            <span className="block h-full bg-gold" style={{ width: `${bl.ratio * 100}%` }} />
          </span>
          <span>{MODE_LABEL[branch.mode]}</span>
        </div>
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
        <span className="win-label">{has(node.id) ? (branch.mode === "recall" ? "覚えた特技" : "開いたスキル") : "スキル"}</span>
        {has(node.id) && branch.mode === "recall" ? (
          <SkillCast node={node} />
        ) : (
          <>
            <p className="text-base">
              {node.topic} <span className="ml-1 text-sm text-gold">→ {branch.mode === "recall" ? "特技" : ""}「{node.skill}」</span>
            </p>
            <p className="text-sm leading-relaxed text-muted">
              {branch.mode === "recall" ? `唱えるときの問い：${node.prompt}` : node.prompt}
            </p>
            <NoteLink id={node.id} />
            {has(node.id) ? (
              <p className="text-xs text-faint">下の修行で出る。</p>
            ) : (
              <>
                <p className="text-xs text-faint">
                  必要SP {node.cost}
                  {node.lv && node.lv > 1 && ` ・ ${branch.name} Lv${node.lv}`}
                  {node.requires.length > 0 && ` ・ 前提：${node.requires.map((r) => skillById(r)?.topic).join("、")}`}
                </p>
                <button
                  type="button"
                  disabled={!canUnlock(node, game.skills, sp, branchLevel(game, branch.id))}
                  onClick={() => void unlock()}
                  className="rounded-md border-2 border-ink py-2 disabled:border-line disabled:text-faint"
                >
                  {requirement()}
                </button>
              </>
            )}
          </>
        )}
        <p className="text-xs text-faint">
          SPは仲間のLvが1上がるごとに1。系統のLvはその系統の修行で上がり、奥のスキルを開く鍵になる。
        </p>
      </section>

      <section className="win flex flex-col gap-2 pt-4" aria-label="修行">
        <span className="win-label">
          修行：{branch.name}（{MODE_LABEL[branch.mode]}）
        </span>
        <p className="text-sm leading-relaxed text-muted">{branch.about}</p>
        {branch.from && (
          <p className="text-xs text-faint">出題元：{branch.from.map((f) => branchById(f)?.name).join("・")}</p>
        )}
        <DrillPanel key={`${branch.id}-${drillKey}`} branch={branch} onClose={() => setDrillKey((k) => k + 1)} />
      </section>

      {branch.tools.length > 0 && (
        <section className="win flex flex-col gap-2 pt-4" aria-label="道具">
          <span className="win-label">道具（{branch.name}を鍛えるツール）</span>
          <ul className="flex flex-col gap-2">
            {branch.tools.map((t) => (
              <li key={t.url}>
                <a href={t.url} target="_blank" rel="noreferrer" className="text-sm text-ex underline underline-offset-2">
                  {t.name}
                </a>
                <span className="ml-2 text-[11px] text-faint">{t.host}</span>
                <p className="text-xs leading-relaxed text-muted">{t.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
