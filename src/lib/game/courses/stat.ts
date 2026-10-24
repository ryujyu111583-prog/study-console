/** 統計。論点の説明に、手で出す計算の一問一答を足す。 */
import type { Course } from "./types";

const ST = "Learning/Statistics/";

export const STAT_COURSE: Course = {
  track: "stat",
  branches: [
    {
      id: "st-calc",
      name: "計算",
      mode: "qa",
      about: "暗算で出せる数値を即答する。数字で答えられると、説明もぶれなくなる",
      tools: [
        {
          name: "統計WEB 統計学の時間",
          host: "bellcurve.jp",
          url: "https://bellcurve.jp/statistics/course/",
          note: "単元ごとの解説と例題。答えが出なかった論点をここで読み直す",
        },
        {
          name: "統計検定 公式",
          host: "toukei-kentei.jp",
          url: "https://www.toukei-kentei.jp/",
          note: "過去問と出題範囲の一次情報",
        },
      ],
      mistakeType: "つなぎ違い（鎖）",
      nodes: [
        {
          id: "st-calc-desc", topic: "記述統計の計算", skill: "カリキュレート", prompt: "平均・中央値・分散の6問",
          cost: 0, requires: [], col: 1, row: 0, area: "s1", note: `${ST}統計学 MOC`,
          items: [
            { q: "1, 2, 3, 4, 5 の平均は？", a: "3" },
            { q: "1, 2, 3, 4, 100 の中央値は？", a: "3" },
            { q: "分散が 9 のとき、標準偏差は？", a: "3" },
            { q: "公正なサイコロを1回振ったときの、出目の期待値は？", a: "3.5" },
            { q: "正規分布で、平均±1標準偏差に入る割合はおよそ？", a: "約68%", accept: ["68%", "68", "68％"] },
            { q: "正規分布で、平均±2標準偏差に入る割合はおよそ？", a: "約95%", accept: ["95%", "95", "95％"] },
          ],
        },
        {
          id: "st-calc-test", topic: "推測統計の即答", skill: "インファレンス", prompt: "検定と標準誤差の5問",
          cost: 1, requires: ["st-calc-desc"], col: 1, row: 1, area: "s2", note: `${ST}統計学 MOC`,
          items: [
            { q: "有意水準5%の検定で p値が 0.03 だった。帰無仮説はどうする？", a: "棄却する", accept: ["棄却"] },
            { q: "帰無仮説が正しいのに棄却してしまう誤りは？", a: "第1種の誤り", accept: ["第一種の誤り", "第1種過誤", "αエラー"] },
            { q: "帰無仮説が誤りなのに棄却しない誤りは？", a: "第2種の誤り", accept: ["第二種の誤り", "第2種過誤", "βエラー"] },
            { q: "標本サイズを4倍にすると、標本平均の標準誤差は何倍？", a: "1/2倍", accept: ["1/2", "0.5", "0.5倍", "半分"] },
            { q: "相関係数がとりうる範囲は？", a: "−1 以上 1 以下", accept: ["-1から1", "-1~1", "-1〜1"] },
          ],
        },
      ],
    },
    {
      id: "st-explain",
      name: "説明",
      mode: "recall",
      about: "論点を口で説明できるか確かめる",
      tools: [],
      nodes: [
        { id: "st-desc", topic: "記述統計", skill: "アベレージ", prompt: "平均・中央値・分散・標準偏差を、外れ値がある例で使い分けられる？", cost: 1, requires: [], col: 1, row: 0 },
        { id: "st-corr", topic: "相関と因果", skill: "コリレーション", prompt: "相関があっても因果と言えない例を1つ出せる？", cost: 1, requires: ["st-desc"], col: 0, row: 1 },
        { id: "st-dist", topic: "確率分布", skill: "ノーマル・ウェーブ", prompt: "正規分布・二項分布・ポアソン分布をどんな現象に使うか言える？", cost: 1, requires: ["st-desc"], col: 2, row: 1 },
        { id: "st-est", topic: "推定と信頼区間", skill: "インターバル", prompt: "95% 信頼区間の正しい意味を言える？", cost: 2, requires: ["st-dist"], col: 2, row: 2 },
        { id: "st-test", topic: "仮説検定", skill: "有意裁判", prompt: "帰無仮説・p値・第1種／第2種の誤りを裁判にたとえて説明できる？", cost: 2, requires: ["st-est"], col: 1, row: 3 },
        { id: "st-reg", topic: "回帰分析", skill: "リグレッション", prompt: "最小二乗法が何を最小にしているか、決定係数が何を表すかを言える？", cost: 2, requires: ["st-corr", "st-est"], col: 0, row: 3 },
        { id: "st-anova", topic: "分散分析と実験計画", skill: "アノーヴァ", prompt: "分散分析で「群間」と「群内」のばらつきを比べる理由は？", cost: 3, requires: ["st-test"], col: 1, row: 4 },
        { id: "st-bayes", topic: "ベイズ推定", skill: "ベイズの瞳", prompt: "事前分布・尤度・事後分布の関係を一文で言える？", cost: 3, requires: ["st-test", "st-reg"], col: 0, row: 5 },
      ],
    },
  ],
};
