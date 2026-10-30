/**
 * 世界地図の地形。192x192 マスを決まった種（seed）から毎回同じ形に作り、1マス 8x8 のドット絵で塗る。
 * 真ん中の内海に「人間界」（world.ts の AREAS）があり、そのまわりをぐるりと暗黒大陸が囲む。
 * 人間界は陸地全体の1割に満たない。地図を引くと、まだ知らない土地のほうがずっと広いことが見える。
 */
import { AREAS } from "./world";

export const W = 192;
export const H = 192;
/** 1マスのドット数 */
export const TILE = 8;

/** 内海（人間界の海）。この楕円の外側が暗黒大陸 */
const SEA = { x: 96, y: 92, rx: 62, ry: 60 };

// ---- 地形の種類 ----
const DEEP = 0,
  SEA_T = 1,
  SHALLOW = 2,
  ABYSS = 3,
  WHIRL = 4,
  SAND = 5,
  GRASS = 6,
  FOREST = 7,
  HILLS = 8,
  MOUNT = 9,
  SNOWPEAK = 10,
  SNOW = 11,
  SWAMP = 12,
  DESERT = 13,
  LAVA = 14,
  ASH = 15,
  BONE = 16,
  JUNGLE = 17,
  ICEPEAK = 18,
  BRIDGE = 19,
  VOLCANO = 20,
  DEADTREE = 21,
  CRAG = 22,
  PINE = 23;

// ---- 乱数とノイズ ----
function hash(x: number, y: number, seed: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** 0..1 の重ね合わせノイズ。scale は最初の波長（マス） */
function fbm(x: number, y: number, seed: number, scale: number, octaves = 4) {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let f = 1 / scale;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x * f, y * f, seed + i * 17) * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
}
/** 尾根ノイズ：値が 1 に近いところが山脈の背骨になる */
const ridge = (x: number, y: number, seed: number, scale: number) => 1 - Math.abs(2 * fbm(x, y, seed, scale) - 1);

const seaDist = (x: number, y: number) => Math.hypot((x - SEA.x) / SEA.rx, (y - SEA.y) / SEA.ry);

// ---- 人間界の陸地（楕円の寄せ集め） ----
type Blob = { x: number; y: number; rx: number; ry: number };
const KNOWN: Blob[] = [
  // G検定大陸
  { x: 90, y: 120, rx: 15, ry: 11 },
  { x: 87, y: 106, rx: 14, ry: 11 },
  { x: 93, y: 91, rx: 14, ry: 10 },
  { x: 89, y: 79, rx: 11, ry: 8 },
  // 魔の島
  { x: 92, y: 58, rx: 8, ry: 5 },
  // 統計の島
  { x: 62, y: 100, rx: 7, ry: 12 },
  { x: 59, y: 85, rx: 6, ry: 6 },
  { x: 56, y: 74, rx: 6, ry: 5 },
  // 英語の島
  { x: 125, y: 91, rx: 8, ry: 10 },
  // 投資の島
  { x: 124, y: 121, rx: 10, ry: 7 },
  { x: 125, y: 110, rx: 7, ry: 5 },
  { x: 138, y: 124, rx: 6, ry: 6 },
  { x: 126, y: 132, rx: 8, ry: 4 },
  { x: 114, y: 131, rx: 6, ry: 4 },
  // 鍛冶の島（設計）
  { x: 118, y: 62, rx: 10, ry: 7 },
  { x: 122, y: 70, rx: 12, ry: 5 },
  { x: 129, y: 67, rx: 6, ry: 6 },
];
function knownScore(x: number, y: number) {
  let best = -9;
  for (const b of KNOWN) best = Math.max(best, 1 - Math.hypot((x - b.x) / b.rx, (y - b.y) / b.ry));
  return best + (fbm(x, y, 11, 6) - 0.5) * 0.55;
}

