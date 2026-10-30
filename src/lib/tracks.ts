/**
 * 記録項目の定義。Firebase に依存しないので、クライアントと cron の API の両方から読める。
 */

export type Track = "stat" | "inv" | "ml" | "en" | "dsn";
/** 未記録 / フル / 最低ライン（2分版）の3状態。 */
export type TrackState = "" | "full" | "min";

/** 画面に並べる順。統計を先頭にする。 */
export const TRACKS: Track[] = ["stat", "inv", "ml", "en", "dsn"];

export const TRACK_LABEL: Record<Track, string> = {
  stat: "統計",
  inv: "投資",
  ml: "ML",
  en: "英語",
  dsn: "設計",
};
export const TRACK_CODE: Record<Track, string> = {
  stat: "STAT",
  inv: "INV",
  ml: "ML",
  en: "EN",
  dsn: "DSN",
};

/** Tailwind に拾わせるため、クラス名は組み立てずに丸ごと書く。 */
export const TRACK_COLOR: Record<
  Track,
  { text: string; badge: string; full: string; min: string }
> = {
  stat: {
    text: "text-stat",
    badge: "text-stat bg-statsoft",
    full: "bg-stat border-stat",
    min: "bg-statsoft border-stat",
  },
  inv: {
    text: "text-inv",
    badge: "text-inv bg-invsoft",
    full: "bg-inv border-inv",
    min: "bg-invsoft border-inv",
  },
  ml: {
    text: "text-ml",
    badge: "text-ml bg-mlsoft",
    full: "bg-ml border-ml",
    min: "bg-mlsoft border-ml",
  },
  en: {
    text: "text-en",
    badge: "text-en bg-ensoft",
    full: "bg-en border-en",
    min: "bg-ensoft border-en",
  },
  dsn: {
    text: "text-dsn",
    badge: "text-dsn bg-dsnsoft",
    full: "bg-dsn border-dsn",
    min: "bg-dsnsoft border-dsn",
  },
};

/** studyLog/{YYYY-MM-DD} の中身。gk は旧「G検定」の記録で、読むときだけ ML として扱う。 */
export type DayRecord = Partial<Record<Track | "gk", TrackState>>;

/** その日のトラックの状態。ml が一度も書かれていない日は、旧 gk を ML として読む。 */
export function trackState(entry: DayRecord | null | undefined, track: Track): TrackState {
  if (!entry) return "";
  if (track === "ml") return entry.ml ?? entry.gk ?? "";
  return entry[track] ?? "";
}

/** 項目のどれか1つでも記録があれば true。 */
export function hasAnyRecord(entry: DayRecord | null | undefined): boolean {
  return TRACKS.some((track) => trackState(entry, track) !== "");
}
