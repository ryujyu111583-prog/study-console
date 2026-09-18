"use client";

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type Settings = {
  /** 受験日（YYYY-MM-DD）。2026年第6回のオンライン試験は11/6・7。 */
  examDate: string;
  /** 終わった週のコード。{ W1: true } の形。 */
  weeksDone: Record<string, boolean>;
  /** 週ごとの英語の素材。{ W1: "6 Minute English ..." } の形。 */
  materials: Record<string, string>;
};

export const DEFAULT_SETTINGS: Settings = {
  examDate: "2026-11-06",
  weeksDone: {},
  materials: {
    W1: "6 Minute English「Can apps teach you a language?」(2026-09-10)",
  },
};

export function subscribeSettings(onChange: (settings: Settings) => void) {
  return onSnapshot(doc(db, "settings", "main"), (snap) => {
    if (!snap.exists()) {
      onChange(DEFAULT_SETTINGS);
      return;
    }
    onChange({ ...DEFAULT_SETTINGS, ...(snap.data() as Partial<Settings>) });
  });
}

export async function saveSettings(patch: Partial<Settings>) {
  await setDoc(doc(db, "settings", "main"), patch, { merge: true });
}
