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

export type Track = "gk" | "en";
/** 未記録 / フル / 最低ライン（2分版）の3状態。 */
export type TrackState = "" | "full" | "min";

export type DayLog = {
  date: string;
  gk?: TrackState;
  en?: TrackState;
  gkMinutes?: number;
  enMinutes?: number;
};

export type LogMap = Record<string, DayLog>;

export const TRACK_LABEL: Record<Track, string> = { gk: "G検定", en: "英語" };
export const TRACK_CODE: Record<Track, string> = { gk: "GK", en: "EN" };

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

export async function setTrackState(key: string, track: Track, state: TrackState) {
  await setDoc(doc(db, "studyLog", key), { date: key, [track]: state }, { merge: true });
}

/** タイマー完了時に呼ぶ。分を加算し、未記録ならフルに引き上げる。 */
export async function recordSession(track: Track, minutes: number, key = dayKey()) {
  const field = track === "gk" ? "gkMinutes" : "enMinutes";
  await setDoc(
    doc(db, "studyLog", key),
    { date: key, [field]: increment(minutes), [track]: "full" },
    { merge: true },
  );
}

/**
 * 連続日数。片方のトラックでも記録があればその日はカウントする。
 * 今日がまだ未記録なら、昨日までの連続を返す（日中に「0日」と出て心が折れるのを防ぐ）。
 */
export function streakFrom(logs: LogMap, today = new Date()): number {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const done = (key: string) => {
    const entry = logs[key];
    return Boolean(entry && (entry.gk || entry.en));
  };

  if (!done(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  while (count < 400 && done(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
