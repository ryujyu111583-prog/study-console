"use client";

/**
 * ゲームの状態。
 * 経験値とゴールドの大部分は studyLog（毎日の記録とタイマーの分数）から毎回計算し直す。
 * 保存するのは「記録からは分からないもの」だけ：戦闘・特技・ボスで得た分、使ったゴールド、
 * 持ち物、装備、開いたスキル、ボスの戦績。置き場所は settings/game
 * （firestore.rules で既に読み書きを許可している場所なので、ルールを貼り直さなくていい）。
 */
import { arrayUnion, doc, increment, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { dayKey } from "../date";
import type { LogMap } from "../log";
import { TRACKS, trackState, type Track } from "../tracks";
import { itemById, type Item, type Slot } from "./items";
import { HERO_STEP, MEMBER_STEP, REWARD, levelFor } from "./levels";
import { skillById } from "./skills";

export type GameDoc = {
  bonusXp: Record<Track, number>;
  bonusGold: number;
  spentGold: number;
  owned: string[];
  equip: Partial<Record<Slot, string>>;
  skills: string[];
  bosses: Record<string, { best: number; clearedAt?: string }>;
  /** 特技を最後に唱えた日（1日1回まで経験値が入る） */
  skillUsed: Record<string, string>;
  /** 宝箱とデイリーボーナスを最後に受け取った日 */
  daily: { chest?: string; bonus?: string };
  /** 冒険の書で選んだ称号（空なら Lv の称号） */
  title: string;
};

const zero = (): Record<Track, number> => ({ stat: 0, inv: 0, ml: 0, en: 0 });

export const EMPTY_GAME: GameDoc = {
  bonusXp: zero(),
  bonusGold: 0,
  spentGold: 0,
  owned: [],
  equip: {},
  skills: [],
  bosses: {},
  skillUsed: {},
  daily: {},
  title: "",
};

const gameRef = () => doc(db, "settings", "game");

export function subscribeGame(onChange: (g: GameDoc) => void) {
  return onSnapshot(gameRef(), (snap) => {
    const d = (snap.data() ?? {}) as Partial<GameDoc>;
    onChange({
      bonusXp: { ...zero(), ...(d.bonusXp ?? {}) },
      bonusGold: d.bonusGold ?? 0,
      spentGold: d.spentGold ?? 0,
      owned: d.owned ?? [],
      equip: d.equip ?? {},
      skills: d.skills ?? [],
      bosses: d.bosses ?? {},
      skillUsed: d.skillUsed ?? {},
      daily: d.daily ?? {},
      title: d.title ?? "",
    });
  });
}

/** 記録から計算できる分の経験値・ゴールド・分数。 */
export function fromLogs(logs: LogMap) {
  const xp = zero();
  const minutes = zero();
  let gold = 0;
  for (const entry of Object.values(logs)) {
    for (const track of TRACKS) {
      const state = trackState(entry, track);
      const m =
        (entry[`${track}Minutes` as const] ?? 0) + (track === "ml" ? (entry.gkMinutes ?? 0) : 0);
      xp[track] +=
        (state === "full" ? REWARD.fullXp : state === "min" ? REWARD.minXp : 0) +
        m * REWARD.minuteXp;
      gold +=
        (state === "full" ? REWARD.fullGold : state === "min" ? REWARD.minGold : 0) +
        m * REWARD.minuteGold;
      minutes[track] += m;
    }
  }
  return { xp, gold, minutes };
}

export type Stats = ReturnType<typeof computeStats>;

export function computeStats(logs: LogMap, game: GameDoc) {
  const base = fromLogs(logs);
  const xp = zero();
  for (const t of TRACKS) xp[t] = base.xp[t] + (game.bonusXp[t] ?? 0);
  const heroXp = TRACKS.reduce((sum, t) => sum + xp[t], 0);
  const memberLevel = zero();
  const sp = zero();
  for (const t of TRACKS) {
    memberLevel[t] = levelFor(xp[t], MEMBER_STEP);
    const spent = game.skills
      .map((id) => skillById(id))
      .filter((s) => s?.track === t)
      .reduce((sum, s) => sum + (s?.cost ?? 0), 0);
    sp[t] = memberLevel[t] - 1 - spent;
  }
  const equipped = (Object.values(game.equip) as string[])
    .map((id) => itemById(id))
    .filter((i): i is Item => !!i);
  const thisMonth = dayKey().slice(0, 7);
  const monthMinutes = Object.values(logs)
    .filter((e) => e.date.startsWith(thisMonth))
    .reduce(
      (sum, e) =>
        sum +
        (e.statMinutes ?? 0) + (e.invMinutes ?? 0) + (e.mlMinutes ?? 0) + (e.enMinutes ?? 0) + (e.gkMinutes ?? 0),
      0,
    );

  return {
    xp,
    heroXp,
    heroLevel: levelFor(heroXp, HERO_STEP),
    memberLevel,
    sp,
    gold: base.gold + game.bonusGold - game.spentGold,
    atk: 5 + equipped.reduce((s, i) => s + (i.atk ?? 0), 0),
    def: 3 + equipped.reduce((s, i) => s + (i.def ?? 0), 0),
    monthMinutes,
  };
}

// ---- 書き込み ----

export async function addBonus(track: Track, xp: number, gold = 0) {
  await setDoc(
    gameRef(),
    { bonusXp: { [track]: increment(xp) }, bonusGold: increment(gold) },
    { merge: true },
  );
}

export async function openChest(gold: number) {
  await setDoc(gameRef(), { bonusGold: increment(gold), daily: { chest: dayKey() } }, { merge: true });
}

export async function claimDailyBonus(gold: number) {
  await setDoc(gameRef(), { bonusGold: increment(gold), daily: { bonus: dayKey() } }, { merge: true });
}

export async function setTitle(title: string) {
  await setDoc(gameRef(), { title }, { merge: true });
}

export async function buyItem(item: Item) {
  await setDoc(
    gameRef(),
    { spentGold: increment(item.price), owned: arrayUnion(item.id), equip: { [item.slot]: item.id } },
    { merge: true },
  );
}

export async function equipItem(slot: Slot, id: string | null) {
  await setDoc(gameRef(), { equip: { [slot]: id } }, { merge: true });
}

export async function unlockSkill(id: string) {
  await setDoc(gameRef(), { skills: arrayUnion(id) }, { merge: true });
}

/** 特技を唱えて言えた。今日まだなら経験値を足して true を返す。 */
export async function castSkill(game: GameDoc, id: string, track: Track) {
  const today = dayKey();
  const first = game.skillUsed[id] !== today;
  await setDoc(
    gameRef(),
    {
      skillUsed: { [id]: today },
      ...(first ? { bonusXp: { [track]: increment(REWARD.skillXp) } } : {}),
    },
    { merge: true },
  );
  return first;
}

/** ボス戦の結果。初めて合格したときだけ報酬を足す。 */
export async function recordBoss(
  game: GameDoc,
  area: { id: string; track: Track; pass: number; xp: number; gold: number },
  score: number,
) {
  const prev = game.bosses[area.id];
  const firstClear = score >= area.pass && !prev?.clearedAt;
  await setDoc(
    gameRef(),
    {
      bosses: {
        [area.id]: {
          best: Math.max(prev?.best ?? 0, score),
          ...(firstClear ? { clearedAt: dayKey() } : {}),
        },
      },
      ...(firstClear
        ? { bonusXp: { [area.track]: increment(area.xp) }, bonusGold: increment(area.gold) }
        : {}),
    },
    { merge: true },
  );
  return { firstClear, cleared: score >= area.pass };
}
