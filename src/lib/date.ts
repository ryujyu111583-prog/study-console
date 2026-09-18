import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";

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

/** 受験日まであと何日か。過ぎていれば負の数。 */
export function daysUntil(isoDate: string, from: Date = new Date()): number | null {
  if (!isoDate) return null;
  try {
    return differenceInCalendarDays(parseISO(isoDate), from);
  } catch {
    return null;
  }
}

export function shortDate(key: string): string {
  return key.slice(5).replace("-", "/");
}
