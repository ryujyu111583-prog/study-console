"use client";

import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { dayKey } from "./date";
import { db } from "./firebase";
import { hasAnyRecord, type DayRecord, type Track, type TrackState } from "./tracks";

export type DayLog = DayRecord & {
  date: string;
  statMinutes?: number;
  invMinutes?: number;
  mlMinutes?: number;
  enMinutes?: number;
  /** 旧「G検定」のタイマー分数。書き込みはしない。 */
  gkMinutes?: number;
};

export type LogMap = Record<string, DayLog>;

export function stateLabel(state: TrackState): string {
  if (state === "full") return "フル";
  if (state === "min") return "最低ライン";
  return "未";
}

/** タップのたびに 未 → フル → 最低ライン → 未 と回す。 */
export function nextState(state: TrackState): TrackState {
  if (state === "") return "full";
  if (state === "full") return "min";
  return "";
}

/** 直近days日ぶんのログを購読する。返り値で解除する。 */
export function subscribeLog(days: number, onChange: (logs: LogMap) => void) {
  const q = query(collection(db, "studyLog"), orderBy("date", "desc"), limit(days));
  return onSnapshot(q, (snap) => {
    const map: LogMap = {};
    snap.forEach((d) => {
      map[d.id] = { date: d.id, ...(d.data() as Omit<DayLog, "date">) };
    });
    onChange(map);
  });
}

/** 全期間のログを購読する（経験値とゴールドの計算用）。1日1ドキュメントなので数百件で収まる。 */
export function subscribeAllLogs(onChange: (logs: LogMap) => void) {
  const q = query(collection(db, "studyLog"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    const map: LogMap = {};
    snap.forEach((d) => {
      map[d.id] = { date: d.id, ...(d.data() as Omit<DayLog, "date">) };
    });
    onChange(map);
  });
}

export async function setTrackState(key: string, track: Track, state: TrackState) {
  await setDoc(doc(db, "studyLog", key), { date: key, [track]: state }, { merge: true });
}

/** タイマー完了時に呼ぶ。分を加算し、未記録ならフルに引き上げる。 */
export async function recordSession(track: Track, minutes: number, key = dayKey()) {
  await setDoc(
    doc(db, "studyLog", key),
    { date: key, [`${track}Minutes`]: increment(minutes), [track]: "full" },
    { merge: true },
  );
}

/**
 * 連続日数。どれか1つのトラックでも記録があればその日はカウントする。
 * 今日がまだ未記録なら、昨日までの連続を返す（日中に「0日」と出て心が折れるのを防ぐ）。
 */
export function streakFrom(logs: LogMap, today = new Date()): number {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const done = (key: string) => hasAnyRecord(logs[key]);

  if (!done(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  while (count < 400 && done(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
