/**
 * 勇者の HP・宿屋・放置ボーナス（Habitica から借りた3つの仕組み）。Firebase に依存しない純粋な関数。
 *
 * - HP：G検定（ML）に触れなかった日の翌朝に減る。減るのは G検定だけで、ほかの3項目は関係ない。
 *   0 になると気絶し、ゴールドを落として HP が満タンに戻る。
 * - 宿屋：泊まっている日は HP が減らず、連続日数も切れない。
 * - 放置ボーナス：しばらく触れていない G検定の地方と台帳の問題ほど赤くなり、経験値が増える。
 *
 * どれも記録から毎回計算し直す（保存するのは宿屋の滞在と、地方に最後に触れた日だけ）。
 */
import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import { dayKey } from "../date";
import type { LogMap } from "../log";
import { trackState } from "../tracks";

export const HP_MAX = 100;
/** G検定に触れなかった日のダメージ。10日放っておくと気絶する */
export const MISS_DAMAGE = 10;
/** G検定に触れた日の回復 */
export const DONE_HEAL = 5;
/** 気絶したときに落とすゴールド */
export const FAINT_GOLD = 100;
/** この日より前の日は数えない（導入前の空白で気絶しないように） */
export const HP_START = "2026-10-24";

/** 宿屋の滞在。since は今泊まっている日（チェックアウトで stays に移る） */
export type Inn = { since: string | null; stays: { from: string; to: string }[] };

/** 地方に最後に触れた日。prev は「今日より前に最後に触れた日」を出すために、1つ前を残す */
export type AreaTouch = Record<string, { last: string; prev?: string }>;

export const restChecker = (inn: Inn) => (key: string) =>
  (inn.since !== null && key >= inn.since) || inn.stays.some((s) => key >= s.from && key <= s.to);

/** その日に G検定に触れたか：ML の記録があるか、G検定のクイズ・カードを1つでもやったか */
export const gkDone = (logs: LogMap, gkLog: Record<string, number>, key: string) =>
  trackState(logs[key], "ml") !== "" || (gkLog[key] ?? 0) > 0;

export type Vitality = {
  hp: number;
  faints: number;
  lastFaint: string | null;
  /** 今日すでに G検定に触れたか */
  todayDone: boolean;
  /** 今日、宿屋に泊まっているか */
  resting: boolean;
  /** 今月、宿屋に泊まった日数 */
  innDaysThisMonth: number;
};

/** HP_START から昨日までを1日ずつたどる。今日の分は、明日の朝に決まる。 */
export function vitality(
  logs: LogMap,
  gkLog: Record<string, number>,
  inn: Inn,
  today = dayKey(),
): Vitality {
  const resting = restChecker(inn);
  let hp = HP_MAX;
  let faints = 0;
  let lastFaint: string | null = null;
  for (let d = parseISO(HP_START); dayKey(d) < today; d = addDays(d, 1)) {
    const key = dayKey(d);
    if (resting(key)) continue;
    if (gkDone(logs, gkLog, key)) {
      hp = Math.min(HP_MAX, hp + DONE_HEAL);
      continue;
    }
    hp -= MISS_DAMAGE;
    if (hp <= 0) {
      faints++;
      lastFaint = key;
      hp = HP_MAX;
    }
  }

  const month = today.slice(0, 7);
  let innDaysThisMonth = 0;
  for (let d = parseISO(`${month}-01`); dayKey(d) <= today; d = addDays(d, 1)) {
    if (resting(dayKey(d))) innDaysThisMonth++;
  }

  return {
    hp,
    faints,
    lastFaint,
    todayDone: gkDone(logs, gkLog, today),
    resting: resting(today),
    innDaysThisMonth,
  };
}

// ---- 放置ボーナス ----

export type Neglect = { days: number; level: 0 | 1 | 2; multiplier: number };

/** 7日で黄色（×1.5）、14日で赤（×2） */
export function neglectOf(lastKey: string | undefined, today = dayKey()): Neglect {
  const days = Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(lastKey ?? HP_START)));
  if (days >= 14) return { days, level: 2, multiplier: 2 };
  if (days >= 7) return { days, level: 1, multiplier: 1.5 };
  return { days, level: 0, multiplier: 1 };
}

/** 地方に「今日より前に」最後に触れた日。今日触れても、その日のうちはボーナスが続く */
export function lastBeforeToday(touch: AreaTouch[string] | undefined, today = dayKey()) {
  if (!touch) return undefined;
  return touch.last === today ? touch.prev : touch.last;
}

export const NEGLECT_COLOR = ["", "var(--gold)", "var(--danger)"] as const;
