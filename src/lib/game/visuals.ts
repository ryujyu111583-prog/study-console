/**
 * 問題ごとの図解ページ（claude.ai の Artifact）。問題IDをキーにする。答えた後に「図解で見る」として出す。
 * Artifact は Share で「リンクを知っている人」にしておく（非公開だとスマホでログインを求められる）。
 * 図解を足すときはここに1行足す。
 */
export type Visual = { url: string; label: string };

const ASPECT_K: Visual = { url: "https://claude.ai/artifact/WohhQFvRX1YWaNyA7EJw6P", label: "縦横比 k の効き方" };

const VISUALS: Record<string, Visual> = {
  "d1-15": ASPECT_K,
  "d1-26": ASPECT_K,
};

export const visualFor = (id: string) => VISUALS[id];