/** 山脈の通り道（人間界）。点列からの距離で山・丘を決める */
const RIDGES: [number, number][][] = [
  [
    [75, 104],
    [78, 96],
    [86, 92],
  ],
  [
    [92, 104],
    [100, 111],
    [104, 106],
  ],
  [
    [57, 82],
    [62, 79],
  ],
];
function distToRidges(x: number, y: number) {
  let best = 99;
  for (const r of RIDGES) {
    for (let i = 0; i < r.length - 1; i++) {
      const [ax, ay] = r[i];
      const [bx, by] = r[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
  }
  return best;
}

function knownBiome(x: number, y: number) {
  const n = fbm(x, y, 21, 5);
  const moist = fbm(x, y, 31, 9);
  if (Math.hypot(x - 92, y - 58) < 10) return n > 0.62 ? CRAG : SWAMP; // 魔の島は毒の沼
  if (x < 70) {
    // 統計の島：北は雪原
    const r = distToRidges(x, y);
    if (y < 91) return r < 1.6 + n ? SNOWPEAK : moist > 0.52 ? PINE : SNOW;
    return moist > 0.58 ? FOREST : GRASS;
  }
  if (x > 110 && y > 110) return n > 0.7 ? HILLS : DESERT; // 投資の島は砂漠
  if (x > 112) return moist > 0.5 ? FOREST : GRASS; // 英語の島
  const r = distToRidges(x, y) + (n - 0.5) * 2;
  if (r < 0.9) return SNOWPEAK;
  if (r < 2.2) return MOUNT;
  if (r < 3.4) return HILLS;
  if (Math.hypot(x - 80, y - 113) < 7 && n > 0.32) return FOREST; // 機械学習の森
  return moist > 0.6 ? FOREST : GRASS;
}

/** 暗黒大陸。方角で気候を分け、山脈を人間界より大きく荒くする */
function darkBiome(x: number, y: number) {
  const ang = Math.atan2(y - SEA.y, x - SEA.x) + (fbm(x, y, 41, 24) - 0.5) * 1.4;
  const r = ridge(x, y, 51, 22);
  const moist = fbm(x, y, 61, 8);
  const north = ang < -Math.PI / 4 && ang > (-3 * Math.PI) / 4;
  const east = ang >= -Math.PI / 4 && ang < Math.PI / 4;
  const south = ang >= Math.PI / 4 && ang < (3 * Math.PI) / 4;
  if (north) return r > 0.82 ? ICEPEAK : r > 0.7 ? SNOWPEAK : moist > 0.6 ? PINE : SNOW;
  if (east) return r > 0.84 ? CRAG : moist > 0.3 ? JUNGLE : FOREST;
  if (south) {
    if (r > 0.86) return VOLCANO;
    if (fbm(x, y, 71, 7) > 0.66) return LAVA;
    return r > 0.74 ? CRAG : ASH;
  }
  return r > 0.8 ? CRAG : moist > 0.62 ? DEADTREE : BONE;
}

export type WorldTiles = {
  tiles: Uint8Array;
  /** マスごとの霧の濃さ 0..1 */
  fog: Float32Array;
  /** 陸地のうち人間界が占める割合 */
  knownShare: number;
};

let cache: WorldTiles | null = null;

export function buildWorld(): WorldTiles {
  if (cache) return cache;
  const tiles = new Uint8Array(W * H);
  const land = new Uint8Array(W * H);
  const dark = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const edge = seaDist(x, y) - 1 - (fbm(x, y, 3, 14) - 0.5) * 0.3;
      if (edge > 0) {
        dark[i] = 1;
        // 暗黒大陸の中の湖と入江
        const lake = fbm(x, y, 81, 12);
        if (lake > 0.7 || (edge < 0.08 && lake > 0.6)) tiles[i] = ABYSS;
        else {
          land[i] = 1;
          tiles[i] = darkBiome(x, y);
        }
      } else if (knownScore(x, y) > 0) {
        land[i] = 1;
        tiles[i] = knownBiome(x, y);
      }
    }
  }
  // 地点のまわりは必ず陸にして、建物が海に浮かないようにする
  for (const a of AREAS) {
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy > 5) continue;
        const i = (a.y + dy) * W + a.x + dx;
        const t = tiles[i];
        if (!land[i] || t === MOUNT || t === SNOWPEAK || t === CRAG || t === FOREST || t === PINE) {
          land[i] = 1;
          tiles[i] = a.site === "castle" ? SWAMP : a.x < 70 && a.y < 91 ? SNOW : a.x > 110 && a.y > 110 ? DESERT : GRASS;
        }
      }
  }
  // 海の深さ：陸からの距離で浅瀬・海・外洋
  const dist = new Int16Array(W * H).fill(99);
  const queue: number[] = [];
  for (let i = 0; i < W * H; i++) if (land[i]) (dist[i] = 0), queue.push(i);
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    const x = i % W;
    const y = (i / W) | 0;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (dist[j] > dist[i] + 1) (dist[j] = dist[i] + 1), queue.push(j);
    }
  }
  for (let i = 0; i < W * H; i++) {
    if (land[i] || dark[i]) continue;
    tiles[i] = dist[i] <= 1 ? SHALLOW : dist[i] <= 5 ? SEA_T : DEEP;
  }
  // 人間界の砂浜
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (!land[i] || dark[i]) continue;
      const t = tiles[i];
      if (t !== GRASS && t !== FOREST) continue;
      const shore = !land[i - 1] || !land[i + 1] || !land[i - W] || !land[i + W];
      if (shore && hash(x, y, 91) > 0.35) tiles[i] = SAND;
    }
  // 境界の渦潮：内海の外縁に点々と
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + 0.2;
    const x = Math.round(SEA.x + Math.cos(a) * SEA.rx * 0.9);
    const y = Math.round(SEA.y + Math.sin(a) * SEA.ry * 0.9);
    const i = y * W + x;
    if (!land[i] && !dark[i]) tiles[i] = WHIRL;
  }
  // 魔の島へ渡る橋
  for (let y = 61; y <= 71; y++) {
    const i = y * W + 91;
    if (!land[i]) tiles[i] = BRIDGE;
  }
  // 霧：暗黒大陸ほど濃く、雲のむらをつける
  const fog = new Float32Array(W * H);
  let knownLand = 0;
  let allLand = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const d = seaDist(x, y);
      const cloud = fbm(x, y, 101, 10);
      let f = 0;
      if (dark[i]) f = Math.min(0.9, 0.32 + (d - 1) * 1.3 + (cloud - 0.5) * 0.7);
      else if (d > 0.82) f = ((d - 0.82) / 0.18) * 0.3 * cloud;
      fog[i] = Math.max(0, f);
      if (land[i]) {
        allLand++;
        if (!dark[i]) knownLand++;
      }
    }
  cache = { tiles, fog, knownShare: knownLand / allLand };
  return cache;
}

