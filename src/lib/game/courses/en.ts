/**
 * 英語。単語・文法・作文を別々の系統で育て、瞬発力で「口から速く出る」まで持っていく。
 * 聞く・読む・話すの実践は、従来どおり口頭で確かめる。
 */
import { tool } from "./tools";
import type { Course } from "./types";

export const EN_COURSE: Course = {
  track: "en",
  branches: [
    {
      id: "en-word",
      name: "単語",
      mode: "card",
      about: "英語を見て意味を言う。迷った単語は YouGlish で実際の発音と使われ方を確かめる",
      tools: [tool("YouGlish"), tool("Weblio 英和・和英辞典"), tool("英辞郎 on the WEB")],
      mistakeType: "用語止まり",
      nodes: [
        {
          id: "en-word-core", topic: "基本の句動詞", skill: "ワードの書・序", prompt: "よく使う句動詞8枚",
          cost: 0, requires: [], col: 1, row: 0, area: "e1",
          items: [
            { q: "figure out", a: "理解する、（解決策を）見つける" },
            { q: "come up with", a: "（案などを）思いつく" },
            { q: "carry out", a: "実行する" },
            { q: "look into", a: "調べる" },
            { q: "put off", a: "延期する" },
            { q: "turn down", a: "断る" },
            { q: "get along with", a: "〜とうまくやっていく" },
            { q: "run out of", a: "〜を使い果たす" },
          ],
        },
        {
          id: "en-word-biz", topic: "仕事の単語", skill: "ワードの書・商", prompt: "会議とメールの単語8枚",
          cost: 1, requires: ["en-word-core"], col: 0, row: 1, area: "e1",
          items: [
            { q: "deadline", a: "締め切り" },
            { q: "agenda", a: "議題、議事日程" },
            { q: "follow up", a: "追って連絡する、フォローする" },
            { q: "estimate", a: "見積もり／見積もる" },
            { q: "requirement", a: "要件" },
            { q: "postpone", a: "延期する" },
            { q: "approve", a: "承認する" },
            { q: "feasible", a: "実現可能な" },
          ],
        },
        {
          id: "en-word-tech", topic: "技術の単語", skill: "ワードの書・工", prompt: "解析と開発の単語8枚",
          cost: 1, requires: ["en-word-core"], col: 2, row: 1, area: "e1",
          items: [
            { q: "robust", a: "頑健な、条件が変わっても安定した" },
            { q: "converge", a: "収束する" },
            { q: "trade-off", a: "一方を得ると他方を失う関係" },
            { q: "iterate", a: "反復する" },
            { q: "boundary condition", a: "境界条件" },
            { q: "validate", a: "妥当性を確認する" },
            { q: "deploy", a: "（システムなどを）配備する、展開する" },
            { q: "benchmark", a: "性能比較の基準／基準と比べる" },
          ],
        },
        {
          id: "en-word-ml", topic: "MLの英語", skill: "ワードの書・機", prompt: "論文によく出る単語7枚",
          cost: 2, requires: ["en-word-tech"], col: 2, row: 2, lv: 2, area: "e2",
          items: [
            { q: "overfitting", a: "過学習" },
            { q: "inference", a: "推論" },
            { q: "gradient", a: "勾配" },
            { q: "loss function", a: "損失関数" },
            { q: "hyperparameter", a: "ハイパーパラメータ（学習前に人が決める設定値）" },
            { q: "ablation study", a: "構成要素を1つずつ外して、それぞれの効果を確かめる実験" },
            { q: "state-of-the-art", a: "最先端の（SOTA）" },
          ],
        },
      ],
    },
    {
      id: "en-grammar",
      name: "文法",
      mode: "yesno",
      about: "英文が正しいかを Yes / No で即答する。間違いの理由まで言えたら本物",
      tools: [tool("Breaking News English"), tool("英辞郎 on the WEB")],
      mistakeType: "問いのずれ",
      nodes: [
        {
          id: "en-gram-tense", topic: "時制", skill: "グラマーの盾・時", prompt: "時制の正誤5問",
          cost: 0, requires: [], col: 1, row: 0,
          items: [
            { q: "I have seen him yesterday.", ok: false, a: "No。yesterday のような過去の一点とは現在完了を使わない → I saw him yesterday." },
            { q: "I've lived here since 2020.", ok: true, a: "Yes。since＋起点で、今まで続いていることを表す" },
            { q: "If it will rain tomorrow, I will stay home.", ok: false, a: "No。条件の if 節は未来のことでも現在形 → If it rains tomorrow" },
            { q: "I'm having lunch now.", ok: true, a: "Yes。「食べる」の意味の have は進行形にできる" },
            { q: "I am knowing the answer.", ok: false, a: "No。know は状態動詞なので進行形にしない → I know the answer." },
          ],
        },
        {
          id: "en-gram-usage", topic: "語法", skill: "グラマーの盾・語", prompt: "動詞の使い方の正誤6問",
          cost: 1, requires: ["en-gram-tense"], col: 0, row: 1,
          items: [
            { q: "I look forward to hear from you.", ok: false, a: "No。この to は前置詞なので -ing → I look forward to hearing from you." },
            { q: "Let's discuss about the plan.", ok: false, a: "No。discuss は他動詞で about が要らない → discuss the plan" },
            { q: "She suggested going by train.", ok: true, a: "Yes。suggest は -ing を目的語にとる" },
            { q: "I'm used to getting up early.", ok: true, a: "Yes。be used to＋-ing で「〜に慣れている」" },
            { q: "Please explain me the result.", ok: false, a: "No。explain は人を直接目的語にとらない → explain the result to me" },
            { q: "He married with her last year.", ok: false, a: "No。marry は他動詞 → He married her last year." },
          ],
        },
        {
          id: "en-gram-rel", topic: "関係詞・分詞", skill: "グラマーの盾・繋", prompt: "文のつなぎ方の正誤6問",
          cost: 1, requires: ["en-gram-tense"], col: 2, row: 1,
          items: [
            { q: "This is the house where I was born.", ok: true, a: "Yes。場所を受ける関係副詞 where" },
            { q: "This is the house which I was born.", ok: false, a: "No。born の後に前置詞が要る → in which / where" },
            { q: "The man talking to Ken is my boss.", ok: true, a: "Yes。現在分詞が後ろから名詞を修飾している" },
            { q: "I was surprising at the news.", ok: false, a: "No。人が驚くときは過去分詞 → I was surprised at the news." },
            { q: "The book written by him is popular.", ok: true, a: "Yes。過去分詞の後置修飾" },
            { q: "That is the reason why I quit.", ok: true, a: "Yes。reason を受ける関係副詞 why" },
          ],
        },
      ],
    },
    {
      id: "en-comp",
      name: "作文",
      mode: "compose",
      about: "日本語のお題を英語で書いてから見本と見比べる。見本と違っても意味が通れば「書けた」でいい",
      tools: [
        tool("英辞郎 on the WEB"),
        {
          name: "DeepL 翻訳",
          host: "deepl.com",
          url: "https://www.deepl.com/translator",
          note: "書いた英文を日本語に戻して、意図どおりに伝わるか確かめる。先に訳させない",
        },
      ],
      mistakeType: "軸が立たない（表）",
      nodes: [
        {
          id: "en-comp-base", topic: "瞬間英作文・基本", skill: "ライティング・序", prompt: "中学文法で言える6文",
          cost: 0, requires: [], col: 1, row: 0,
          items: [
            { q: "私は毎朝コーヒーを飲みます。", a: "I drink coffee every morning." },
            { q: "彼は昨日その会議に出なかった。", a: "He didn't attend the meeting yesterday." },
            { q: "この問題は思ったより難しい。", a: "This problem is harder than I expected." },
            { q: "明日までにこれを終わらせる必要がある。", a: "I need to finish this by tomorrow." },
            { q: "質問があれば、遠慮なく聞いてください。", a: "If you have any questions, feel free to ask." },
            { q: "もっと早く始めていればよかった。", a: "I wish I had started earlier." },
          ],
        },
        {
          id: "en-comp-work", topic: "仕事を語る", skill: "ライティング・工", prompt: "CAEの仕事を説明する6文",
          cost: 1, requires: ["en-comp-base"], col: 0, row: 1,
          items: [
            { q: "私はCAEで製品の強度を解析しています。", a: "I use CAE to analyze the strength of products." },
            { q: "その結果はまだ検証中です。", a: "The results are still being validated." },
            { q: "メッシュを細かくすると精度は上がるが、計算時間が増える。", a: "A finer mesh improves accuracy but increases computation time." },
            { q: "来週までに報告書を送ります。", a: "I'll send you the report by next week." },
            { q: "この方法には2つの利点があります。", a: "This method has two advantages." },
            { q: "結論から言うと、設計を変える必要があります。", a: "To get straight to the point, we need to change the design." },
          ],
        },
        {
          id: "en-comp-opinion", topic: "意見を言う", skill: "ライティング・論", prompt: "主張・理由・例・まとめの5文",
          cost: 2, requires: ["en-comp-base"], col: 2, row: 1, lv: 2,
          items: [
            { q: "その案に賛成です。コストが下がるからです。", a: "I agree with the idea because it reduces costs." },
            { q: "私の考えでは、AIは仕事を奪うというより変えるものだ。", a: "In my opinion, AI will change jobs rather than take them away." },
            { q: "一方で、リスクも考えるべきだ。", a: "On the other hand, we should also consider the risks." },
            { q: "例えば、翻訳ツールで会議が速くなった。", a: "For example, translation tools have made our meetings faster." },
            { q: "まとめると、少しずつ導入するのがよい。", a: "In summary, it's best to introduce it gradually." },
          ],
        },
      ],
    },
    {
      id: "en-speed",
      name: "瞬発力",
      mode: "speed",
      about: "単語・文法・作文で開いた問題を、制限時間つきで出す。考えてから言うのではなく、口が先に動くまで",
      tools: [tool("英辞郎 on the WEB")],
      from: ["en-word", "en-grammar", "en-comp"],
      mistakeType: "索引喪失（索引）",
      nodes: [
        { id: "en-sp-1", topic: "1問12秒", skill: "クイック・レスポンス", prompt: "1問12秒で答える", seconds: 12, cost: 0, requires: [], col: 1, row: 0 },
        { id: "en-sp-2", topic: "1問8秒", skill: "ラピッド・ファイア", prompt: "1問8秒で答える", seconds: 8, cost: 1, requires: ["en-sp-1"], col: 1, row: 1, lv: 2 },
        { id: "en-sp-3", topic: "1問5秒", skill: "ネイティブ・リフレックス", prompt: "1問5秒で答える", seconds: 5, cost: 2, requires: ["en-sp-2"], col: 1, row: 2, lv: 4 },
      ],
    },
    {
      id: "en-practice",
      name: "実践",
      mode: "recall",
      about: "聞く・読む・話すを、教材でやったあとに口で確かめる",
      tools: [tool("BBC Learning English"), tool("6 Minute English（Podcast）"), tool("News in Levels"), tool("TED Talks")],
      nodes: [
        { id: "en-vocab", topic: "語彙", skill: "ボキャブラ", prompt: "今週覚えた単語を5つ、例文つきで言える？", cost: 1, requires: [], col: 1, row: 0 },
        { id: "en-gram", topic: "文法の骨格", skill: "グラマー・アーマー", prompt: "関係代名詞と分詞構文で、同じ文を2通りに書ける？", cost: 1, requires: ["en-vocab"], col: 0, row: 1 },
        { id: "en-listen", topic: "リスニング", skill: "イヤー・オブ・BBC", prompt: "6 Minute English の今回のテーマを英語で30秒要約できる？", cost: 1, requires: ["en-vocab"], col: 2, row: 1 },
        { id: "en-shadow", topic: "シャドーイング", skill: "シャドウ・ボイス", prompt: "スクリプトを見ずに1分シャドーイングできた？", cost: 2, requires: ["en-listen"], col: 2, row: 2 },
        { id: "en-read", topic: "長文読解", skill: "スキミング", prompt: "英語の記事1本を、段落ごとに1行で要約できる？", cost: 2, requires: ["en-gram"], col: 0, row: 2 },
        { id: "en-tech", topic: "技術英語", skill: "ペーパー・リーダー", prompt: "論文の Abstract を読んで、手法と結果を日本語で一文ずつ言える？", cost: 3, requires: ["en-read"], col: 0, row: 3 },
        { id: "en-speak", topic: "スピーキング", skill: "スピーチ", prompt: "自分の仕事（CAE）を英語で1分説明できる？", cost: 3, requires: ["en-shadow", "en-read"], col: 1, row: 4 },
      ],
    },
  ],
};
