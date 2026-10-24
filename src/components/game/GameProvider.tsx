"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { subscribeAllLogs, type LogMap } from "@/lib/log";
import { subscribeMistakes, type Mistake } from "@/lib/mistakes";
import { MEMBER_JOB, heroTitle } from "@/lib/game/levels";
import { EMPTY_GAME, computeStats, subscribeGame, type GameDoc, type Stats } from "@/lib/game/state";
import { play } from "@/lib/game/sfx";
import { TRACK_LABEL, TRACKS } from "@/lib/tracks";

type GameContext = {
  logs: LogMap;
  game: GameDoc;
  mistakes: Mistake[];
  stats: Stats;
  ready: boolean;
  /** 下のメッセージ窓に出す（最大3行） */
  say: (lines: string | string[]) => void;
  message: string;
  levelUp: number;
};

const Ctx = createContext<GameContext | null>(null);

export function useGame() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useGame は GameProvider の中で使う");
  return value;
}

export default function GameProvider({
  greeting,
  children,
}: {
  greeting: string;
  children: React.ReactNode;
}) {
  const [logs, setLogs] = useState<LogMap | null>(null);
  const [game, setGame] = useState<GameDoc | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [message, setMessage] = useState(greeting);
  const [levelUp, setLevelUp] = useState(0);

  useEffect(() => subscribeAllLogs(setLogs), []);
  useEffect(() => subscribeGame(setGame), []);
  useEffect(() => subscribeMistakes(setMistakes), []);

  const ready = logs !== null && game !== null;
  const stats = useMemo(() => computeStats(logs ?? {}, game ?? EMPTY_GAME), [logs, game]);

  const say = useCallback((lines: string | string[]) => {
    setMessage(([] as string[]).concat(lines).slice(-3).join("\n"));
  }, []);

  // レベルが上がったら、どの操作が原因でもここで知らせる。読み込み直後の値は比べない。
  const prev = useRef<Stats | null>(null);
  useEffect(() => {
    if (!ready) return;
    const before = prev.current;
    prev.current = stats;
    if (!before) return;
    const lines: string[] = [];
    for (const t of TRACKS) {
      if (stats.memberLevel[t] > before.memberLevel[t]) {
        lines.push(`${TRACK_LABEL[t]}の${MEMBER_JOB[t]}は Lv${stats.memberLevel[t]} に上がった！ SP+1`);
      }
    }
    if (stats.heroLevel > before.heroLevel) {
      lines.push(`勇者は Lv${stats.heroLevel} に上がった！（${heroTitle(stats.heroLevel)}）`);
      setLevelUp((n) => n + 1);
      play("levelUp");
    } else if (lines.length > 0) {
      play("quest");
    }
    if (lines.length > 0) setMessage((m) => [...m.split("\n"), ...lines].slice(-3).join("\n"));
  }, [ready, stats]);

  return (
    <Ctx.Provider
      value={{
        logs: logs ?? {},
        game: game ?? EMPTY_GAME,
        mistakes,
        stats,
        ready,
        say,
        message,
        levelUp,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
