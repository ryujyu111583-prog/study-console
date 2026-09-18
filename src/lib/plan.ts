import { differenceInCalendarDays, parseISO } from "date-fns";

export type Week = {
  code: string;
  span: string;
  topic: string;
  bridge: string;
};

/** W1の開始日。ここを起点に「今週どこか」を計算する。 */
export const PLAN_START = "2026-09-17";

/**
 * 残りカリキュラムの週割り。
 * 現行シラバスは生成AIの比重が上がり、重心が「歴史」から「実装・運用」へ移っているため、
 * 生成AIをW3に前倒しし、歴史は強化学習と同居させている。
 */
export const WEEKS: Week[] = [
  {
    code: "W1",
    span: "9/17–9/23",
    topic: "RNN / LSTM / GRU",
    bridge: "時刻歴応答。状態を持って時間発展する系",
  },
  {
    code: "W2",
    span: "9/24–9/30",
    topic: "seq2seq / Attention / Transformer",
    bridge: "配点が厚い。BERT・GPTの土台",
  },
  {
    code: "W3",
    span: "10/1–10/7",
    topic: "生成AI（GAN・VAE・拡散・LLM）",
    bridge: "改訂シラバスで比重が上がった領域。前倒しで厚く",
  },
  {
    code: "W4",
    span: "10/8–10/14",
    topic: "画像認識の発展 ＋ 学習テクニック",
    bridge: "ResNetのスキップ結合、Adam、正則化、転移学習",
  },
  {
    code: "W5",
    span: "10/15–10/21",
    topic: "強化学習 ＋ AIの歴史と動向",
    bridge: "強化学習 ↔ modeFRONTIERの最適化ループ",
  },
  {
    code: "W6",
    span: "10/22–10/28",
    topic: "社会実装・法規・倫理",
    bridge: "暗記科目。試験2週間前に着手する約束の週",
  },
  {
    code: "W7",
    span: "10/29–11/5",
    topic: "総復習・誤答台帳の消し込み・模試",
    bridge: "新規論点は入れない。回転だけ",
  },
];

/** 今日が第何週か。開始前は -1、終了後は WEEKS.length 以上を返す。 */
export function currentWeekIndex(from: Date = new Date()): number {
  const diff = differenceInCalendarDays(from, parseISO(PLAN_START));
  if (diff < 0) return -1;
  return Math.floor(diff / 7);
}

export function currentWeek(from: Date = new Date()): Week | null {
  const i = currentWeekIndex(from);
  return i >= 0 && i < WEEKS.length ? WEEKS[i] : null;
}
