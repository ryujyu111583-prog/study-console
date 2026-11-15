/**
 * 問題ごとの図解ページ（claude.ai の Artifact）。問題IDをキーにする。答えた後に「図解で見る」として出す。
 * Artifact は Share で「リンクを知っている人」にしておく（非公開だとスマホでログインを求められる）。
 * 図解を足すときはここに1行足す。
 */
export type Visual = { url: string; label: string };

const ASPECT_K: Visual = { url: "https://claude.ai/artifact/WohhQFvRX1YWaNyA7EJw6P", label: "縦横比 k の効き方" };

const QC7: Visual = { url: "https://claude.ai/artifact/78BzSBwZ15AFQyzThhJgj5", label: "QC七つ道具 図解" };

const VISUALS: Record<string, Visual> = {
  "d1-15": ASPECT_K,
  "d1-26": ASPECT_K,
  // d6-14 は管理限界と規格限界、d6-15〜24 は QC七つ道具の選び方
  "d6-14": QC7,
  "d6-15": QC7,
  "d6-16": QC7,
  "d6-17": QC7,
  "d6-18": QC7,
  "d6-19": QC7,
  "d6-20": QC7,
  "d6-21": QC7,
  "d6-22": QC7,
  "d6-23": QC7,
  "d6-24": QC7,
};

export const visualFor = (id: string) => VISUALS[id];
