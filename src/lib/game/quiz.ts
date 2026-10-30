/**
 * 内蔵クイズと暗記カード。中身は scripts/build_quiz.py が vault のノートから作った JSON。
 */
import cardsJson from "@/data/cards.json";
import d1 from "@/data/quiz/d1.json";
import d2 from "@/data/quiz/d2.json";
import d3 from "@/data/quiz/d3.json";
import d4 from "@/data/quiz/d4.json";
import d5 from "@/data/quiz/d5.json";
import d6 from "@/data/quiz/d6.json";
import g1 from "@/data/quiz/g1.json";
import g2 from "@/data/quiz/g2.json";
import g3 from "@/data/quiz/g3.json";
import g4 from "@/data/quiz/g4.json";
import g5 from "@/data/quiz/g5.json";
import g6 from "@/data/quiz/g6.json";
import g7 from "@/data/quiz/g7.json";
import g8 from "@/data/quiz/g8.json";
import g9 from "@/data/quiz/g9.json";
import i1 from "@/data/quiz/i1.json";
import i2 from "@/data/quiz/i2.json";
import i3 from "@/data/quiz/i3.json";
import i4 from "@/data/quiz/i4.json";
import i5 from "@/data/quiz/i5.json";
import i6 from "@/data/quiz/i6.json";
import s1 from "@/data/quiz/s1.json";
import s2 from "@/data/quiz/s2.json";
import s3 from "@/data/quiz/s3.json";
import s4 from "@/data/quiz/s4.json";
import type { Track } from "../tracks";

export type Question = {
  id: string;
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  /** vault のノート（.md なし） */
  note: string;
};

export type Card = { id: string; front: string; back: string; note: string };

export const BANK: Record<string, Question[]> = { g1, g2, g3, g4, g5, g6, g7, g8, g9, s1, s2, s3, s4, i1, i2, i3, i4, i5, i6, d1, d2, d3, d4, d5, d6 };

export const CARDS: Card[] = cardsJson;

const ALL = Object.values(BANK).flat();

export const questionById = (id: string | undefined) => (id ? ALL.find((q) => q.id === id) : undefined);

export const areaOfQuestion = (id: string) => id.split("-")[0];

export const hasQuiz = (areaId: string) => (BANK[areaId]?.length ?? 0) > 0;

/** 地方の問題から n 問を無作為に選ぶ（重複なし） */
export function pickQuestions(areaId: string, n: number): Question[] {
  const pool = [...(BANK[areaId] ?? [])];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/** ノートのフォルダから、どの仲間の経験値にするかを決める */
export const trackOfNote = (note: string): Track =>
  note.startsWith("Learning/Statistics/")
    ? "stat"
    : note.startsWith("Learning/Investing/")
      ? "inv"
      : note.startsWith("knowledge/設計肌感")
        ? "dsn"
        : "ml";

// ---- 暗記カード（Leitner 5箱） ----

/** 箱ごとの次の出題までの日数。忘れたら箱1に戻る。 */
export const BOX_DAYS = [0, 1, 2, 4, 7, 14];
export const NEW_CARDS_PER_DAY = 10;

export type CardState = { box: number; due: string };
