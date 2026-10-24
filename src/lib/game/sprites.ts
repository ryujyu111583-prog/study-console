/**
 * ドット絵のモンスター。32x32 の格子を図形の組み合わせで描く。
 * 定番RPGのモンスターの「系統」（ゴーレム・ドラゴン・コウモリ・騎士・メタル・木づち・恐竜）を借りた
 * オリジナルのデザインで、特定作品のキャラクターは写していない。
 * 格子の各マスは色の記号（monsterPalette のキー）か "."（透明）。
 */
import { MISTAKE_TYPES } from "../mistakeTypes";

export type MonsterKind =
  | "plain"
  | "chain"
  | "ghost"
  | "mushroom"
  | "metal"
  | "golem"
  | "dragon"
  | "bat"
  | "knight"
  | "hammer"
  | "rex";
export type MonsterLook = { base: string; kind: MonsterKind; crown?: boolean; horns?: boolean };

export const GRID = 32;
type Grid = string[][];

// ---- 描画の部品 ----

const blank = (): Grid => Array.from({ length: GRID }, () => Array<string>(GRID).fill("."));
const set = (g: Grid, x: number, y: number, c: string) => {
  if (x >= 0 && y >= 0 && x < GRID && y < GRID) g[Math.floor(y)][Math.floor(x)] = c;
};
const fillWhere = (g: Grid, test: (x: number, y: number) => boolean, c: string) => {
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (test(x + 0.5, y + 0.5)) g[y][x] = c;
};
const inEllipse = (cx: number, cy: number, rx: number, ry: number) => (x: number, y: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const ell = (g: Grid, cx: number, cy: number, rx: number, ry: number, c: string) =>
  fillWhere(g, inEllipse(cx, cy, rx, ry), c);
const rect = (g: Grid, x0: number, y0: number, x1: number, y1: number, c: string) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(g, x, y, c);
};
const line = (g: Grid, x0: number, y0: number, x1: number, y1: number, c: string) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) set(g, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
};
/** 多角形の塗りつぶし（偶奇判定） */
const poly = (g: Grid, pts: [number, number][], c: string) =>
  fillWhere(
    g,
    (x, y) => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    },
    c,
  );
const mirror = (pts: [number, number][]): [number, number][] => pts.map(([x, y]) => [31 - x, y]);

/** 塗った領域の外周1マスを輪郭色にする（ドット絵らしい縁取り） */
function outline(g: Grid, c = "o") {
  const filled = g.map((row) => row.map((v) => v !== "."));
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) {
      if (filled[y][x]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => filled[y + dy]?.[x + dx])) g[y][x] = c;
    }
}

/** 丸い目（白目＋黒目＋光） */
const eye = (g: Grid, cx: number, cy: number, r = 2.4, white = "w") => {
  ell(g, cx, cy, r * 0.9, r * 1.15, white);
  ell(g, cx + 0.4, cy + 0.6, r * 0.5, r * 0.75, "k");
  set(g, cx - 0.6, cy - 0.8, white === "w" ? "w" : "y");
};

// ---- 種族ごとの絵 ----

/** 餅形の体（プルン族の共通部分） */
function blob(g: Grid, ghost = false) {
  const shape = (x: number, y: number) =>
    y < 28 && (inEllipse(16, 19, 13, 11)(x, y) || (y > 19 && y < 28 && x > 3.5 && x < 28.5));
  const wavy = (x: number, y: number) => !(ghost && y > 26 && Math.floor(x / 3) % 2 === 0);
  fillWhere(g, (x, y) => shape(x, y) && wavy(x, y), "b");
  fillWhere(g, (x, y) => shape(x, y) && wavy(x, y) && y > 23, "s");
  ell(g, 10, 13, 3.2, 2.2, "h");
  set(g, 8, 16, "h");
  set(g, 9, 17, "h");
}
function blobFace(g: Grid, white = "w") {
  eye(g, 11.5, 19, 2.6, white);
  eye(g, 20.5, 19, 2.6, white);
  for (const [x, y] of [[14, 24], [15, 25], [16, 25], [17, 24]]) set(g, x, y, "m");
  for (const cx of [7, 24]) rect(g, cx, 22, cx + 1, 22, "p");
}

