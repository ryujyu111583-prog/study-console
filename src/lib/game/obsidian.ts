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
const DS = "knowledge/設計肌感トレーニング";

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
  "st-desc": `${ST}統計S16_1変数データの残り_四分位・箱ひげ図・時系列`,
  "st-corr": `${ST}統計学×CAE カリキュラム`,
  "st-dist": `${ST}統計学×CAE カリキュラム`,
  "st-samp": `${ST}統計S15_データの集め方_観察研究と実験と標本調査`,
  "st-clt": `${ST}統計S05_標本分布と中心極限定理`,
  "st-est": `${ST}統計S06_区間推定_n3の強度をどこまで信じるか`,
  "st-mle": `${ST}統計S07_最尤推定_Weibullをクーポンから出す`,
  "st-test": `${ST}統計S08_仮説検定_メッシュを変えたら最大荷重は変わったか`,
  "st-power": `${ST}統計S09_検出力とサンプルサイズ_P1パーセントを検証するには何本要るか`,
  "st-chi": `${ST}統計S10_カイ二乗検定_破断モードは条件で変わるか`,
  "st-reg": `${ST}統計S11_回帰分析と回帰診断_RSMの係数は信用できるか`,
  "st-anova": `${ST}統計S12_分散分析と実験計画_縁石衝突DOEの主効果と交互作用`,
  "st-bayes": `${ST}統計S13_ガウス過程とベイズ推定_Krigingの予測分散`,
  "st-uq": `${ST}統計S14_モンテカルロと不確かさ伝播_二重ループで破断確率`,
  "iv-comp": `${IV}投資基礎01_なぜ投資するのか_インフレと複利`,
  "iv-div": `${IV}投資基礎02_リスクとリターン_リスクは振れ幅`,
  "iv-index": `${IV}投資基礎05_投資信託とインデックス_コストの話`,
  "iv-rr": `${IV}投資基礎02_リスクとリターン_リスクは振れ幅`,
  "iv-alloc": `${IV}わが家の投資ポリシー`,
  "iv-tax": `${IV}投資基礎06_NISAとiDeCo_器と中身`,
  "iv-crash": `${IV}投資基礎20_暴落の歴史_1929からコロナまで`,
  "iv-emh": `${IV}投資基礎08_効率的市場仮説とSPIVA_プロはなぜ指数に負けるか`,
  "iv-fin": `${IV}投資基礎11_財務三表_EDINETで実物を開く`,
  "iv-dcf": `${IV}投資基礎13_企業価値とDCF入門_株価は将来の利益の現在価値`,
  "iv-rate": `${IV}投資基礎15_金利と債券価格_金利が上がると債券は下がる`,
  "iv-behav": `${IV}投資基礎19_行動ファイナンス_損失回避・処分効果・過信`,

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
  ...Object.fromEntries(["d1", "d2", "d3", "d4", "d5", "d6", "ds-sec", "ds-unit", "ds-log", "ds-thk", "ds-bolt", "ds-torque", "ds-cp", "ds-qc"].map((id) => [id, DS])),
  s1: `${ST}統計学×CAE カリキュラム`,
  s2: `${ST}統計S06_区間推定_n3の強度をどこまで信じるか`,
  s3: `${ST}統計S08_仮説検定_メッシュを変えたら最大荷重は変わったか`,
  s4: `${ST}統計S11_回帰分析と回帰診断_RSMの係数は信用できるか`,
  i1: `${IV}投資基礎01_なぜ投資するのか_インフレと複利`,
  i2: `${IV}投資基礎02_リスクとリターン_リスクは振れ幅`,
  i3: `${IV}投資基礎07_分散投資と相関_組み合わせると振れ幅だけ下がる`,
  i4: `${IV}投資基礎11_財務三表_EDINETで実物を開く`,
  i5: `${IV}投資基礎15_金利と債券価格_金利が上がると債券は下がる`,
  i6: `${IV}投資基礎19_行動ファイナンス_損失回避・処分効果・過信`,

  // 台帳そのもの
  ledger: `${ML}誤答台帳`,
};

export const noteFor = (id: string | undefined) => (id ? NOTES[id] : undefined);
