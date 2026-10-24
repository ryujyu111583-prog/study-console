/**
 * 学習コンテンツ（コース）の型。
 * 1つのトラック（ML・英語…）を、出題の形が違う「系統」に分ける。
 * 系統ごとに小さなスキルツリーと、修行（ドリル）の出し方と、学習ツールへのリンクを持つ。
 * 新しいコンテンツを足すときは、courses/ にこの形のデータを1ファイル書くだけでいい。
 */
import type { LinkItem } from "../../links";
import type { Track } from "../../tracks";

/**
 * 修行の出し方。
 * - recall  … 問いに口で説明する（従来の「特技」）
 * - card    … 単語カード。表を見て裏を思い出す
 * - qa      … 一問一答。答えを打つと自動で照合、言い換えは自己採点
 * - yesno   … ○×。正誤を自動で判定し、解説を出す
 * - compose … 作文。お題を書いてから見本と見比べる
 * - speed   … 瞬発力。ほかの系統の問題を制限時間つきで出す
 */
export type DrillMode = "recall" | "card" | "qa" | "yesno" | "compose" | "speed";

/** 修行の1問。q が表（問い・お題）、a が裏（答え・見本・解説）。 */
export type DrillItem = {
  q: string;
  a: string;
  /** yesno のとき、q の主張が正しければ true */
  ok?: boolean;
  /** qa で、a のほかに正解とみなす書き方 */
  accept?: string[];
};

/** ツリーのノード。開くと特技（recall）か、修行の問題の束が手に入る。 */
export type NodeDef = {
  id: string;
  /** 論点・単元 */
  topic: string;
  /** 特技（または問題の束）の名前 */
  skill: string;
  /** recall なら唱えるときの問い。それ以外はこの束で何を鍛えるか */
  prompt: string;
  cost: number;
  requires: string[];
  /** ツリー上の位置（列0〜2、段0〜） */
  col: number;
  row: number;
  /** 開くのに要る系統の熟練度 Lv */
  lv?: number;
  /** 開くと修行に加わる問題 */
  items?: DrillItem[];
  /** speed の段位：1問の制限時間（秒） */
  seconds?: number;
  /** Obsidian vault のノート（vault からの相対パス、.md なし） */
  note?: string;
  /** 誤答台帳に入れるときの地方（world.ts の id） */
  area?: string;
};

export type BranchDef = {
  id: string;
  /** 系統の名前（単語・一問一答・作文…） */
  name: string;
  mode: DrillMode;
  /** この系統で何が育つか */
  about: string;
  /** この系統を鍛えるのに使う外部の学習ツール */
  tools: LinkItem[];
  /** speed のとき、問題を借りてくる系統 */
  from?: string[];
  /** 誤答台帳に入れるときの「誤りの型」 */
  mistakeType?: string;
  nodes: NodeDef[];
};

export type Course = {
  track: Track;
  branches: BranchDef[];
};