// ---- 塗り ----
type RGB = [number, number, number];
const rgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const C = {
  deep: rgb("#173a9c"),
  sea: rgb("#2457c6"),
  shallow: rgb("#3a7ee0"),
  foam: rgb("#8cc4ff"),
  abyss: rgb("#151c4a"),
  abyssFoam: rgb("#3a3f86"),
  sand: rgb("#ecd88e"),
  sandDot: rgb("#c9ad62"),
  grass: rgb("#4caa3a"),
  grassDot: rgb("#3a8a2c"),
  grassLight: rgb("#78cc52"),
  leaf: rgb("#1f6e2a"),
  leafLight: rgb("#3fa13a"),
  trunk: rgb("#6b4420"),
  hill: rgb("#7cc456"),
  hillDark: rgb("#2f7a26"),
  rock: rgb("#a3763f"),
  rockLight: rgb("#d2a466"),
  rockDark: rgb("#5e3e1f"),
  snow: rgb("#e8f0fb"),
  snowDot: rgb("#b6c8e4"),
  ice: rgb("#a9c4ea"),
  iceDark: rgb("#6c88c4"),
  pine: rgb("#1d5a46"),
  swamp: rgb("#6a2f8a"),
  swampLight: rgb("#a35ccc"),
  desert: rgb("#e6c271"),
  desertDark: rgb("#bb9244"),
  lava: rgb("#c2380f"),
  lavaHot: rgb("#ffa424"),
  ash: rgb("#4a3f45"),
  ashDot: rgb("#6c5b60"),
  bone: rgb("#8a8172"),
  boneDot: rgb("#b5ad98"),
  jungle: rgb("#173f36"),
  jungleLeaf: rgb("#0c2e28"),
  jungleLight: rgb("#2c7a5c"),
  crag: rgb("#55546a"),
  cragLight: rgb("#8a89a2"),
  cragDark: rgb("#2c2b3c"),
  plank: rgb("#9a6a38"),
  plankDark: rgb("#5e3e1f"),
  ink: rgb("#10121e"),
};

