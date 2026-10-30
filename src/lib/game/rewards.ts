/**
 * 報酬とボス判定の規則。アプリ（state.ts）と報告 API（/api/report）の両方から使う純粋な関数。
 */
import type { Track } from "../tracks";
import { REWARD } from "./levels";
import { areaById } from "./world";

export type BossRecord = { best: number; clearedAt?: string };

export type BossOutcome = {
  cleared: boolean;
  firstClear: boolean;
  record: BossRecord;
  xp: number;
  gold: number;
};

/** ボス戦の結果。初めて合格したときだけ報酬が出る。 */
export function bossOutcome(
  prev: BossRecord | undefined,
  area: { pass: number; xp: number; gold: number },
  score: number,
  today: string,
): BossOutcome {
  const cleared = score >= area.pass;
  const firstClear = cleared && !prev?.clearedAt;
  return {
    cleared,
    firstClear,
    record: {
      best: Math.max(prev?.best ?? 0, score),
      ...(prev?.clearedAt ? { clearedAt: prev.clearedAt } : firstClear ? { clearedAt: today } : {}),
    },
    xp: firstClear ? area.xp : 0,
    gold: firstClear ? area.gold : 0,
  };
}

/** Claude から届く報告。外部サイト（NotebookLM・アプリ・BBC など）の結果。 */
export type Report = {
  source: string;
  track: Track;
  /** 地図の地方。ボス戦として扱うのは total がその地方の問題数と同じときだけ */
  area?: string;
  score?: number;
  total?: number;
  minutes?: number;
  misses?: { concept: string; type?: string; correct?: string }[];
  note?: string;
};

const TRACKS: Track[] = ["stat", "inv", "ml", "en", "dsn"];

/** 受け取った JSON を確かめる。おかしければ理由を返す。 */
export function validateReport(body: unknown): { ok: true; report: Report } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "JSON のオブジェクトを送ってください" };
  const r = body as Record<string, unknown>;
  if (typeof r.source !== "string" || !r.source) return { ok: false, error: "source（どこでやったか）が必要です" };
  if (!TRACKS.includes(r.track as Track)) return { ok: false, error: "track は stat / inv / ml / en / dsn のどれか" };
  if (r.area !== undefined && !areaById(r.area as string)) return { ok: false, error: `area "${String(r.area)}" は地図にありません` };
  const num = (k: string) => r[k] === undefined || (typeof r[k] === "number" && (r[k] as number) >= 0);
  if (!num("score") || !num("total") || !num("minutes")) return { ok: false, error: "score / total / minutes は0以上の数" };
  if (typeof r.score === "number" && typeof r.total === "number" && r.score > r.total) return { ok: false, error: "score が total を超えています" };
  if (r.misses !== undefined && (!Array.isArray(r.misses) || r.misses.some((m) => !m || typeof m.concept !== "string"))) {
    return { ok: false, error: "misses は {concept, type?, correct?} の配列" };
  }
  return { ok: true, report: r as unknown as Report };
}

/** 報告から経験値・ゴールドを計算する（ボス分は別に bossOutcome で足す）。 */
export function reportRewards(r: Report) {
  const score = r.score ?? 0;
  const minutes = Math.min(r.minutes ?? 0, 180);
  return {
    xp: score * REWARD.quizXp + minutes * REWARD.minuteXp,
    gold: score * REWARD.quizGold + minutes * REWARD.minuteGold,
  };
}

/** 報告がボス戦にあたるか（地方があり、問題数がそのボスと同じ） */
export function bossOf(r: Report) {
  const area = areaById(r.area);
  if (!area || r.total === undefined || r.score === undefined || r.total !== area.questions) return null;
  return area;
}

/** アプリの履歴に残す1件 */
export type ReportItem = {
  id: string;
  at: string;
  source: string;
  track: Track;
  area?: string;
  score?: number;
  total?: number;
  minutes?: number;
  misses: number;
  xp: number;
  gold: number;
  boss?: "first" | "clear" | "fail";
  note?: string;
};
