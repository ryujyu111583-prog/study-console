"use client";

import NoteLink from "@/components/game/NoteLink";

/**
 * ギルド（依頼所）：アプリの外で学ぶための入口。
 * 外部サイトの成績は自動では取れないので、結果の画面を Claude に読ませて反映する（報告の流れは下の案内）。
 */
type Quest = {
  title: string;
  where: string;
  url?: string;
  note?: string;
  what: string;
  report: string;
};

const NOTEBOOK = "https://notebook.google.com/notebook/fa8c5812-3fc1-4ccc-90cf-772742ef47c3";

const GROUPS: { label: string; color: string; quests: Quest[] }[] = [
  {
    label: "G検定",
    color: "var(--ml)",
    quests: [
      { title: "NotebookLM のクイズ", where: "NotebookLM「G検定」", url: NOTEBOOK, what: "Studio →「クイズ」。vault のノート33件から出題される", report: "結果画面のスクショ" },
      { title: "NotebookLM の単語帳", where: "NotebookLM「G検定」", url: NOTEBOOK, what: "Studio →「フラッシュカード」。覚えた枚数を数える", report: "終わった画面のスクショ" },
      { title: "音声解説を聞く", where: "NotebookLM「G検定」", url: NOTEBOOK, what: "通勤中に1本。聞き終えたら、何の話だったかを一言で", report: "聞いたテーマと分数" },
      { title: "公式の例題", where: "JDLA", url: "https://www.jdla.org/certificate/general/", what: "本番に近い難易度を確かめる", report: "正答数" },
      { title: "MOC で次にやることを決める", where: "vault", note: "Learning/ML/G検定 MOC", what: "現在地と次の演習を確認する", report: "不要" },
    ],
  },
  {
    label: "統計",
    color: "var(--stat)",
    quests: [
      { title: "カリキュラムを1回分進める", where: "vault", note: "Learning/Statistics/統計学×CAE カリキュラム", what: "S01〜S16 の「問い」に答え、答え合わせを開く", report: "回の番号と、自分の答えが合ったか" },
      { title: "動画で1単元（2級向け）", where: "YouTube「とけたろうチャンネル」", url: "https://www.youtube.com/results?search_query=%E3%81%A8%E3%81%91%E3%81%9F%E3%82%8D%E3%81%86+%E7%B5%B1%E8%A8%88%E6%A4%9C%E5%AE%9A2%E7%B4%9A", what: "その日の回（S05〜S16）の単元を1本だけ。見たら同じ回の「問い」を解く。動画だけで終えない", report: "見た単元と、解いた問いの正誤" },
      { title: "直感をつかむ（英語・字幕あり）", where: "YouTube「StatQuest」「3Blue1Brown」", url: "https://www.youtube.com/@statquest", what: "p値・検出力・中心極限定理など、つまずいた概念だけ。各回のノートの「YouTubeで見る」に検索語がある", report: "見た動画と、一言で言えるようになったこと" },
      { title: "統計検定の公式情報", where: "統計検定", url: "https://www.toukei-kentei.jp/", what: "2級の出題範囲と試験日を確かめる", report: "不要" },
    ],
  },
  {
    label: "英語",
    color: "var(--en)",
    quests: [
      { title: "6 Minute English を1本", where: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish", what: "聞く → スクリプトで確かめる → 1分シャドーイング", report: "回のタイトルと、内容クイズの正答数" },
    ],
  },
  {
    label: "投資",
    color: "var(--inv)",
    quests: [
      { title: "投資基礎を1回分読む", where: "vault", note: "Learning/Investing/Investing Learning MOC", what: "各回の「Chromeで確認する」まで終える（07〜21 は 2026-10-25 に追加）", report: "回の番号" },
      { title: "金融政策の会見を見る", where: "日本銀行", url: "https://www.boj.or.jp/mopo/mpmdeci/index.htm", what: "決定会合の後に1回。何を気にしているかを1行メモ（投資基礎17）", report: "会合の日付と1行メモ" },
      { title: "SPIVA で負け率を確かめる", where: "S&P Dow Jones Indices", url: "https://www.spglobal.com/spdji/en/spiva/article/spiva-japan/", what: "自分の投信に近いカテゴリーの15年の負け率を書き写す（投資基礎08）", report: "カテゴリーと負け率" },
      { title: "iDeCo の上限を確かめる", where: "iDeCo 公式", url: "https://www.ideco-koushiki.jp/", what: "2026-12 改正後の自分の上限（投資基礎06・21）", report: "自分の上限額" },
      { title: "NISA の最新情報", where: "金融庁", url: "https://www.fsa.go.jp/policy/nisa2/index.html", what: "制度の変更がないか確かめる", report: "不要" },
    ],
  },
  {
    label: "設計",
    color: "var(--dsn)",
    quests: [
      { title: "10秒ドリルを5問", where: "設計肌感トレーナー", url: "https://claude.ai/artifact/SUhjE2fFNjvmrrTLhJVbTf", what: "数字を入れる見積もりドリル。1問10秒以内。断面ラボと板厚の校正もここ", report: "正答数と問題数" },
      { title: "FE の前に手計算で予想する", where: "vault", note: "knowledge/設計肌感トレーニング", what: "実務で1断面だけ M/Z を先に出し、SECFORC と比べて誤差を残す", report: "断面と誤差の%" },
      { title: "ボルトを実物で確かめる", where: "手元の工具", what: "六角の二面幅をスパナかノギスで確かめ、呼びとピッチを当てる", report: "当てた本数" },
      { title: "仕事の1件を判断の順番で片付ける", where: "vault", note: "knowledge/設計判断ハンドブック", what: "困ること1行 → 桁 → 余裕 → 一番小さい所だけ確認 → 前提を書いて手を離す。かかった時間も残す", report: "件名と所要時間" },
      { title: "担当部品の錆の弱点を3つ挙げる", where: "実物か CAD", note: "knowledge/設計判断ハンドブック", what: "すき間・水たまり・端面・異種金属のどれかを探して、対策を1行ずつ書く", report: "見つけた数" },
    ],
  },
];

export default function GuildView() {
  return (
    <div className="flex flex-col gap-3">
      <section className="win flex flex-col gap-1.5 pt-4 text-sm" aria-label="報告のしかた">
        <span className="win-label">依頼の報告のしかた</span>
        <p>外のサイトの成績は、Claude に読ませてアプリに反映する。</p>
        <ol className="list-decimal pl-5 text-xs leading-relaxed text-muted">
          <li>依頼を終えたら、結果の画面をスクショする</li>
          <li>Claude Code に貼って「Study Quest に報告して」と言う（Chrome で開いたままなら画面を直接読ませてもいい）</li>
          <li>Claude が地方・正答数・誤答を読み取り、内容を確認してから送る → 経験値と台帳に反映</li>
        </ol>
      </section>

      {GROUPS.map((g) => (
        <section key={g.label} className="win flex flex-col pt-4" aria-label={g.label}>
          <span className="win-label" style={{ color: g.color }}>
            {g.label}
          </span>
          {g.quests.map((q, i) => (
            <article key={q.title} className={`flex flex-col gap-0.5 py-2 ${i > 0 ? "border-t border-line" : ""}`}>
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-dot">{q.title}</span>
                <span className="text-[11px] text-faint">{q.where}</span>
              </p>
              <p className="text-xs text-muted">{q.what}</p>
              <p className="flex items-center justify-between gap-2 text-[11px] text-faint">
                <span>報告：{q.report}</span>
                {q.url ? (
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-ex underline">
                    ひらく ↗
                  </a>
                ) : (
                  <NoteLink path={q.note} label="ノートをひらく" />
                )}
              </p>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
