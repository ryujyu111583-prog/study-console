/**
 * ML（G検定）。用語を覚え → 一問一答で引き出し → ○×で紛らわしさを潰し → 説明で背骨を通し → 瞬発力で本番の速さにする。
 */
import { tool } from "./tools";
import type { Course } from "./types";

const ML = "Learning/ML/";

export const ML_COURSE: Course = {
  track: "ml",
  branches: [
    {
      id: "ml-term",
      name: "用語",
      mode: "card",
      about: "用語を見て、意味を一言で言えるようにする。G検定の土台",
      tools: [tool("JDLA G検定 公式ページ"), tool("Hugging Face")],
      mistakeType: "用語止まり",
      nodes: [
        {
          id: "ml-term-basic", topic: "基本の用語", skill: "用語の書・序", prompt: "学習の種類と評価指標の用語8枚",
          cost: 0, requires: [], col: 1, row: 0, area: "g3", note: `${ML}ML基礎01_データからルールを得る_過学習と汎化`,
          items: [
            { q: "教師あり学習", a: "正解ラベル付きのデータで、入力→出力の対応を学ぶ（分類・回帰）" },
            { q: "教師なし学習", a: "ラベルなしのデータから構造を見つける（クラスタリング・次元削減）" },
            { q: "強化学習", a: "環境との試行錯誤で、累積報酬が最大になる行動方針を学ぶ" },
            { q: "汎化性能", a: "未知のデータに対して、どれだけ当たるか" },
            { q: "過学習", a: "訓練データに合わせすぎて、未知のデータで精度が落ちる状態" },
            { q: "交差検証", a: "データを分けて学習用と検証用を入れ替え、性能を見積もる方法" },
            { q: "適合率（Precision）", a: "陽性と予測したうち、実際に陽性だった割合" },
            { q: "再現率（Recall）", a: "実際の陽性のうち、陽性と予測できた割合" },
          ],
        },
        {
          id: "ml-term-dl", topic: "深層学習の用語", skill: "用語の書・深層", prompt: "学習テクニックの用語7枚",
          cost: 1, requires: ["ml-term-basic"], col: 0, row: 1, area: "g4", note: `${ML}ML基礎17_深層学習の学習テクニック`,
          items: [
            { q: "ReLU", a: "入力が正ならそのまま、負なら0を返す活性化関数。勾配消失を起こしにくい" },
            { q: "ドロップアウト", a: "学習時にニューロンをランダムに無効化して、過学習を抑える" },
            { q: "バッチ正規化", a: "ミニバッチごとに層の入力を平均0・分散1に揃え、学習を安定させる" },
            { q: "早期終了（Early Stopping）", a: "検証誤差が下がらなくなった時点で学習を止める" },
            { q: "転移学習", a: "別のタスクで学習済みのモデルを流用し、新しいタスクに合わせて学習し直す" },
            { q: "蒸留", a: "大きなモデル（教師）の出力を、小さなモデル（生徒）に学ばせる" },
            { q: "エポック", a: "訓練データ全体を1周学習すること" },
          ],
        },
        {
          id: "ml-term-gen", topic: "生成AIの用語", skill: "用語の書・生成", prompt: "LLMまわりの用語7枚",
          cost: 1, requires: ["ml-term-basic"], col: 2, row: 1, area: "g5", note: `${ML}ML基礎23_生成モデルとNLP要素技術`,
          items: [
            { q: "ハルシネーション", a: "もっともらしいが、事実と異なる内容を生成すること" },
            { q: "RAG", a: "外部の文書を検索して取り込み、その内容をもとに生成する手法" },
            { q: "ファインチューニング", a: "事前学習済みのモデルを、目的のデータで追加学習すること" },
            { q: "プロンプトエンジニアリング", a: "指示文を工夫して、モデルから望む出力を引き出す技術" },
            { q: "RLHF", a: "人間の好みの評価をもとに、強化学習で出力を調整する手法" },
            { q: "トークン", a: "モデルが文章を処理するときの最小単位" },
            { q: "マルチモーダル", a: "テキスト・画像・音声など、複数の種類のデータを扱えること" },
          ],
        },
        {
          id: "ml-term-law", topic: "法と倫理の用語", skill: "用語の書・法典", prompt: "法規とELSIの用語6枚",
          cost: 2, requires: ["ml-term-dl", "ml-term-gen"], col: 1, row: 2, lv: 2, area: "g8", note: `${ML}ML基礎20_AIの社会実装と法律_倫理`,
          items: [
            { q: "著作権法30条の4", a: "著作物を、思想や感情の享受を目的としない情報解析などに使うことを、原則として認める規定" },
            { q: "ELSI", a: "倫理的・法的・社会的課題（Ethical, Legal and Social Issues）" },
            { q: "説明可能AI（XAI）", a: "AIの判断の根拠を、人が理解できる形で示す技術・考え方" },
            { q: "アルゴリズムバイアス", a: "学習データや設計の偏りが、不公平な判断として出ること" },
            { q: "個人情報", a: "生存する個人に関する情報で、特定の個人を識別できるもの" },
            { q: "ディープフェイク", a: "深層学習で作った、本物と見分けにくい偽の画像・動画・音声" },
          ],
        },
      ],
    },
    {
      id: "ml-qa",
      name: "一問一答",
      mode: "qa",
      about: "問いから答えを自分で引き出す。打った答えが合っていれば自動で正解になる",
      tools: [tool("Study-AI G検定模擬テスト"), tool("JDLA G検定 公式ページ")],
      mistakeType: "索引喪失（索引）",
      nodes: [
        {
          id: "ml-qa-history", topic: "AIの歴史", skill: "年代記", prompt: "ブームと冬、節目の出来事6問",
          cost: 0, requires: [], col: 1, row: 0, area: "g2", note: `${ML}ML基礎18_AIの歴史_3つのブームと2つの冬`,
          items: [
            { q: "「人工知能」という言葉が初めて使われた、1956年の会議は？", a: "ダートマス会議", accept: ["ダートマス"] },
            { q: "第1次AIブームの中心だった技術は？", a: "推論と探索", accept: ["探索と推論"] },
            { q: "第2次AIブームの中心だった、専門家の知識をルールとして組み込むシステムは？", a: "エキスパートシステム" },
            { q: "今の課題に関係のある事柄だけを選び出すのが難しい、という問題は？", a: "フレーム問題" },
            { q: "記号と、それが指す実世界の意味を結びつけられない、という問題は？", a: "シンボルグラウンディング問題", accept: ["記号接地問題"] },
            { q: "2012年のILSVRCで、深層学習の有効性を示したモデルは？", a: "AlexNet" },
          ],
        },
        {
          id: "ml-qa-model", topic: "モデルと論文", skill: "系譜", prompt: "代表的なモデル名6問",
          cost: 1, requires: ["ml-qa-history"], col: 0, row: 1, area: "g5", note: `${ML}ML基礎16_AttentionとTransformer`,
          items: [
            { q: "2017年の論文「Attention Is All You Need」で提案されたモデルは？", a: "Transformer", accept: ["トランスフォーマー"] },
            { q: "スキップ接続で、非常に深いネットワークの学習を可能にしたモデルは？", a: "ResNet" },
            { q: "生成器と識別器を競わせて学習する生成モデルは？", a: "GAN", accept: ["敵対的生成ネットワーク"] },
            { q: "潜在変数を確率分布として扱い、そこから復元する生成モデルは？", a: "VAE", accept: ["変分オートエンコーダ"] },
            { q: "文の前後両方向の文脈から事前学習する、Google のモデルは？", a: "BERT" },
            { q: "画像をパッチに分けて Transformer で処理するモデルは？", a: "Vision Transformer", accept: ["ViT"] },
          ],
        },
        {
          id: "ml-qa-math", topic: "数理の定番", skill: "数理の泉", prompt: "活性化関数と損失関数6問",
          cost: 1, requires: ["ml-qa-history"], col: 2, row: 1, area: "g9", note: `${ML}ML基礎13_勾配消失とReLU`,
          items: [
            { q: "シグモイド関数の微分の最大値は？", a: "0.25", accept: ["1/4"] },
            { q: "2値分類の出力層によく使う活性化関数は？", a: "シグモイド関数", accept: ["シグモイド"] },
            { q: "多クラス分類の出力を確率に変える関数は？", a: "ソフトマックス関数", accept: ["ソフトマックス"] },
            { q: "回帰でよく使う損失関数は？", a: "平均二乗誤差", accept: ["MSE", "二乗誤差"] },
            { q: "分類でよく使う損失関数は？", a: "交差エントロピー誤差", accept: ["交差エントロピー", "クロスエントロピー"] },
            { q: "勾配降下法で、1回の更新幅を決めるハイパーパラメータは？", a: "学習率" },
          ],
        },
      ],
    },
    {
      id: "ml-yn",
      name: "○×",
      mode: "yesno",
      about: "紛らわしい言い回しを即座に見抜く。本番の「適切でないものを選べ」に効く",
      tools: [tool("Study-AI G検定模擬テスト")],
      mistakeType: "問いのずれ",
      nodes: [
        {
          id: "ml-yn-basic", topic: "機械学習の○×", skill: "見破りの眼", prompt: "基礎の言い回し5問",
          cost: 0, requires: [], col: 1, row: 0, area: "g3",
          items: [
            { q: "k-means は教師あり学習の手法である", ok: false, a: "×。ラベルを使わないクラスタリングなので教師なし学習" },
            { q: "L1正則化は、重みの一部をちょうど0にしやすい", ok: true, a: "○。疎な解になり、特徴選択の効果がある" },
            { q: "学習率は大きいほど、必ず速く良い解にたどり着く", ok: false, a: "×。大きすぎると振動・発散する" },
            { q: "訓練誤差が小さく検証誤差が大きいのは、過学習のサインである", ok: true, a: "○。訓練データに合わせすぎている" },
            { q: "再現率を上げれば、適合率も必ず上がる", ok: false, a: "×。一般に両者はトレードオフ" },
          ],
        },
        {
          id: "ml-yn-dl", topic: "深層学習の○×", skill: "見破りの眼・深層", prompt: "深層学習の言い回し6問",
          cost: 1, requires: ["ml-yn-basic"], col: 1, row: 1, area: "g4",
          items: [
            { q: "ReLU は入力が負のとき、勾配が0になる", ok: true, a: "○。そのまま学習が止まるニューロンが出ることがある" },
            { q: "ドロップアウトは、推論時にもニューロンをランダムに無効化する", ok: false, a: "×。無効化するのは学習時だけ" },
            { q: "RNN は系列を1ステップずつ処理するため、並列化しにくい", ok: true, a: "○。Transformer はこの逐次性をなくした" },
            { q: "Transformer は畳み込み層を中心に構成されている", ok: false, a: "×。中心は Attention（自己注意）" },
            { q: "バッチ正規化には、学習の安定化に加えて正則化に似た効果もある", ok: true, a: "○。主目的は学習の安定化" },
            { q: "GAN の識別器は、本物か生成物かを見分けるように学習する", ok: true, a: "○。生成器はそれを騙すように学習する" },
          ],
        },
      ],
    },
    {
      id: "ml-explain",
      name: "説明",
      mode: "recall",
      about: "論点を口で説明できるか確かめる。G検定MOCの背骨：3点セット → 最適化 → 深層学習 → 生成AI",
      tools: [tool("JDLA 学習コンテンツ紹介")],
      nodes: [
        { id: "ml-trio", topic: "3点セット", skill: "トリニティ", prompt: "モデル・損失・最適化の3つを、線形回帰を例に説明できる？", cost: 1, requires: [], col: 1, row: 0 },
        { id: "ml-overfit", topic: "過学習のブレーキ", skill: "オーバーフィット・ガード", prompt: "過学習を止める3方向（正則化・単純化・データ追加）を言える？", cost: 1, requires: ["ml-trio"], col: 0, row: 1 },
        { id: "ml-gd", topic: "勾配降下法", skill: "グラディエント", prompt: "勾配降下法で学習率が大きすぎ／小さすぎると何が起きる？", cost: 1, requires: ["ml-trio"], col: 2, row: 1 },
        { id: "ml-l1l2", topic: "L1 / L2 正則化", skill: "スパースの刃", prompt: "L1 が疎になり L2 がならない理由を説明できる？", cost: 1, requires: ["ml-overfit"], col: 0, row: 2 },
        { id: "ml-adam", topic: "SGD → AdaGrad → RMSprop → Adam", skill: "アダムの加護", prompt: "AdaGrad の弱点と、RMSprop がそれをどう直したかを言える？", cost: 2, requires: ["ml-gd"], col: 2, row: 2 },
        { id: "ml-vanish", topic: "誤差逆伝播と勾配消失", skill: "バックプロパ", prompt: "シグモイドで勾配が消える理由を、微分の最大値 0.25 を使って言える？", cost: 2, requires: ["ml-gd"], col: 1, row: 2 },
        { id: "ml-cnn", topic: "CNN と ResNet", skill: "コンボリューション", prompt: "ResNet のスキップ接続が深い層の学習を可能にした理由は？", cost: 2, requires: ["ml-vanish"], col: 0, row: 3 },
        { id: "ml-rnn", topic: "RNN と LSTM", skill: "リカレント", prompt: "LSTM のゲートが RNN の何を解決した？", cost: 2, requires: ["ml-vanish"], col: 2, row: 3 },
        { id: "ml-trans", topic: "Transformer", skill: "アテンション", prompt: "Transformer が並列化できる理由を「逐次性」という言葉で説明できる？", cost: 3, requires: ["ml-rnn"], col: 1, row: 4 },
        { id: "ml-gen", topic: "生成AI", skill: "ジェネシス", prompt: "拡散モデルと LLM がそれぞれ何を学習しているかを言える？", cost: 3, requires: ["ml-trans", "ml-cnn"], col: 1, row: 5 },
      ],
    },
    {
      id: "ml-speed",
      name: "瞬発力",
      mode: "speed",
      about: "用語・一問一答・○×で開いた問題を、制限時間つきで出す。迷わず答えが出るまで回す",
      tools: [tool("Study-AI G検定模擬テスト")],
      from: ["ml-term", "ml-qa", "ml-yn"],
      mistakeType: "索引喪失（索引）",
      nodes: [
        { id: "ml-sp-1", topic: "1問15秒", skill: "早読み", prompt: "1問15秒で答える", seconds: 15, cost: 0, requires: [], col: 1, row: 0 },
        { id: "ml-sp-2", topic: "1問10秒", skill: "疾風", prompt: "1問10秒で答える", seconds: 10, cost: 1, requires: ["ml-sp-1"], col: 1, row: 1, lv: 2 },
        { id: "ml-sp-3", topic: "1問5秒", skill: "電光石火", prompt: "1問5秒で答える", seconds: 5, cost: 2, requires: ["ml-sp-2"], col: 1, row: 2, lv: 4 },
      ],
    },
  ],
};