const DRAW: Record<MonsterKind, (g: Grid) => void> = {
  plain: (g) => {
    blob(g);
    blobFace(g);
  },
  ghost: (g) => {
    blob(g, true);
    blobFace(g);
  },
  chain: (g) => {
    for (let i = 0; i < 6; i++) {
      const x = 5 + i * 4;
      const y = i % 2 ? 6 : 5;
      for (const [dx, dy] of [[0, 0], [1, -1], [2, 0], [1, 1]]) set(g, x + dx, y + dy, "c");
    }
    blob(g);
    blobFace(g);
  },
  mushroom: (g) => {
    blob(g);
    blobFace(g);
    fillWhere(g, (x, y) => y < 15 && inEllipse(16, 14, 15, 10)(x, y), "r");
    for (const [cx, cy, r] of [[10, 8, 1.8], [20, 7, 2.2], [25, 11, 1.4], [6, 12, 1.3]] as const) ell(g, cx, cy, r, r, "w");
  },
  metal: (g) => {
    blob(g);
    // 金属の照り返し：左上の大きな光と、右下の反射
    ell(g, 10, 12, 4, 2.6, "w");
    line(g, 23, 12, 26, 17, "h");
    line(g, 24, 12, 27, 17, "h");
    blobFace(g);
    for (const [x, y] of [[3, 6], [28, 4], [29, 9]]) {
      set(g, x, y, "y");
      set(g, x - 1, y, "y");
      set(g, x + 1, y, "y");
      set(g, x, y - 1, "y");
      set(g, x, y + 1, "y");
    }
  },
  golem: (g) => {
    rect(g, 9, 24, 13, 29, "s"); // 脚
    rect(g, 18, 24, 22, 29, "s");
    rect(g, 7, 12, 24, 24, "b"); // 胴
    rect(g, 7, 21, 24, 24, "s");
    rect(g, 11, 4, 20, 11, "b"); // 頭
    rect(g, 11, 4, 14, 5, "h");
    rect(g, 3, 13, 6, 23, "b"); // 腕
    rect(g, 25, 13, 28, 23, "b");
    rect(g, 2, 23, 7, 27, "a"); // 拳
    rect(g, 24, 23, 29, 27, "a");
    rect(g, 8, 13, 11, 14, "h");
    for (const [x0, y0, x1, y1] of [[10, 15, 13, 18], [20, 14, 22, 19], [15, 20, 17, 22], [13, 5, 13, 7]]) line(g, x0, y0, x1, y1, "s");
    rect(g, 13, 7, 14, 8, "e"); // 光る目
    rect(g, 17, 7, 18, 8, "e");
    line(g, 14, 10, 17, 10, "k");
    // 胸の紋章（石板）
    rect(g, 14, 15, 17, 18, "a");
    set(g, 15, 16, "e");
  },
  dragon: (g) => {
    poly(g, [[17, 16], [22, 3], [28, 7], [30, 13], [26, 16]], "a"); // 翼
    line(g, 22, 4, 21, 15, "s");
    line(g, 27, 7, 24, 15, "s");
    poly(g, [[24, 19], [31, 13], [30, 18], [27, 25]], "b"); // 尾
    ell(g, 18, 21, 9, 6, "b"); // 胴
    ell(g, 17, 23, 6, 3, "l"); // 腹
    poly(g, [[11, 18], [8, 9], [13, 8], [16, 17]], "b"); // 首
    ell(g, 8, 8, 5, 3.6, "b"); // 頭
    rect(g, 2, 8, 6, 11, "b"); // 鼻先
    set(g, 3, 9, "k");
    rect(g, 3, 11, 7, 11, "m");
    set(g, 4, 12, "w");
    set(g, 6, 12, "w");
    line(g, 10, 5, 12, 1, "n"); // 角
    line(g, 8, 5, 8, 2, "n");
    rect(g, 7, 6, 8, 7, "y"); // 目
    set(g, 7, 7, "k");
    rect(g, 13, 25, 15, 29, "s"); // 脚
    rect(g, 21, 25, 23, 29, "s");
    for (const x of [16, 19, 22]) set(g, x, 14, "n"); // 背びれ
    set(g, 9, 6, "h");
  },
  bat: (g) => {
    const wing: [number, number][] = [[11, 13], [1, 7], [1, 13], [3, 12], [4, 17], [7, 15], [9, 19], [12, 17]];
    poly(g, wing, "a");
    poly(g, mirror(wing), "a");
    for (const [x0, y0, x1, y1] of [[2, 8, 4, 16], [5, 9, 7, 15]]) {
      line(g, x0, y0, x1, y1, "s");
      line(g, 31 - x0, y0, 31 - x1, y1, "s");
    }
    poly(g, [[11, 12], [12, 5], [15, 11]], "b"); // 耳
    poly(g, mirror([[11, 12], [12, 5], [15, 11]]), "b");
    ell(g, 16, 16, 6.5, 6.5, "b"); // 体
    ell(g, 13, 13, 2, 1.3, "h");
    eye(g, 13.5, 15.5, 2);
    eye(g, 18.5, 15.5, 2);
    rect(g, 14, 19, 17, 19, "m");
    set(g, 14, 20, "w"); // 牙
    set(g, 17, 20, "w");
    rect(g, 13, 22, 14, 23, "s"); // 足
    rect(g, 17, 22, 18, 23, "s");
  },
  knight: (g) => {
    // 乗っている餅（下半分）
    fillWhere(g, (x, y) => y > 20 && y < 30 && (inEllipse(16, 25, 12, 5)(x, y) || (y > 25 && x > 4.5 && x < 27.5)), "b");
    fillWhere(g, (x, y) => y > 27 && y < 30 && x > 4.5 && x < 27.5, "s");
    ell(g, 9, 23, 2.5, 1.2, "h");
    eye(g, 12, 25.5, 1.6);
    eye(g, 20, 25.5, 1.6);
    // 騎士
    rect(g, 13, 11, 19, 20, "c"); // 鎧
    rect(g, 13, 18, 19, 20, "s");
    rect(g, 14, 12, 15, 13, "w");
    ell(g, 16, 8, 4, 4, "c"); // 兜
    rect(g, 13, 8, 19, 8, "k"); // 覗き穴
    set(g, 15, 8, "e");
    set(g, 17, 8, "e");
    line(g, 17, 4, 20, 1, "r"); // 羽根飾り
    line(g, 18, 4, 21, 1, "r");
    ell(g, 10, 15, 3.5, 4.5, "r"); // 盾
    ell(g, 10, 15, 1.5, 2, "y");
    line(g, 23, 2, 23, 16, "w"); // 剣
    rect(g, 21, 16, 25, 16, "y");
    rect(g, 22, 17, 23, 18, "c");
  },
  hammer: (g) => {
    line(g, 21, 23, 26, 7, "g"); // 柄
    line(g, 22, 23, 27, 7, "g");
    rect(g, 21, 1, 31, 7, "g"); // 木づちの頭
    rect(g, 21, 1, 31, 2, "h");
    rect(g, 23, 1, 24, 7, "d");
    rect(g, 28, 1, 29, 7, "d");
    ell(g, 9, 13, 2.2, 3, "b"); // 耳
    ell(g, 21, 13, 2.2, 3, "b");
    ell(g, 15, 21, 8, 8, "b"); // 体
    ell(g, 15, 24, 5, 4, "l"); // 腹
    ell(g, 11, 16, 2, 1.3, "h");
    eye(g, 12, 18, 2);
    eye(g, 18, 18, 2);
    rect(g, 14, 21, 16, 21, "k"); // 鼻
    rect(g, 14, 23, 16, 23, "m");
    ell(g, 22, 21, 2, 2, "b"); // 腕
    rect(g, 9, 28, 12, 29, "s"); // 足
    rect(g, 18, 28, 21, 29, "s");
  },
  rex: (g) => {
    poly(g, [[23, 15], [31, 26], [29, 27], [22, 21]], "b"); // 尾
    ell(g, 18, 18, 8, 7, "b"); // 胴
    ell(g, 16, 21, 5, 4, "l"); // 腹
    rect(g, 4, 6, 14, 12, "b"); // 頭
    rect(g, 2, 11, 12, 14, "b"); // あご
    rect(g, 3, 11, 11, 11, "m");
    for (const x of [4, 6, 8, 10]) set(g, x, 12, "w"); // 歯
    rect(g, 6, 4, 13, 6, "c"); // 兜
    set(g, 13, 3, "n");
    set(g, 13, 2, "n");
    rect(g, 8, 7, 9, 8, "y"); // 目
    set(g, 8, 8, "k");
    for (const [x, y] of [[15, 10], [19, 10], [23, 12]]) poly(g, [[x - 1, y + 1], [x, y - 3], [x + 2, y + 1]], "n"); // 背のトゲ
    rect(g, 12, 16, 13, 18, "b"); // 小さな腕
    rect(g, 15, 23, 18, 29, "s"); // 脚
    rect(g, 21, 23, 24, 29, "s");
    rect(g, 14, 29, 19, 29, "a");
    rect(g, 20, 29, 25, 29, "a");
    rect(g, 17, 14, 21, 17, "c"); // 胸当て
    set(g, 6, 7, "h");
  },
};

