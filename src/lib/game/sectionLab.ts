/**
 * 断面ラボの計算。寸法を動かして A・I・Z・M・σ・たわみの効き方を見るための純粋な関数。
 * 式と材料の値は vault の knowledge/設計肌感トレーニング（§2〜4）に合わせる。単位は mm・N・MPa。
 */

export type Shape = "rect" | "box" | "pipe" | "bar" | "H";
export type Support = "cant" | "simple";
export type Mat = "steel" | "alu";

export type LabState = {
  shape: Shape;
  /** 幅（図の横）。円は使わない */
  b: number;
  /** 高さ（図の縦）。曲げの軸は水平なので、ここが効く */
  h: number;
  /** 板厚。中実矩形・丸棒は使わない */
  t: number;
  /** 外径（円管・丸棒） */
  d: number;
  /** H形を弱軸（縦に寝かせた向き）で曲げる */
  weak: boolean;
  support: Support;
  /** 荷重 kN */
  F: number;
  /** 長さ mm */
  L: number;
  mat: Mat;
};

export const SHAPES: Record<Shape, string> = { box: "角管", rect: "中実矩形", pipe: "円管", bar: "丸棒", H: "H形" };
export const SUPPORTS: Record<Support, string> = { cant: "片持ち（先端に荷重）", simple: "両端支持（中央に荷重）" };
export const MATS: Record<Mat, { name: string; E: number; rho: number }> = {
  steel: { name: "鋼", E: 210000, rho: 7.85 },
  alu: { name: "アルミ", E: 70000, rho: 2.7 },
};

/** 基準断面：□50×50×t1.2 鋼角管、片持ち L500 先端 1 kN（ノート §2 の基準） */
export const BASE: LabState = { shape: "box", b: 50, h: 50, t: 1.2, d: 60, weak: false, support: "cant", F: 1, L: 500, mat: "steel" };

export type Result = {
  A: number;
  I: number;
  Z: number;
  /** 中立軸から縁までの距離 */
  c: number;
  M: number;
  sigma: number;
  delta: number;
  /** 1 m あたりの質量 kg */
  mass: number;
  /** 式に数字を入れた説明（I と Z） */
  steps: string[];
};

const n = (x: number) => (Math.abs(x) >= 100 ? Math.round(x).toLocaleString() : String(Math.round(x * 100) / 100));

/** 板厚が寸法の半分を超えないように丸める（中が抜けきらないように） */
export function clampT(s: LabState): number {
  const lim = s.shape === "pipe" ? s.d / 2 - 0.1 : s.shape === "H" || s.shape === "box" ? Math.min(s.b, s.h) / 2 - 0.1 : s.t;
  return Math.max(0.5, Math.min(s.t, lim));
}

export function solve(s: LabState): Result {
  const t = clampT(s);
  let A: number, I: number, c: number;
  const steps: string[] = [];
  switch (s.shape) {
    case "rect":
      A = s.b * s.h;
      I = (s.b * s.h ** 3) / 12;
      c = s.h / 2;
      steps.push(`I = b·h³/12 = ${n(s.b)}×${n(s.h)}³/12`);
      break;
    case "box": {
      const bi = s.b - 2 * t, hi = s.h - 2 * t;
      A = s.b * s.h - bi * hi;
      I = (s.b * s.h ** 3 - bi * hi ** 3) / 12;
      c = s.h / 2;
      steps.push(`I = (b·h³ − b'·h'³)/12、b' = b−2t = ${n(bi)}、h' = h−2t = ${n(hi)}`);
      steps.push(`  = (${n(s.b)}×${n(s.h)}³ − ${n(bi)}×${n(hi)}³)/12`);
      break;
    }
    case "pipe": {
      const di = s.d - 2 * t;
      A = (Math.PI / 4) * (s.d ** 2 - di ** 2);
      I = (Math.PI / 64) * (s.d ** 4 - di ** 4);
      c = s.d / 2;
      steps.push(`I = π(D⁴ − d⁴)/64、d = D−2t = ${n(di)}`);
      steps.push(`  = π(${n(s.d)}⁴ − ${n(di)}⁴)/64`);
      break;
    }
    case "bar":
      A = (Math.PI / 4) * s.d ** 2;
      I = (Math.PI / 64) * s.d ** 4;
      c = s.d / 2;
      steps.push(`I = πD⁴/64 = π×${n(s.d)}⁴/64`);
      break;
    case "H": {
      // 板厚はフランジ・ウェブとも t。強軸＝フランジが上下、弱軸＝フランジが左右
      const web = s.h - 2 * t;
      A = 2 * s.b * t + web * t;
      if (!s.weak) {
        I = (s.b * s.h ** 3 - (s.b - t) * web ** 3) / 12;
        c = s.h / 2;
        steps.push(`I = (b·h³ − (b−t)(h−2t)³)/12（フランジが上下＝強軸）`);
        steps.push(`  = (${n(s.b)}×${n(s.h)}³ − ${n(s.b - t)}×${n(web)}³)/12`);
      } else {
        I = (2 * t * s.b ** 3) / 12 + (web * t ** 3) / 12;
        c = s.b / 2;
        steps.push(`I = 2·t·b³/12 + (h−2t)·t³/12（フランジが左右＝弱軸）`);
        steps.push(`  = 2×${n(t)}×${n(s.b)}³/12 + ${n(web)}×${n(t)}³/12`);
      }
      break;
    }
  }
  const Z = I / c;
  steps.push(`  ≈ ${n(I)} mm⁴`);
  steps.push(`Z = I / (縁までの距離 ${n(c)}) ≈ ${n(Z)} mm³`);
  const FN = s.F * 1000;
  const M = s.support === "cant" ? FN * s.L : (FN * s.L) / 4;
  const E = MATS[s.mat].E;
  const delta = (FN * s.L ** 3) / ((s.support === "cant" ? 3 : 48) * E * I);
  return { A, I, Z, c, M, sigma: M / Z, delta, mass: A * MATS[s.mat].rho * 1e-3, steps };
}

