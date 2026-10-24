/**
 * デイリークエストと宝箱、実績。どれも記録から判定する純粋な関数。
 */
import { dayKey } from "../date";
import { streakFrom, type LogMap } from "../log";
import { RESOLVE_STREAK, type Mistake } from "../mistakes";
import { TRACKS, hasAnyRecord } from "../tracks";
import { AREAS } from "./world";
import { SKILLS } from "./skills";
import type { GameDoc, Stats } from "./state";

export const DAILY_BONUS_GOLD = 100;

export type Quest = { id: string; label: string; hint: string; href: string; done: boolean };

export const QUIZ_GOAL = 5;
export const CARD_GOAL = 10;

export function dailyQuests(logs: LogMap, game: GameDoc, today = dayKey()): Quest[] {
  const quiz = game.quizLog[today] ?? 0;
  const cards = game.cardLog[today] ?? 0;
  return [
    { id: "record", label: "仲間の記録をつける", hint: "4項目のどれか1つ", href: "/", done: hasAnyRecord(logs[today]) },
    { id: "quiz", label: `クイズに${QUIZ_GOAL}問答える`, hint: `たたかう・ボス戦 ${Math.min(quiz, QUIZ_GOAL)}/${QUIZ_GOAL}`, href: "/battle", done: quiz >= QUIZ_GOAL },
    { id: "cards", label: `カードを${CARD_GOAL}枚めくる`, hint: `暗記カード ${Math.min(cards, CARD_GOAL)}/${CARD_GOAL}`, href: "/cards", done: cards >= CARD_GOAL },
  ];
}

/** 宝箱の中身。連続日数が長いほど多い。日付から決まるので、開け直しても変わらない。 */
export function chestReward(streak: number, today = dayKey()) {
  const seed = [...today].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);
  const rare = seed % 10 === 0;
  const gold = Math.min(200, 10 + streak * 5) + (rare ? 300 : 0);
  return { gold, rare };
}

export type Achievement = {
  id: string;
  group: string;
  label: string;
  /** 達成したときの称号 */
  title: string;
  now: number;
  goal: number;
};

export function achievements(logs: LogMap, mistakes: Mistake[], game: GameDoc, stats: Stats): Achievement[] {
  const streak = streakFrom(logs);
  const days = Object.values(logs).filter((e) => hasAnyRecord(e)).length;
  const defeated = mistakes.filter((m) => m.correctStreak >= RESOLVE_STREAK).length;
  const bosses = AREAS.filter((a) => game.bosses[a.id]?.clearedAt).length;
  const hours = Math.floor(
    Object.values(logs).reduce(
      (s, e) => s + (e.statMinutes ?? 0) + (e.invMinutes ?? 0) + (e.mlMinutes ?? 0) + (e.enMinutes ?? 0) + (e.gkMinutes ?? 0),
      0,
    ) / 60,
  );
  const maxMember = Math.max(...TRACKS.map((t) => stats.memberLevel[t]));

  const tier = (id: string, group: string, now: number, steps: [number, string, string][]) =>
    steps.map(([goal, label, title], i) => ({ id: `${id}-${i}`, group, label, title, now, goal }));

  return [
    ...tier("streak", "連続", streak, [
      [3, "3日連続で記録", "三日坊主を超えし者"],
      [7, "7日連続で記録", "一週間の旅人"],
      [30, "30日連続で記録", "鋼の習慣"],
      [84, "84日連続で記録", "魔王城への行軍"],
    ]),
    ...tier("days", "記録", days, [
      [10, "記録した日 10日", "冒険の書の持ち主"],
      [50, "記録した日 50日", "歴戦の記録者"],
      [100, "記録した日 100日", "百日の勇者"],
    ]),
    ...tier("hero", "成長", stats.heroLevel, [
      [5, "勇者 Lv5", "駆け出し冒険者"],
      [10, "勇者 Lv10", "一人前の冒険者"],
      [20, "勇者 Lv20", "ベテラン冒険者"],
    ]),
    ...tier("member", "成長", maxMember, [[10, "仲間のだれかが Lv10", "頼れる仲間"]]),
    ...tier("defeat", "戦闘", defeated, [
      [1, "モンスターを1匹倒す", "はじめての勝利"],
      [10, "モンスターを10匹倒す", "プルンハンター"],
      [30, "モンスターを30匹倒す", "図鑑コンプリーター"],
    ]),
    ...tier("boss", "ボス", bosses, [
      [1, "ボスを1体倒す", "ボススレイヤー"],
      [5, "ボスを5体倒す", "地方の英雄"],
      [AREAS.length, "全ボスを倒す", "世界を救った者"],
    ]),
    ...tier("skill", "スキル", game.skills.length, [
      [5, "特技を5つ覚える", "見習い賢者"],
      [SKILLS.length, "特技をすべて覚える", "大賢者"],
    ]),
    ...tier("hours", "修行", hours, [
      [10, "修行 合計10時間", "修行僧"],
      [50, "修行 合計50時間", "修行の鬼"],
      [100, "修行 合計100時間", "求道者"],
    ]),
  ];
}