export function monsterGrid(look: MonsterLook): Grid {
  const g = blank();
  DRAW[look.kind](g);
  if (look.crown) {
    // 頭が左にある種族は、王冠も頭の上へ寄せる
    const x0 = look.kind === "dragon" ? 3 : look.kind === "rex" ? 5 : 11;
    const y0 = look.kind === "dragon" ? 1 : 0;
    rect(g, x0, y0, x0 + 8, y0 + 2, "y");
    for (const x of [x0, x0 + 4, x0 + 8]) set(g, x, y0, ".");
    set(g, x0 + 4, y0 + 1, "r");
  }
  if (look.horns) {
    for (let i = 0; i < 5; i++) {
      set(g, 6 + Math.floor(i / 2), 10 - i, "n");
      set(g, 25 - Math.floor(i / 2), 10 - i, "n");
    }
  }
  outline(g);
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
    s: shade(look.base, -55),
    h: shade(look.base, 90),
    a: shade(look.base, -30),
    l: shade(look.base, 60),
    o: "#0b0d1c",
    w: "#ffffff",
    k: "#05060f",
    m: "#3a0d14",
    p: "#ff8fb1",
    c: "#c9cfdf",
    r: "#e8483c",
    y: "#ffd84a",
    n: "#f4f4f4",
    e: "#7cf7ff",
    g: "#b07a3f",
    d: "#7a4f24",
  };
}