export type Key = "A" | "I" | "Z" | "sigma" | "delta";

/** その寸法を1割増やしたとき、各量が何%変わるか（効き方の肌感） */
export function sensitivity(s: LabState, field: "b" | "h" | "t" | "d" | "F" | "L"): Record<Key, number> {
  const a = solve(s);
  const b = solve({ ...s, [field]: s[field] * 1.1 });
  const pct = (x: number, y: number) => (y / x - 1) * 100;
  return { A: pct(a.A, b.A), I: pct(a.I, b.I), Z: pct(a.Z, b.Z), sigma: pct(a.sigma, b.sigma), delta: pct(a.delta, b.delta) };
}

/** URL の ?s=box&b=50... から状態を作る。無い値は基準のまま */
export function fromQuery(q: URLSearchParams): LabState {
  const s = { ...BASE };
  const shape = q.get("s");
  if (shape && shape in SHAPES) s.shape = shape as Shape;
  for (const k of ["b", "h", "t", "d", "F", "L"] as const) {
    const v = Number(q.get(k));
    if (q.get(k) !== null && Number.isFinite(v) && v > 0) s[k] = v;
  }
  if (q.get("weak") === "1") s.weak = true;
  const sup = q.get("sup");
  if (sup === "cant" || sup === "simple") s.support = sup;
  if (q.get("mat") === "alu") s.mat = "alu";
  return s;
}

/** 断面の工房（d1）の問題から開くときの初期値。キーは問題ID */
const BOX50 = "s=box&b=50&h=50&t=1.2";
const LAB: Record<string, string> = {
  "d1-02": BOX50, "d1-03": BOX50, "d1-04": BOX50, "d1-05": BOX50, "d1-06": BOX50, "d1-07": BOX50,
  "d1-08": BOX50, "d1-11": `${BOX50}&sup=simple`, "d1-12": `${BOX50}&F=1&L=500`, "d1-13": `${BOX50}&L=1000`,
  "d1-14": BOX50, "d1-15": "s=rect&b=60&h=20", "d1-16": `${BOX50}&mat=alu`, "d1-17": BOX50, "d1-18": BOX50,
  "d1-19": "s=box&b=50&h=100&t=2", "d1-20": "s=box&b=100&h=50&t=2", "d1-21": "s=rect&b=20&h=60",
  "d1-22": "s=bar&d=20", "d1-23": "s=pipe&d=60&t=1.5", "d1-25": "s=H&b=50&h=100&t=5",
  "d1-26": "s=rect&b=30&h=3", "d1-27": "s=box&b=50&h=100&t=2", "d1-28": BOX50, "d1-29": BOX50,
  "d1-30": BOX50, "d1-31": BOX50, "d1-32": `${BOX50}&sup=simple`, "d1-33": `${BOX50}&sup=simple&F=4&L=1000`,
  "d1-37": "s=rect&b=20&h=60", "d1-43": "s=H&b=50&h=100&t=5", "d1-45": "s=rect&b=20&h=60",
};

export const labFor = (id: string) => (LAB[id] ? `/lab?${LAB[id]}` : undefined);
