/**
 * 世界地図。G検定のシラバス9分野（外部400問のカテゴリ）を大陸の街に、
 * 統計・英語・投資・設計を離れ島に置く。各地のボスは「その分野の演習を何問取れたか」で倒す。
 * ここまでが「人間界」。そのまわりを、まだ誰も踏破していない暗黒大陸（FRONTIER）が囲む。
 */
import type { Track } from "../tracks";
import type { MonsterLook } from "./sprites";

export type Site =
  | "village"
  | "hut"
  | "ruins"
  | "cave"
  | "mine"
  | "city"
  | "port"
  | "temple"
  | "spring"
  | "castle"
  | "tower"
  | "lighthouse"
  | "market"
  | "fort";

export type Area = {
  id: string;
  name: string;
  /** 実際の学習範囲 */
  topic: string;
  track: Track;
  /** 地図上の位置（マス目。世界は 192x192 マス、overworld.ts） */
  x: number;
  y: number;
  /** 地図に置く建物の絵 */
  site: Site;
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
  { id: "g1", name: "始まりの村", topic: "人工知能とは", track: "ml", x: 84, y: 126, site: "village", boss: "チューリングプルン", look: { base: "#7ed957", kind: "plain", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g2", name: "歴史の街道", topic: "人工知能をめぐる動向", track: "ml", x: 97, y: 121, site: "ruins", boss: "ブームの亡霊", look: { base: "#cfe3ff", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g3", name: "機械学習の森", topic: "機械学習の具体的手法", track: "ml", x: 80, y: 113, site: "hut", boss: "カーネルキング", look: { base: "#3fbf8f", kind: "knight", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g4", name: "深層の洞窟", topic: "ディープラーニングの概要", track: "ml", x: 98, y: 107, site: "cave", boss: "勾配消失プルン", look: { base: "#8a5cd6", kind: "bat", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g5", name: "要素技術の鉱山", topic: "DLの要素技術", track: "ml", x: 81, y: 97, site: "mine", boss: "アテンション将軍", look: { base: "#8f96a8", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g6", name: "応用の大都市", topic: "DLの応用例", track: "ml", x: 95, y: 93, site: "city", boss: "百の顔のプルン", look: { base: "#c0563a", kind: "rex", crown: true }, questions: 10, pass: 7, howTo: "応用例は400問中101問と最大。10問で7問以上", xp: 400, gold: 300 },
  { id: "g7", name: "社会実装の港町", topic: "AIの社会実装", track: "ml", x: 106, y: 85, site: "port", boss: "PoC地獄の番人", look: { base: "#c98b4f", kind: "hammer", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "g8", name: "法と倫理の神殿", topic: "AIの法律と倫理", track: "ml", x: 94, y: 79, site: "temple", boss: "著作権の門番", look: { base: "#d9b44a", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: "技術に押されて捨てがちな分野。10問で7問以上", xp: 300, gold: 200 },
  { id: "g9", name: "数理の泉", topic: "数理・統計", track: "ml", x: 81, y: 82, site: "spring", boss: "微分の精", look: { base: "#7cc4ff", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "maou", name: "魔王城", topic: "G検定 本番（2027-01-16）", track: "ml", x: 92, y: 59, site: "castle", boss: "魔王ディープ", look: { base: "#5a1a6e", kind: "dragon", crown: true }, questions: 100, pass: 70, howTo: "模試を通しで解き、正答率（%）を入れる。70%以上で撃破", xp: 2000, gold: 1500 },

  { id: "s1", name: "記述統計の村", topic: "平均・分散・相関", track: "stat", x: 63, y: 106, site: "village", boss: "外れ値オーガ", look: { base: "#b598ff", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "s2", name: "推測統計の塔", topic: "標本分布・区間推定・最尤推定", track: "stat", x: 60, y: 86, site: "tower", boss: "p値の魔女", look: { base: "#b598ff", kind: "mushroom", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "s3", name: "検定の裁判所", topic: "仮説検定・検出力・χ²検定", track: "stat", x: 67, y: 95, site: "temple", boss: "第二種の亡霊", look: { base: "#9d7bea", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "s4", name: "回帰の工房", topic: "回帰・分散分析・ベイズ", track: "stat", x: 55, y: 74, site: "mine", boss: "多重共線ゴーレム", look: { base: "#7d6bc9", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: "統計検定2級の山場（回帰と分散分析）。10問で7問以上", xp: 500, gold: 400 },
  { id: "e1", name: "単語の港", topic: "語彙・文法", track: "en", x: 121, y: 98, site: "port", boss: "不規則動詞の群れ", look: { base: "#7cc4ff", kind: "chain", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "e2", name: "長文の灯台", topic: "リスニング・長文", track: "en", x: 130, y: 84, site: "lighthouse", boss: "早口のセイレーン", look: { base: "#7cc4ff", kind: "bat", crown: true }, questions: 10, pass: 7, howTo: "6 Minute English 1本を聞いて内容確認10問。7問以上", xp: 400, gold: 300 },
  { id: "i1", name: "複利の市場", topic: "複利・分散・インデックス", track: "inv", x: 118, y: 124, site: "market", boss: "手数料ゴブリン", look: { base: "#ff8fc4", kind: "hammer", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "i2", name: "資産配分の砦", topic: "リスクとリターン・税制", track: "inv", x: 130, y: 117, site: "fort", boss: "暴落の竜巻", look: { base: "#d0507a", kind: "dragon", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "i3", name: "理論の神殿", topic: "分散・効率的市場・CAPM・ファクター", track: "inv", x: 125, y: 110, site: "temple", boss: "フリーランチの番人", look: { base: "#ff8fc4", kind: "knight", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "i4", name: "決算の都", topic: "財務三表・PER/PBR/ROE・DCF", track: "inv", x: 138, y: 124, site: "city", boss: "バリュートラップ", look: { base: "#e07fb0", kind: "mushroom", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "i5", name: "金利の港", topic: "金利と債券・為替・中央銀行", track: "inv", x: 127, y: 131, site: "port", boss: "デュレーション・クラーケン", look: { base: "#c76aa0", kind: "chain", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "i6", name: "暴落の遺跡", topic: "行動ファイナンス・暴落の歴史・資産配分", track: "inv", x: 113, y: 130, site: "ruins", boss: "パニック売りの亡霊", look: { base: "#b04070", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: "暴落の最中の自分に勝つ。10問で7問以上", xp: 500, gold: 400 },
  { id: "d1", name: "断面の工房", topic: "断面と応力・I と Z・たわみ", track: "dsn", x: 112, y: 61, site: "mine", boss: "座屈の巨人", look: { base: "#5fe0c4", kind: "golem", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "d2", name: "単位の砦", topic: "LS-DYNA の単位系・力と応力の換算", track: "dsn", x: 120, y: 58, site: "fort", boss: "桁違いの門番", look: { base: "#49c2a8", kind: "knight", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "d3", name: "計測の灯台", topic: "ロガーと Hz・CFC・ひずみ", track: "dsn", x: 129, y: 65, site: "lighthouse", boss: "エイリアシングの亡霊", look: { base: "#7ce9d3", kind: "ghost", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "d4", name: "板金の村", topic: "板厚の見た目と物差し", track: "dsn", x: 113, y: 69, site: "village", boss: "ペラペラ外板", look: { base: "#3fae96", kind: "plain", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 300, gold: 200 },
  { id: "d5", name: "ねじの塔", topic: "M4〜M14 の寸法・強度区分・トルク", track: "dsn", x: 121, y: 70, site: "tower", boss: "かじりボルト", look: { base: "#5fe0c4", kind: "hammer", crown: true }, questions: 10, pass: 7, howTo: drill10, xp: 400, gold: 300 },
  { id: "d6", name: "品質の市場", topic: "工程能力・QC七つ道具", track: "dsn", x: 130, y: 72, site: "market", boss: "3σの番人", look: { base: "#49c2a8", kind: "mushroom", crown: true }, questions: 10, pass: 7, howTo: "パレート・魚の骨・Cpk の使い分けを問う。10問で7問以上", xp: 400, gold: 300 },
];

/** G検定大陸の街道（地図に描く道の順） */
export const G_ROAD = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", "g9", "maou"];

/** 島どうしの航路（地図に点線で描く） */
export const SEA_LANES: [string, string][] = [
  ["g7", "e1"],
  ["g2", "i1"],
  ["g3", "s1"],
  ["e2", "d3"],
];

/**
 * 暗黒大陸のうわさの地。ボスもクイズも無い、まだ行けない場所。
 * 魔王城（G検定）を倒すと霧が薄れ、名前が読めるようになる。行き先は仮置きなので、決まったら書き換える。
 */
export type Frontier = { id: string; name: string; rumor: string; x: number; y: number };

export const FRONTIER: Frontier[] = [
  { id: "f-north", name: "凍てつく霊峰", rumor: "統計検定 準1級の頂がある という", x: 96, y: 9 },
  { id: "f-east", name: "大樹海と世界樹", rumor: "E資格の 根が 眠っている という", x: 178, y: 112 },
  { id: "f-south", name: "灼熱の火山帯", rumor: "Kaggle の 闘技場が 燃えている という", x: 100, y: 178 },
  { id: "f-west", name: "骨の荒野", rumor: "論文の 原典が 風化している という", x: 14, y: 114 },
  { id: "f-ne", name: "霧の大瀑布", rumor: "生成AIの 源流が 落ちてくる という", x: 168, y: 26 },
  { id: "f-sw", name: "沈んだ大図書館", rumor: "英語の 原書が 沈んでいる という", x: 26, y: 170 },
];

export const areaById = (id: string | undefined) => AREAS.find((a) => a.id === id);

export const EXAM_DATE = new Date(2027, 0, 16);

export function daysUntilExam(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((EXAM_DATE.getTime() - today.getTime()) / 86_400_000));
}
