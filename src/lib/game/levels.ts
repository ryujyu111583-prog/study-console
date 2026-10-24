/**
 * 育成の計算。Firebase に依存しない純粋な関数だけを置く。
 */
import type { Track } from "../tracks";

export const MAX_LEVEL = 99;
/** 勇者：Lv L に必要な累計経験値は 60 × (L-1)²。毎日フル2項目（約200）で、30日後に Lv8、90日後に Lv14 くらい。 */
export const HERO_STEP = 60;
/** 仲間（4項目それぞれ）：15 × (L-1)²。 */
export const MEMBER_STEP = 15;
/** 系統の熟練度：10 × (L-1)²。1問正解で5なので、Lv2 に2問、Lv3 に8問、Lv4 に18問。 */
export const BRANCH_STEP = 10;

export const xpForLevel = (level: number, step: number) => step * (level - 1) ** 2;

export const levelFor = (xp: number, step: number) =>
  Math.min(MAX_LEVEL, Math.floor(Math.sqrt(Math.max(0, xp) / step)) + 1);

/** 今のレベルの中で、どこまで進んだか（0〜1）。 */
export function levelProgress(xp: number, step: number) {
  const level = levelFor(xp, step);
  if (level >= MAX_LEVEL) return { level, ratio: 1, toNext: 0 };
  const from = xpForLevel(level, step);
  const to = xpForLevel(level + 1, step);
  return { level, ratio: (xp - from) / (to - from), toNext: to - xp };
}

export const heroTitle = (level: number) =>
  level >= 50
    ? "伝説の賢者"
    : level >= 35
      ? "魔王に挑む者"
      : level >= 20
        ? "ベテラン冒険者"
        : level >= 10
          ? "一人前の冒険者"
          : level >= 5
            ? "駆け出し冒険者"
            : "見習い";

/** 4項目を仲間の職業に見立てる。 */
export const MEMBER_JOB: Record<Track, string> = {
  stat: "魔法使い",
  inv: "商人",
  ml: "戦士",
  en: "吟遊詩人",
};

/** 経験値とゴールドの決まり。画面の説明にもこの値を出す。 */
export const REWARD = {
  fullXp: 100,
  minXp: 30,
  minuteXp: 2,
  fullGold: 20,
  minGold: 5,
  minuteGold: 1,
  hitXp: 20,
  defeatXp: 100,
  defeatGold: 30,
  skillXp: 15,
  /** 修行で1問正解したときの、仲間の経験値と系統の熟練度 */
  drillXp: 3,
  drillBranchXp: 5,
  /** 特技を唱えて言えたときの、系統の熟練度 */
  skillBranchXp: 10,
} as const;

/** 修行の1回の問題数と、1系統1日あたり報酬が入る正解数の上限。 */
export const DRILL_SIZE = 10;
export const DRILL_DAILY_CAP = 20;

export const fmt = (n: number) => n.toLocaleString("en-US");
