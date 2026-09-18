"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * 「誤りの型」で分類することが、この台帳の本体。
 * 個別の概念を覚え直すより、型を自覚するほうが再発を防げる。
 */
export const MISTAKE_TYPES = [
  "対概念の取り違え",
  "定義の混線",
  "問いの角度のズレ",
  "用語の取り違え",
  "数字・年代の取り違え",
] as const;

export type MistakeType = (typeof MISTAKE_TYPES)[number];

export type Mistake = {
  id: string;
  concept: string;
  type: MistakeType | string;
  correct: string;
  week: string;
  wrongCount: number;
  correctStreak: number;
  createdAt?: Timestamp;
  lastCheckedAt?: Timestamp;
};

/** 3回連続で正答したら解消とみなす。 */
export const RESOLVE_STREAK = 3;

export type MistakeBucket = "recurring" | "watch" | "resolved";

export function bucketOf(m: Mistake): MistakeBucket {
  if (m.correctStreak >= RESOLVE_STREAK) return "resolved";
  if (m.wrongCount >= 2) return "recurring";
  return "watch";
}

export const BUCKET_LABEL: Record<MistakeBucket, string> = {
  recurring: "再発（2回以上）",
  watch: "要注意",
  resolved: "解消済み",
};

export function subscribeMistakes(onChange: (items: Mistake[]) => void) {
  const q = query(collection(db, "mistakes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        // 古いドキュメントに回数フィールドが無くても壊れないようにする
        const data = d.data() as Partial<Omit<Mistake, "id">>;
        return {
          id: d.id,
          concept: data.concept ?? "",
          type: data.type ?? "",
          correct: data.correct ?? "",
          week: data.week ?? "",
          wrongCount: data.wrongCount ?? 1,
          correctStreak: data.correctStreak ?? 0,
          createdAt: data.createdAt,
          lastCheckedAt: data.lastCheckedAt,
        };
      }),
    );
  });
}

export async function addMistake(input: {
  concept: string;
  type: string;
  correct: string;
  week: string;
}) {
  await addDoc(collection(db, "mistakes"), {
    ...input,
    wrongCount: 1,
    correctStreak: 0,
    createdAt: serverTimestamp(),
    lastCheckedAt: serverTimestamp(),
  });
}

/** また間違えた。連続正答はリセットされる。 */
export async function markWrong(m: Mistake) {
  await updateDoc(doc(db, "mistakes", m.id), {
    wrongCount: m.wrongCount + 1,
    correctStreak: 0,
    lastCheckedAt: serverTimestamp(),
  });
}

export async function markCorrect(m: Mistake) {
  await updateDoc(doc(db, "mistakes", m.id), {
    correctStreak: m.correctStreak + 1,
    lastCheckedAt: serverTimestamp(),
  });
}

export async function removeMistake(id: string) {
  await deleteDoc(doc(db, "mistakes", id));
}

/**
 * その日のセッション冒頭に出す問題を選ぶ。
 * 再発項目を最優先で毎回、次に未再確認のものを混ぜ、合計3問まで。
 */
export function pickDrill(items: Mistake[], count = 3): Mistake[] {
  const recurring = items.filter((m) => bucketOf(m) === "recurring");
  const watch = items.filter((m) => bucketOf(m) === "watch");
  return [...recurring, ...watch].slice(0, count);
}
