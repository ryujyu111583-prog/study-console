"use client";

import { useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import { REWARD } from "@/lib/game/levels";
import { castSkill } from "@/lib/game/state";
import type { SkillNode } from "@/lib/game/skills";
import { dayKey } from "@/lib/date";

/** 特技を唱える：問いに口で答えられたら「言えた」。経験値は1日1回まで。 */
export default function SkillCast({ node, onDone }: { node: SkillNode; onDone?: () => void }) {
  const { game, say } = useGame();
  const [busy, setBusy] = useState(false);
  const usedToday = game.skillUsed[node.id] === dayKey();

  const ok = async () => {
    setBusy(true);
    try {
      const first = await castSkill(game, node.id, node.track);
      say(
        first
          ? [`勇者は ${node.skill} を唱えた！`, `「${node.topic}」を言えた！ ${REWARD.skillXp} の経験値を獲得！`]
          : [`勇者は ${node.skill} を唱えた！`, "今日はもう経験値は入らないが、回すほど忘れない。"],
      );
    } finally {
      setBusy(false);
      onDone?.();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        <span className="text-gold">{node.skill}</span>
        <span className="ml-2 text-xs text-faint">{node.topic}</span>
      </p>
      <p className="text-sm leading-relaxed">{node.prompt}</p>
      <p className="text-xs text-faint">声に出して説明してから押す。{usedToday && "（今日は唱え済み）"}</p>
      <NoteLink id={node.id} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={ok}
          className="rounded-md border-2 border-ink py-1.5 disabled:opacity-40"
        >
          言えた
        </button>
        <button
          type="button"
          onClick={() => {
            say([`${node.skill} は不発に終わった…`, `ノートで「${node.topic}」を確かめよう。`]);
            onDone?.();
          }}
          className="rounded-md border-2 border-line py-1.5 text-muted"
        >
          まだ言えない
        </button>
      </div>
    </div>
  );
}
