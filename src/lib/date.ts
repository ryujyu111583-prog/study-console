import { format, subDays } from "date-fns";

/** Firestore のドキュメントIDに使う日付キー（YYYY-MM-DD、ローカル時刻基準）。 */
export function dayKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/** 今日から遡ってN日ぶんのキーを、古い順に返す。 */
export function recentDayKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) keys.push(dayKey(subDays(from, i)));
  return keys;
}

/**
 * サーバー（UTC で動く）から見た JST の「今日」。アプリ側の dayKey と同じ形になる。
 * 9時間ぶんずらしてから日付部分だけ読む。
 */
export function jstDayKey(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function shortDate(key: string): string {
  return key.slice(5).replace("-", "/");
}
