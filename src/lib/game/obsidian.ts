/**
 * Obsidian vault のノートを開くリンク。スマホなら Obsidian アプリが開く。
 * Obsidian は Dropbox の vault-share フォルダ全体を1つの vault として開いていて、
 * ノートはその中の ryuju/ の下にある（2026-10-24 に PC の obsidian.json で確認）。
 * 端末によって違うときは NEXT_PUBLIC_OBSIDIAN_VAULT／NEXT_PUBLIC_OBSIDIAN_PREFIX で変える。
 */
export const VAULT = process.env.NEXT_PUBLIC_OBSIDIAN_VAULT ?? "vault-share";
const PREFIX = process.env.NEXT_PUBLIC_OBSIDIAN_PREFIX ?? "ryuju/";

/** path は ryuju/ からの相対パス（.md なし） */
export const noteUrl = (path: string) =>
  `obsidian://open?vault=${encodeURIComponent(VAULT)}&file=${encodeURIComponent(PREFIX + path)}`;

const ML = "Learning/ML/";
const ST = "Learning/Statistics/";
const IV = "Learning/Investing/";

/** スキル・地方 → ノート。対応するノートがまだ無いもの（英語）は載せない。 */
export const NOTES: Record<string, string> = {
  // スキル
  "ml-trio": `${ML}ML基礎04_線形回帰と3点セット`,
  "ml-overfit": `${ML}ML基礎01_データからルールを得る_過学習と汎化`,
  "ml-gd": `${ML}ML基礎06_勾配降下法`,
  "ml-l1l2": `${ML}ML基礎17_深層学習の学習テクニック`,
  "ml-adam": `${ML}ML基礎R06_復習セッション記録_第4-10回再定着`,
  "ml-vanish": `${ML}ML基礎13_勾配消失とReLU`,
  "ml-cnn": `${ML}ML基礎14_CNN`,
  "ml-rnn": `${ML}ML基礎15_RNNとLSTM`,
  "ml-trans": `${ML}ML基礎16_AttentionとTransformer`,
  "ml-gen": `${ML}ML基礎23_生成モデルとNLP要素技術`,
  "st-desc": `${ST}統計学 MOC`,
  "st-corr": `${ST}統計学 MOC`,
  "st-dist": `${ST}統計学 MOC`,
  "st-est": `${ST}統計学 MOC`,
  "st-test": `${ST}統計学 MOC`,
  "st-reg": `${ST}統計学 MOC`,
  "st-anova": `${ST}統計学 MOC`,
  "st-bayes": `${ST}統計学 MOC`,
  "iv-comp": `${IV}投資基礎01_なぜ投資するのか_インフレと複利`,
  "iv-div": `${IV}投資基礎02_リスクとリターン_リスクは振れ幅`,
  "iv-index": `${IV}投資基礎05_投資信託とインデックス_コストの話`,
  "iv-rr": `${IV}投資基礎02_リスクとリターン_リスクは振れ幅`,
  "iv-alloc": `${IV}わが家の投資ポリシー`,
  "iv-tax": `${IV}投資基礎06_NISAとiDeCo_器と中身`,
  "iv-crash": `${IV}Investing Learning MOC`,

  // 地方
  g1: `${ML}ML基礎C1_直前チートシート`,
  g2: `${ML}ML基礎18_AIの歴史_3つのブームと2つの冬`,
  g3: `${ML}ML基礎R06_復習セッション記録_第4-10回再定着`,
  g4: `${ML}ML基礎R02_復習セッション記録_第11-14回再定着`,
  g5: `${ML}ML基礎R03_復習セッション記録_第15-17回再定着`,
  g6: `${ML}ML基礎C2_応用例チートシート`,
  g7: `${ML}ML基礎21_AIプロジェクトの社会実装`,
  g8: `${ML}ML基礎20_AIの社会実装と法律_倫理`,
  g9: `${ML}ML基礎C1_直前チートシート`,
  maou: `${ML}G検定 MOC`,
  s1: `${ST}統計学×CAE カリキュラム`,
  s2: `${ST}統計学×CAE カリキュラム`,
  i1: `${IV}投資基礎01_なぜ投資するのか_インフレと複利`,
  i2: `${IV}投資基礎02_リスクとリターン_リスクは振れ幅`,

  // 台帳そのもの
  ledger: `${ML}誤答台帳`,
};

export const noteFor = (id: string | undefined) => (id ? NOTES[id] : undefined);
