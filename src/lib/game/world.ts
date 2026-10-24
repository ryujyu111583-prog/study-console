/**
 * 世界地図。G検定のシラバス9分野（外部400問のカテゴリ）を大陸の街に、
 * 統計・英語・投資を離れ島に置く。各地のボスは「その分野の演習を何問取れたか」で倒す。
 */
import type { Track } from "../tracks";
import type { MonsterLook } from "./sprites";

export type Area = {
  id: string;
  name: string;
  /** 実際の学習範囲 */
  topic: string;
  track: Track;
  /** 地図上の位置（viewBox 360x520） */
  x: number;
  y: number;
  boss: string;
  look: MonsterLook;
  /** ボス戦の問題数と合格ライン */
  questions: number;
  pass: number;
  /** ボス戦で何を解くか */
  howTo: string;
  /** 初回撃破の報酬 */
  xp: number;
  gold: number;
};

const drill10 = "この分野の演習を10問。7問以上で撃破";

export const AREAS: Area[] = [
  { id: "g1", name: "始まりの村", topic: "人工知能とは", track: "ml", x: 52, y: 452, boss: "チューリングプルン", look: { base: "#7ed957", kind: "plain", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g2", name: "歴史の街道", topic: "人工知能をめぐる動向", track: "ml", x: 118, y: 420, boss: "ブームの亡霊", look: { base: "#cfe3ff", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g3", name: "機械学習の森", topic: "機械学習の具体的手法", track: "ml", x: 74, y: 362, boss: "カーネルキング", look: { base: "#3fbf8f", kind: "knight", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g4", name: "深層の洞窟", topic: "ディープラーニングの概要", track: "ml", x: 150, y: 330, boss: "勾配消失プルン", look: { base: "#8a5cd6", kind: "bat", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g5", name: "要素技術の鉱山", topic: "DLの要素技術", track: "ml", x: 96, y: 272, boss: "アテンション将軍", look: { base: "#8f96a8", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g6", name: "応用の大都市", topic: "DLの応用例", track: "ml", x: 176, y: 240, boss: "百の顔のプルン", look: { base: "#c0563a", kind: "rex", crown: true }, questions: 10, pass: 7, howTo: "応用例は400問中101問と最大。10問で7問以上", xp: 400, gold: 300 },
  { id: "g7", name: "社会実装の港町", topic: "AIの社会実装", track: "ml", x: 118, y: 186, boss: "PoC地獄の番人", look: { base: "#c98b4f", kind: "hammer", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g8", name: "法と倫理の神殿", topic: "AIの法律と倫理", track: "ml", x: 196, y: 150, boss: "著作権の門番", look: { base: "#d9b44a", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: "技術に押されて捨てがちな分野。10問で7問以上", xp: 300, gold: 200 },
  { id: "g9", name: "数理の泉", topic: "数理・統計", track: "ml", x: 132, y: 100, boss: "微分の精", look: { base: "#7cc4ff", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "maou", name: "魔王城", topic: "G検定 本番（2027-01-16）", track: "ml", x: 214, y: 56, boss: "魔王ディープ", look: { base: "#5a1a6e", kind: "dragon", crown: true }, questions: 100, pass: 70, howTo: "模試を通しで解き、正答率（%）を入れる。70%以上で撃破", xp: 2000, gold: 1500 },

  { id: "s1", name: "記述統計の村", topic: "平均・分散・相関", track: "stat", x: 40, y: 150, boss: "外れ値オーガ", look: { base: "#b598ff", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "s2", name: "推測統計の塔", topic: "推定・検定・回帰", track: "stat", x: 52, y: 60, boss: "p値の魔女", look: { base: "#b598ff", kind: "mushroom", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "e1", name: "単語の港", topic: "語彙・文法", track: "en", x: 300, y: 300, boss: "不規則動詞の群れ", look: { base: "#7cc4ff", kind: "chain", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "e2", name: "長文の灯台", topic: "リスニング・長文", track: "en", x: 318, y: 220, boss: "早口のセイレーン", look: { base: "#7cc4ff", kind: "bat", crown: true }, questions: 10, pass: 7, howTo: "6 Minute English 1本を聞いて内容確認10問。7問以上", xp: 400, gold: 300 },
  { id: "i1", name: "複利の市場", topic: "複利・分散・インデックス", track: "inv", x: 286, y: 460, boss: "手数料ゴブリン", look: { base: "#ff8fc4", kind: "hammer", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "i2", name: "資産配分の砦", topic: "リスクとリターン・税制", track: "inv", x: 316, y: 392, boss: "暴落の竜巻", look: { base: "#d0507a", kind: "dragon", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
];

/** G検定大陸の街道（地図に描く道の順） */
export const G_ROAD = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "maou"];

export const areaById = (id: string | undefined) => AREAS.find((a) => a.id === id);

export const EXAM_DATE = new Date(2027, 0, 16);

export function daysUntilExam(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((EXAM_DATE.getTime() - today.getTime()) / 86_400_000));
}
