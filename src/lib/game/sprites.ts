/**
 * ドット絵のモンスター（オリジナルの「プルン」族）。16x16 の格子を文字で持ち、
 * 共通の餅形の体に、種類ごとの飾り（鎖・羽・笠など）を重ねて作る。
 */
import { MISTAKE_TYPES } from "../mistakes";

export type MonsterKind = "plain" | "chain" | "ghost" | "bat" | "mushroom" | "golem";
export type MonsterLook = { base: string; kind: MonsterKind; crown?: boolean; horns?: boolean };

// b=体 s=影 h=光 w=白目 k=黒目 m=口
const BODY = [
  "................",
  "................",
  "................",
  "................",
  ".....bbbbbb.....",
  "...bbbbbbbbbb...",
  "..bbbbbbbbbbbb..",
  ".bbhhbbbbbbbbbb.",
  ".bbhbbbbbbbbbbb.",
  ".bbbbwwbbwwbbbb.",
  "bbbbbwkbbwkbbbbb",
  "bbbbbbbbbbbbbbbb",
  "bbbbbbbmmbbbbbbb",
  "sbbbbbbbbbbbbbbs",
  ".ssssssssssssss.",
  "................",
];

type Grid = string[][];

const put = (g: Grid, rows: string[], top = 0) => {
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== ".") g[top + y][x] = ch;
    }),
  );
};

const OVERLAY: Record<MonsterKind, (g: Grid) => void> = {
  plain: () => {},
  chain: (g) =>
    put(g, ["...c..c..c..c...", "..c.cc.cc.cc.c..", "...c..c..c..c..."], 1),
  ghost: (g) => {
    put(g, ["s.ss.ss.ss.ss.s."], 14);
    g[13] = [..."bbbbbbbbbbbbbbbb"];
  },
  bat: (g) =>
    put(g, ["a..............a", "aa............aa", "aaa..........aaa", ".aa..........aa.", "..a..........a.."], 4),
  mushroom: (g) =>
    put(g, ["....rrrrrrrr....", "..rrrwrrrrrwrr..", ".rrwwrrrrrrrwrr.", "rrrrrrrrrrrrrrrr"], 2),
  golem: (g) => {
    put(g, ["....oooooooo....", "...o........o..."], 3);
    g[10][6] = "y";
    g[10][10] = "y";
  },
};

export function monsterGrid(look: MonsterLook): Grid {
  const g: Grid = BODY.map((row) => [...row]);
  OVERLAY[look.kind](g);
  if (look.crown) put(g, ["......y.y.y.....", "......yyyyy....."], 2);
  if (look.horns) put(g, ["..n..........n..", "..nn........nn.."], 3);
  return g;
}

const shade = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) =>
    Math.max(0, Math.min(255, ((n >> shift) & 255) + amount)).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};

export function monsterPalette(look: MonsterLook): Record<string, string> {
  return {
    b: look.base,
    s: shade(look.base, -70),
    h: shade(look.base, 80),
    w: "#ffffff",
    k: "#05060f",
    m: "#3a0d14",
    c: "#c9cfdf",
    a: shade(look.base, -40),
    r: "#e8483c",
    o: shade(look.base, -30),
    y: "#ffd84a",
    n: "#f4f4f4",
  };
}

/** 誤答の型 → 見た目と名前。型を体で覚えるための対応。 */
export const MISTAKE_MONSTER: Record<string, { name: string; look: MonsterLook }> = {
  [MISTAKE_TYPES[0]]: { name: "クサリプルン", look: { base: "#59c46a", kind: "chain" } },
  [MISTAKE_TYPES[1]]: { name: "ユラユラプルン", look: { base: "#cfe3ff", kind: "ghost" } },
  [MISTAKE_TYPES[2]]: { name: "ワスレバット", look: { base: "#8a5cd6", kind: "bat" } },
  [MISTAKE_TYPES[3]]: { name: "ヒッカケダケ", look: { base: "#e8483c", kind: "mushroom" } },
  [MISTAKE_TYPES[4]]: { name: "コトバゴーレム", look: { base: "#9b8466", kind: "golem" } },
};

export const monsterFor = (type: string) =>
  MISTAKE_MONSTER[type] ?? { name: "プルン", look: { base: "#5fb8ff", kind: "plain" as const } };

/** 相棒（勇者の隣にいるプルン） */
export const BUDDY_LOOK: MonsterLook = { base: "#5fb8ff", kind: "plain" };
