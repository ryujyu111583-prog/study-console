/**
 * スキルツリー。ノードは実際の学習論点で、開くと「特技」が手に入る。
 * 特技は「この論点を口で説明できるか」を確かめる呪文。唱えて言えたら経験値が入る（1日1回）。
 * SP は仲間のレベルが1上がるごとに1。
 */
import type { Track } from "../tracks";

export type SkillNode = {
  id: string;
  track: Track;
  /** 論点 */
  topic: string;
  /** 特技の名前 */
  skill: string;
  /** 唱えるときの問い */
  prompt: string;
  cost: number;
  requires: string[];
  /** ツリー上の位置（列0〜2、段0〜） */
  col: number;
  row: number;
};

export const SKILLS: SkillNode[] = [
  // ML（G検定）— G検定MOCの背骨：3点セット → 最適化 → 深層学習 → 生成AI
  { id: "ml-trio", track: "ml", topic: "3点セット", skill: "トリニティ", prompt: "モデル・損失・最適化の3つを、線形回帰を例に説明できる？", cost: 1, requires: [], col: 1, row: 0 },
  { id: "ml-overfit", track: "ml", topic: "過学習のブレーキ", skill: "オーバーフィット・ガード", prompt: "過学習を止める3方向（正則化・単純化・データ追加）を言える？", cost: 1, requires: ["ml-trio"], col: 0, row: 1 },
  { id: "ml-gd", track: "ml", topic: "勾配降下法", skill: "グラディエント", prompt: "勾配降下法で学習率が大きすぎ／小さすぎると何が起きる？", cost: 1, requires: ["ml-trio"], col: 2, row: 1 },
  { id: "ml-l1l2", track: "ml", topic: "L1 / L2 正則化", skill: "スパースの刃", prompt: "L1 が疎になり L2 がならない理由を説明できる？", cost: 1, requires: ["ml-overfit"], col: 0, row: 2 },
  { id: "ml-adam", track: "ml", topic: "SGD → AdaGrad → RMSprop → Adam", skill: "アダムの加護", prompt: "AdaGrad の弱点と、RMSprop がそれをどう直したかを言える？", cost: 2, requires: ["ml-gd"], col: 2, row: 2 },
  { id: "ml-vanish", track: "ml", topic: "誤差逆伝播と勾配消失", skill: "バックプロパ", prompt: "シグモイドで勾配が消える理由を、微分の最大値 0.25 を使って言える？", cost: 2, requires: ["ml-gd"], col: 1, row: 2 },
  { id: "ml-cnn", track: "ml", topic: "CNN と ResNet", skill: "コンボリューション", prompt: "ResNet のスキップ接続が深い層の学習を可能にした理由は？", cost: 2, requires: ["ml-vanish"], col: 0, row: 3 },
  { id: "ml-rnn", track: "ml", topic: "RNN と LSTM", skill: "リカレント", prompt: "LSTM のゲートが RNN の何を解決した？", cost: 2, requires: ["ml-vanish"], col: 2, row: 3 },
  { id: "ml-trans", track: "ml", topic: "Transformer", skill: "アテンション", prompt: "Transformer が並列化できる理由を「逐次性」という言葉で説明できる？", cost: 3, requires: ["ml-rnn"], col: 1, row: 4 },
  { id: "ml-gen", track: "ml", topic: "生成AI", skill: "ジェネシス", prompt: "拡散モデルと LLM がそれぞれ何を学習しているかを言える？", cost: 3, requires: ["ml-trans", "ml-cnn"], col: 1, row: 5 },

  // 統計
  { id: "st-desc", track: "stat", topic: "記述統計", skill: "アベレージ", prompt: "平均・中央値・分散・標準偏差を、外れ値がある例で使い分けられる？", cost: 1, requires: [], col: 1, row: 0 },
  { id: "st-corr", track: "stat", topic: "相関と因果", skill: "コリレーション", prompt: "相関があっても因果と言えない例を1つ出せる？", cost: 1, requires: ["st-desc"], col: 0, row: 1 },
  { id: "st-dist", track: "stat", topic: "確率分布", skill: "ノーマル・ウェーブ", prompt: "正規分布・二項分布・ポアソン分布をどんな現象に使うか言える？", cost: 1, requires: ["st-desc"], col: 2, row: 1 },
  { id: "st-est", track: "stat", topic: "推定と信頼区間", skill: "インターバル", prompt: "95% 信頼区間の正しい意味を言える？", cost: 2, requires: ["st-dist"], col: 2, row: 2 },
  { id: "st-test", track: "stat", topic: "仮説検定", skill: "有意裁判", prompt: "帰無仮説・p値・第1種／第2種の誤りを裁判にたとえて説明できる？", cost: 2, requires: ["st-est"], col: 1, row: 3 },
  { id: "st-reg", track: "stat", topic: "回帰分析", skill: "リグレッション", prompt: "最小二乗法が何を最小にしているか、決定係数が何を表すかを言える？", cost: 2, requires: ["st-corr", "st-est"], col: 0, row: 3 },
  { id: "st-anova", track: "stat", topic: "分散分析と実験計画", skill: "アノーヴァ", prompt: "分散分析で「群間」と「群内」のばらつきを比べる理由は？", cost: 3, requires: ["st-test"], col: 1, row: 4 },
  { id: "st-bayes", track: "stat", topic: "ベイズ推定", skill: "ベイズの瞳", prompt: "事前分布・尤度・事後分布の関係を一文で言える？", cost: 3, requires: ["st-test", "st-reg"], col: 0, row: 5 },
  { id: "st-samp", track: "stat", topic: "データの集め方", skill: "ランダマイズ", prompt: "観察研究と実験研究の違いと、交絡の例を1つ言える？層化抽出と集落抽出の違いは？", cost: 1, requires: ["st-corr"], col: 0, row: 2 },
  { id: "st-clt", track: "stat", topic: "標本分布と中心極限定理", skill: "セントラル・リミット", prompt: "標準偏差と標準誤差の違いを言える？p=1% を ±0.1% で出す MC は約何回？", cost: 2, requires: ["st-dist"], col: 1, row: 2 },
  { id: "st-mle", track: "stat", topic: "最尤推定", skill: "ライクリフッド", prompt: "10本中3本破断の最尤推定値と、小標本の推定値を点で信じてはいけない理由を言える？", cost: 2, requires: ["st-est"], col: 2, row: 3 },
  { id: "st-power", track: "stat", topic: "検出力とサンプルサイズ", skill: "三の法則", prompt: "0本破断で破断確率1%以下を言うには何本要る？効果量が半分なら本数は何倍？", cost: 2, requires: ["st-test"], col: 2, row: 4 },
  { id: "st-chi", track: "stat", topic: "χ²検定と分割表", skill: "カイ・スクエア", prompt: "期待度数の求め方と、2×3 の分割表の自由度を言える？", cost: 2, requires: ["st-test"], col: 2, row: 5 },
  { id: "st-uq", track: "stat", topic: "不確かさの伝播", skill: "ダブルループ", prompt: "偶然的不確かさと認識論的不確かさの違いと、二重ループMCの外側・内側に何を入れるかを言える？", cost: 3, requires: ["st-bayes", "st-mle"], col: 1, row: 6 },

  // 英語
  { id: "en-vocab", track: "en", topic: "語彙", skill: "ボキャブラ", prompt: "今週覚えた単語を5つ、例文つきで言える？", cost: 1, requires: [], col: 1, row: 0 },
  { id: "en-gram", track: "en", topic: "文法の骨格", skill: "グラマー・アーマー", prompt: "関係代名詞と分詞構文で、同じ文を2通りに書ける？", cost: 1, requires: ["en-vocab"], col: 0, row: 1 },
  { id: "en-listen", track: "en", topic: "リスニング", skill: "イヤー・オブ・BBC", prompt: "6 Minute English の今回のテーマを英語で30秒要約できる？", cost: 1, requires: ["en-vocab"], col: 2, row: 1 },
  { id: "en-shadow", track: "en", topic: "シャドーイング", skill: "シャドウ・ボイス", prompt: "スクリプトを見ずに1分シャドーイングできた？", cost: 2, requires: ["en-listen"], col: 2, row: 2 },
  { id: "en-read", track: "en", topic: "長文読解", skill: "スキミング", prompt: "英語の記事1本を、段落ごとに1行で要約できる？", cost: 2, requires: ["en-gram"], col: 0, row: 2 },
  { id: "en-tech", track: "en", topic: "技術英語", skill: "ペーパー・リーダー", prompt: "論文の Abstract を読んで、手法と結果を日本語で一文ずつ言える？", cost: 3, requires: ["en-read"], col: 0, row: 3 },
  { id: "en-speak", track: "en", topic: "スピーキング", skill: "スピーチ", prompt: "自分の仕事（CAE）を英語で1分説明できる？", cost: 3, requires: ["en-shadow", "en-read"], col: 1, row: 4 },

  // 投資
  // 設計 — 手計算の物差し → ねじ → 品質
  { id: "ds-sec", track: "dsn", topic: "断面と比例則", skill: "モノサシ", prompt: "□50×1.2 の A・Z・Mp を言い、h を2倍にしたら I・Z・A がどうなるか言える？", cost: 1, requires: [], col: 1, row: 0 },
  { id: "ds-unit", track: "dsn", topic: "単位系と換算", skill: "ケタヨミ", prompt: "mm-ms-kg 系の力・応力・密度と、1 mm/ms² が何 G かを言える？", cost: 1, requires: ["ds-sec"], col: 0, row: 1 },
  { id: "ds-log", track: "dsn", topic: "ロガーとひずみ", skill: "サンプリング", prompt: "20 kHz の時間刻み、CFC600 の −3dB、鋼 1000 με の応力を言える？", cost: 2, requires: ["ds-unit"], col: 0, row: 2 },
  { id: "ds-bolt", track: "dsn", topic: "ねじの寸法", skill: "ニメンハバ", prompt: "M6・M8・M10・M12 の二面幅とピッチ、有効断面積の暗算を言える？", cost: 1, requires: ["ds-sec"], col: 1, row: 1 },
  { id: "ds-torque", track: "dsn", topic: "強度区分と締付トルク", skill: "トルクアップ", prompt: "10.9 の意味と T = K·d·F、潤滑すると軸力がどうなるかを言える？", cost: 2, requires: ["ds-bolt"], col: 1, row: 2 },
  { id: "ds-thk", track: "dsn", topic: "板厚の物差し", skill: "メキキ", prompt: "カード・CD・硬貨の厚さと、1.0t → 1.2t の剛性比を言える？", cost: 1, requires: ["ds-sec"], col: 2, row: 1 },
  { id: "ds-cp", track: "dsn", topic: "工程能力", skill: "シグマ・アイ", prompt: "Cp と Cpk の違い、1.33 と 1.67 の ppm、Cp が高く Cpk が低いときの打ち手を言える？", cost: 2, requires: ["ds-thk"], col: 2, row: 2 },
  { id: "ds-qc", track: "dsn", topic: "QC七つ道具", skill: "サカナノホネ", prompt: "7つを「見たいこと」で言い分け、管理限界と規格限界の違いを説明できる？", cost: 3, requires: ["ds-cp"], col: 2, row: 3 },
  { id: "iv-comp", track: "inv", topic: "複利", skill: "コンパウンド", prompt: "72の法則で、年利6%なら何年で2倍になるか言える？", cost: 1, requires: [], col: 1, row: 0 },
  { id: "iv-div", track: "inv", topic: "分散投資", skill: "ディバーシファイ", prompt: "分散で減らせるリスクと減らせないリスクの違いは？", cost: 1, requires: ["iv-comp"], col: 0, row: 1 },
  { id: "iv-index", track: "inv", topic: "インデックス投資", skill: "インデックス", prompt: "信託報酬の差が30年後にどれくらい効くか説明できる？", cost: 1, requires: ["iv-comp"], col: 2, row: 1 },
  { id: "iv-rr", track: "inv", topic: "リスクとリターン", skill: "シャープ・アイ", prompt: "標準偏差をリスクと呼ぶ理由と、シャープレシオの意味を言える？", cost: 2, requires: ["iv-div"], col: 0, row: 2 },
  { id: "iv-alloc", track: "inv", topic: "資産配分", skill: "アロケーション", prompt: "株と債券の比率をどう決めるか、自分の場合で言える？", cost: 2, requires: ["iv-rr", "iv-index"], col: 1, row: 3 },
  { id: "iv-tax", track: "inv", topic: "税制（NISA・iDeCo）", skill: "タックス・シールド", prompt: "NISA と iDeCo の違いを、引き出せる時期と節税の仕組みで言える？", cost: 2, requires: ["iv-index"], col: 2, row: 3 },
  { id: "iv-crash", track: "inv", topic: "暴落への備え", skill: "ホールド", prompt: "暴落時にやってはいけないことと、その理由を言える？", cost: 3, requires: ["iv-alloc"], col: 1, row: 4 },
  { id: "iv-emh", track: "inv", topic: "効率的市場仮説と CAPM", skill: "マーケット・アイ", prompt: "アクティブ全体がコスト後に必ず指数に負ける理由と、CAPM で報われるリスクを言える？", cost: 2, requires: ["iv-index"], col: 1, row: 2 },
  { id: "iv-fin", track: "inv", topic: "財務三表と株価指標", skill: "バランスシート", prompt: "営業利益と営業CFの違い、PBR = PER × ROE を使って「なぜ安いか」を言える？", cost: 2, requires: ["iv-index"], col: 2, row: 2 },
  { id: "iv-dcf", track: "inv", topic: "DCF と現在価値", skill: "ディスカウント", prompt: "P = D/(r−g) で、金利が上がると成長株ほど下がる理由を言える？", cost: 3, requires: ["iv-fin", "iv-rate"], col: 2, row: 4 },
  { id: "iv-rate", track: "inv", topic: "金利・為替・中央銀行", skill: "デュレーション", prompt: "金利が上がると債券が下がる理由と、デュレーション9の債券の下落幅を言える？", cost: 2, requires: ["iv-rr"], col: 0, row: 3 },
  { id: "iv-behav", track: "inv", topic: "行動ファイナンス", skill: "ストイック", prompt: "損失回避と処分効果を説明し、自分が仕組みで防いでいることを1つ言える？", cost: 2, requires: ["iv-alloc"], col: 0, row: 4 },
];

export const skillById = (id: string) => SKILLS.find((s) => s.id === id);

export const skillsOf = (track: Track) => SKILLS.filter((s) => s.track === track);

export function canUnlock(node: SkillNode, unlocked: string[], sp: number) {
  return (
    !unlocked.includes(node.id) &&
    node.requires.every((r) => unlocked.includes(r)) &&
    sp >= node.cost
  );
}