/** 地形を RGBA に塗る。frame 0/1 で波と溶岩だけ絵が変わる（交互に出して動かす） */
export function paintWorld(tiles: Uint8Array, frame: 0 | 1): Uint8ClampedArray<ArrayBuffer> {
  const PW = W * TILE;
  const buf = new Uint8ClampedArray(new ArrayBuffer(PW * H * TILE * 4));
  for (let ty = 0; ty < H; ty++)
    for (let tx = 0; tx < W; tx++) {
      const t = tiles[ty * W + tx];
      const h = (hash(tx, ty, 7) * 4294967296) >>> 0;
      const ox = tx * TILE;
      const oy = ty * TILE;
      const P = (ix: number, iy: number, c: RGB) => {
        if (ix < 0 || iy < 0 || ix >= TILE || iy >= TILE) return;
        const o = ((oy + iy) * PW + ox + ix) * 4;
        buf[o] = c[0];
        buf[o + 1] = c[1];
        buf[o + 2] = c[2];
        buf[o + 3] = 255;
      };
      const fill = (c: RGB) => {
        for (let iy = 0; iy < TILE; iy++) for (let ix = 0; ix < TILE; ix++) P(ix, iy, c);
      };
      const dots = (c: RGB, n: number) => {
        for (let k = 0; k < n; k++) P((h >>> (k * 6)) & 7, (h >>> (k * 6 + 3)) & 7, c);
      };
      const wave = (base: RGB, foam: RGB, every: number) => {
        fill(base);
        if (h % every !== 0) return;
        const wx = ((h >>> 4) % 4) + frame;
        const wy = ((h >>> 8) % 5) + 1;
        P(wx, wy, foam);
        P(wx + 1, wy - 1, foam);
        P(wx + 2, wy - 1, foam);
        P(wx + 3, wy, foam);
      };
      const tree = (leaf: RGB, light: RGB, base: RGB, trunk: RGB) => {
        fill(base);
        const rows = ["..LLLL..", ".LlLLLL.", "LlLLLLLL", "LLLLLLDL", ".LLLLDD.", "..DTTD..", "...TT...", "........"];
        rows.forEach((r, iy) =>
          [...r].forEach((ch, ix) => {
            if (ch === "L") P(ix, iy, leaf);
            else if (ch === "l") P(ix, iy, light);
            else if (ch === "D") P(ix, iy, C.ink);
            else if (ch === "T") P(ix, iy, trunk);
          }),
        );
      };
      const peak = (light: RGB, dark: RGB, base: RGB, cap?: RGB) => {
        fill(base);
        for (let iy = 0; iy < 7; iy++) {
          const half = Math.floor((iy + 1) * 0.6) + 1;
          for (let ix = 4 - half; ix < 4 + half; ix++) P(ix, iy, cap && iy < 2 ? cap : ix < 4 ? light : dark);
          P(4 - half - 1, iy, C.ink);
          P(4 + half, iy, C.ink);
        }
      };
      switch (t) {
        case DEEP:
          wave(C.deep, C.sea, 7);
          break;
        case SEA_T:
          wave(C.sea, C.foam, 5);
          break;
        case SHALLOW:
          wave(C.shallow, C.foam, 3);
          break;
        case ABYSS:
          wave(C.abyss, C.abyssFoam, 6);
          break;
        case WHIRL: {
          fill(C.deep);
          const ring = frame
            ? ["..ff....", ".f..fff.", "f..f...f", "f.f.ff.f", "f.f..f.f", "f..ff..f", ".f....f.", "..ffff.."]
            : ["..ffff..", ".f....f.", "f..ff..f", "f.f..f.f", "f.ff.f.f", "f...f..f", ".fff..f.", "....ff.."];
          ring.forEach((r, iy) => [...r].forEach((ch, ix) => ch === "f" && P(ix, iy, C.foam)));
          break;
        }
        case SAND:
          fill(C.sand);
          dots(C.sandDot, 2);
          break;
        case GRASS:
          fill(C.grass);
          dots(C.grassDot, 3);
          if (h % 3 === 0) P((h >>> 20) & 7, (h >>> 23) & 7, C.grassLight);
          break;
        case FOREST:
          tree(C.leaf, C.leafLight, C.grass, C.trunk);
          break;
        case PINE: {
          fill(C.snow);
          for (let iy = 0; iy < 6; iy++) {
            const half = (iy % 3) + 1;
            for (let ix = 4 - half; ix < 4 + half; ix++) P(ix, iy, C.pine);
          }
          P(3, 6, C.trunk);
          P(4, 6, C.trunk);
          break;
        }
        case HILLS:
          fill(C.grass);
          for (let ix = 1; ix < 7; ix++) {
            const top = ix === 1 || ix === 6 ? 4 : ix === 2 || ix === 5 ? 3 : 2;
            P(ix, top, C.hillDark);
            for (let iy = top + 1; iy < 6; iy++) P(ix, iy, ix < 4 ? C.hill : C.grass);
          }
          break;
        case MOUNT:
          peak(C.rockLight, C.rock, C.grass);
          break;
        case SNOWPEAK:
          peak(C.rockLight, C.rock, C.grass, C.snow);
          break;
        case ICEPEAK:
          peak(C.snow, C.ice, C.snow, C.snow);
          break;
        case CRAG:
          peak(C.cragLight, C.crag, C.cragDark);
          break;
        case VOLCANO:
          peak(C.ashDot, C.ash, C.ash, frame ? C.lavaHot : C.lava);
          break;
        case SNOW:
          fill(C.snow);
          dots(C.snowDot, 2);
          break;
        case SWAMP:
          fill(C.swamp);
          dots(C.swampLight, 2);
          if (h % 2 === frame) P(2 + ((h >>> 12) & 3), 5, C.swampLight);
          break;
        case DESERT:
          fill(C.desert);
          for (let ix = 0; ix < 5; ix++) P(((h >>> 3) & 3) + ix, ((h >>> 6) & 3) + 2 + (ix > 1 && ix < 4 ? -1 : 0), C.desertDark);
          break;
        case LAVA:
          fill(C.lava);
          dots(C.lavaHot, frame ? 4 : 2);
          break;
        case ASH:
          fill(C.ash);
          dots(C.ashDot, 3);
          break;
        case BONE:
          fill(C.bone);
          dots(C.boneDot, 3);
          break;
        case DEADTREE:
          fill(C.bone);
          for (let iy = 2; iy < 7; iy++) P(4, iy, C.plankDark);
          P(3, 3, C.plankDark);
          P(2, 2, C.plankDark);
          P(5, 4, C.plankDark);
          P(6, 3, C.plankDark);
          break;
        case JUNGLE:
          tree(C.jungleLeaf, C.jungleLight, C.jungle, C.ink);
          break;
        case BRIDGE:
          fill(C.shallow);
          for (let iy = 0; iy < TILE; iy++) {
            for (let ix = 1; ix < 7; ix++) P(ix, iy, iy % 2 ? C.plank : C.plankDark);
            P(0, iy, C.ink);
            P(7, iy, C.ink);
          }
          break;
      }
    }
  return buf;
}
