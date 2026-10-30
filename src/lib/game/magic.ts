/**
 * MP と特技の効果、週のイベント。Firebase に依存しない純粋な関数だけを置く。
 * MP は毎日リセットされる：今日の記録が多いほど多く使える（記録 → 戦闘を楽にする、の順にしたい）。
 */
import { TRACKS, trackState, type DayRecord, type Track } from "../tracks";

export type Effect = "reveal" | "hint" | "double";

/** 特技の効果。たたかう（野生）で1問に1つまで使える。ボス戦では使えない（ボスは実力の測定なので）。 */
export const EFFECTS: Record<Effect, { name: string; mp: number; desc: string }> = {
  reveal: { name: "見破る", mp: 2, desc: "答える前に、解説の最初の一文を見る" },
  hint: { name: "ヒント", mp: 3, desc: "まちがいの選択肢を2つ消す" },
  double: { name: "経験値2倍", mp: 4, desc: "この1問の経験値とゴールドが2倍" },
};

export const EFFECT_ORDER: Effect[] = ["reveal", "hint", "double"];

/** 特技の効果は覚えるのに要った SP で決まる：1＝見破る、2＝ヒント、3＝経験値2倍 */
export const effectOf = (node: { cost: number }): Effect =>
  node.cost >= 3 ? "double" : node.cost === 2 ? "hint" : "reveal";

/** 見破る・ヒントを使って正解したときの報酬の割合。思い出す力を鍛えるのが本体なので、助けを借りた分は減らす */
export const ASSIST_RATE = 0.5;

export const MP_BASE = 4;
/** 今日の記録（フルか最低ライン）1項目ごとに増える最大 MP */
export const MP_PER_RECORD = 4;

export function mpOf(entry: DayRecord | null | undefined, used: number) {
  const records = TRACKS.filter((t) => trackState(entry, t) !== "").length;
  const max = MP_BASE + MP_PER_RECORD * records;
  return { max, now: Math.max(0, max - used) };
}

/** 見破る：解説の最初の一文 */
export const firstSentence = (text: string) => text.match(/^[^。]*。?/)?.[0] ?? text;

/** ヒント：正解以外から2つを無作為に選んで消す */
export function hintHidden(choices: number, answer: number): number[] {
  const wrong = Array.from({ length: choices }, (_, i) => i).filter((i) => i !== answer);
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  return wrong.slice(0, 2);
}

// ---- 週のイベント ----

/** 曜日（日=0）ごとに経験値が増える分野。G検定を優先して週3日 */
export const WEEK_EVENT: Track[] = ["ml", "ml", "stat", "inv", "ml", "stat", "dsn"];
export const EVENT_MULTIPLIER = 1.5;

export const EVENT_NAME: Partial<Record<Track, string>> = {
  ml: "戦士の日（G検定）",
  stat: "魔法使いの日（統計）",
  inv: "商人の日（投資）",
  dsn: "鍛冶屋の日（設計）",
};

export const eventOf = (date = new Date()) => {
  const track = WEEK_EVENT[date.getDay()];
  return { track, name: EVENT_NAME[track] ?? "", multiplier: EVENT_MULTIPLIER };
};

/** クイズとカードの報酬に掛ける倍率 */
export const eventMultiplier = (track: Track, date = new Date()) =>
  eventOf(date).track === track ? EVENT_MULTIPLIER : 1;