// ---- 種族の一覧 ----

export type Species = { name: string; look: MonsterLook };

/** 野生で出る種族。メタルプルンだけは出にくく、倒すと経験値が多い（BattleView） */
export const SPECIES: Record<MonsterKind, Species> = {
  plain: { name: "プルン", look: { base: "#5fb8ff", kind: "plain" } },
  chain: { name: "クサリプルン", look: { base: "#59c46a", kind: "chain" } },
  ghost: { name: "ユラユラ", look: { base: "#a9c8f0", kind: "ghost" } },
  mushroom: { name: "ヒッカケダケ", look: { base: "#f2e2c4", kind: "mushroom" } },
  metal: { name: "メタルプルン", look: { base: "#aab6cc", kind: "metal" } },
  golem: { name: "イシゴーレム", look: { base: "#8f96a8", kind: "golem" } },
  dragon: { name: "コドラゴン", look: { base: "#3fae6a", kind: "dragon" } },
  bat: { name: "パタパタ", look: { base: "#8a5cd6", kind: "bat" } },
  knight: { name: "プルンナイト", look: { base: "#4fa3e8", kind: "knight" } },
  hammer: { name: "デカヅチ", look: { base: "#c98b4f", kind: "hammer" } },
  rex: { name: "ウォーレックス", look: { base: "#c0563a", kind: "rex" } },
};

/** 野生で出る種族の重み（メタルは出にくい） */
const WILD: [MonsterKind, number][] = [
  ["plain", 10],
  ["chain", 8],
  ["ghost", 8],
  ["mushroom", 8],
  ["golem", 8],
  ["dragon", 6],
  ["bat", 10],
  ["knight", 7],
  ["hammer", 9],
  ["rex", 5],
  ["metal", 3],
];

export function rollWild(): Species {
  const total = WILD.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [kind, w] of WILD) {
    if ((r -= w) < 0) return SPECIES[kind];
  }
  return SPECIES.plain;
}

/** 誤答の型 → 見た目と名前。型を体で覚えるための対応。 */
export const MISTAKE_MONSTER: Record<string, Species> = {
  [MISTAKE_TYPES[0]]: { name: "クサリドラゴン", look: { base: "#3fae6a", kind: "dragon" } }, // つなぎ違い（鎖）
  [MISTAKE_TYPES[1]]: { name: "タイルゴーレム", look: { base: "#7f8fb8", kind: "golem" } }, // 軸が立たない（表）
  [MISTAKE_TYPES[2]]: { name: "ワスレバット", look: { base: "#8a5cd6", kind: "bat" } }, // 索引喪失（索引）
  [MISTAKE_TYPES[3]]: { name: "ヒッカケナイト", look: { base: "#e8a33d", kind: "knight" } }, // 問いのずれ
  [MISTAKE_TYPES[4]]: { name: "コトバヅチ", look: { base: "#c98b4f", kind: "hammer" } }, // 用語止まり
};

export const monsterFor = (type: string) => MISTAKE_MONSTER[type] ?? SPECIES.plain;

/** 相棒（勇者の隣にいるプルン） */
export const BUDDY_LOOK: MonsterLook = { base: "#5fb8ff", kind: "plain" };
