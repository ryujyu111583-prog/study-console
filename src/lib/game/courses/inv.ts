/** 投資。仕組みの○×で思い込みを潰してから、自分の方針として説明する。 */
import type { Course } from "./types";

const IV = "Learning/Investing/";

export const INV_COURSE: Course = {
  track: "inv",
  branches: [
    {
      id: "iv-yn",
      name: "○×",
      mode: "yesno",
      about: "よくある思い込みを○×で潰す。暴落時に判断を誤らないための土台",
      tools: [
        {
          name: "金融庁 NISA特設ウェブサイト",
          host: "fsa.go.jp",
          url: "https://www.fsa.go.jp/policy/nisa2/",
          note: "NISA の制度の一次情報",
        },
        {
          name: "iDeCo公式サイト",
          host: "ideco-koushiki.jp",
          url: "https://www.ideco-koushiki.jp/",
          note: "iDeCo の仕組みと受け取り方の一次情報",
        },
      ],
      mistakeType: "つなぎ違い（鎖）",
      nodes: [
        {
          id: "iv-yn-base", topic: "仕組みの○×", skill: "見極め", prompt: "複利・分散・税制の6問",
          cost: 0, requires: [], col: 1, row: 0, area: "i1", note: `${IV}Investing Learning MOC`,
          items: [
            { q: "分散投資をすれば、市場全体の下落のリスクも消せる", ok: false, a: "×。分散で減らせるのは個別銘柄のリスクだけ。市場全体のリスクは残る" },
            { q: "年利6%で運用すると、およそ12年で資産が2倍になる", ok: true, a: "○。72の法則で 72÷6＝12" },
            { q: "信託報酬の差が年0.5%でも、長期では大きな差になる", ok: true, a: "○。コストも複利で効いてくる" },
            { q: "新NISAの成長投資枠とつみたて投資枠は、併用できる", ok: true, a: "○。2024年からの新NISAでは併用できる" },
            { q: "iDeCo の資産は、原則いつでも引き出せる", ok: false, a: "×。原則60歳まで引き出せない" },
            { q: "暴落時に慌てて売ると、含み損が損失として確定する", ok: true, a: "○。売らなければ回復を待てる" },
          ],
        },
      ],
    },
    {
      id: "iv-explain",
      name: "説明",
      mode: "recall",
      about: "自分の言葉と自分の方針で説明できるか確かめる",
      tools: [],
      nodes: [
        { id: "iv-comp", topic: "複利", skill: "コンパウンド", prompt: "72の法則で、年利6%なら何年で2倍になるか言える？", cost: 1, requires: [], col: 1, row: 0 },
        { id: "iv-div", topic: "分散投資", skill: "ディバーシファイ", prompt: "分散で減らせるリスクと減らせないリスクの違いは？", cost: 1, requires: ["iv-comp"], col: 0, row: 1 },
        { id: "iv-index", topic: "インデックス投資", skill: "インデックス", prompt: "信託報酬の差が30年後にどれくらい効くか説明できる？", cost: 1, requires: ["iv-comp"], col: 2, row: 1 },
        { id: "iv-rr", topic: "リスクとリターン", skill: "シャープ・アイ", prompt: "標準偏差をリスクと呼ぶ理由と、シャープレシオの意味を言える？", cost: 2, requires: ["iv-div"], col: 0, row: 2 },
        { id: "iv-alloc", topic: "資産配分", skill: "アロケーション", prompt: "株と債券の比率をどう決めるか、自分の場合で言える？", cost: 2, requires: ["iv-rr", "iv-index"], col: 1, row: 3 },
        { id: "iv-tax", topic: "税制（NISA・iDeCo）", skill: "タックス・シールド", prompt: "NISA と iDeCo の違いを、引き出せる時期と節税の仕組みで言える？", cost: 2, requires: ["iv-index"], col: 2, row: 3 },
        { id: "iv-crash", topic: "暴落への備え", skill: "ホールド", prompt: "暴落時にやってはいけないことと、その理由を言える？", cost: 3, requires: ["iv-alloc"], col: 1, row: 4 },
      ],
    },
  ],
};
