import { differenceInCalendarDays, parseISO } from "date-fns";

export type Week = {
  code: string;
  span: string;
  topic: string;
  bridge: string;
};

/** W1の開始日。ここを起点に「今週どこか」を計算する。 */
export const PLAN_START = "2026-09-17";

/**
 * 受験日(2026-11-06)までの週割り。
 *
 * 2026-09-19 全面改訂。旧版は「第14回(CNN)まで完了」という誤った前提で組まれており、
 * 8月に終えた内容を教え直す計画になっていた。実際の現在地は Obsidian の G検定MOC のとおり:
 *   - 第1〜24回のインプットは 2026-08-10 に完走済み
 *   - 8/11〜8/19 に予定した「400問2周」の演習フェーズは "ほぼ手つかず" のまま
 *   - 8/17以降 約1ヶ月 完全停止。9/1(第5回)は受験していない
 *   - 08-14の診断: 弱点は知識の欠落ではなく「経路の修理」(つなぎ違い/軸が立たない/
 *     索引喪失/問いのずれ)。最大の失点源は問いのずれ
 *
 * したがって本計画は再インプットではなく、未実行のまま残った演習フェーズを7週に伸ばしたもの。
 * 1周目は分野別(W2〜W6)、2周目は誤答のみ(W7)。ノートは教材ではなく索引として引く。
 * 唯一の新規インプットは生成AI(W4)。2024年11月改訂で比重が大きく上がった一方、
 * シラバス全域カバー率が7割台半ばに留まっている領域だから。
 */
export const WEEKS: Week[] = [
  {
    code: "W1",
    span: "9/17–9/23",
    topic: "再起動 ＋ 現在地の測定",
    bridge: "C1/C2チートシートを1周5分で回す。400問から横断50問、どこが壊れたか測る",
  },
  {
    code: "W2",
    span: "9/24–9/30",
    topic: "400問① 機械学習の幹（第1–10回）",
    bridge: "線形回帰〜SVM〜PCA。3点セットの差し替え履歴として引く",
  },
  {
    code: "W3",
    span: "10/1–10/7",
    topic: "400問② 深層学習（第11–17回）",
    bridge: "誤差逆伝播〜Attention〜Transformer。配点の中心",
  },
  {
    code: "W4",
    span: "10/8–10/14",
    topic: "生成AI（唯一の新規インプット）",
    bridge: "改訂シラバスの最重点。GAN・VAE・拡散・LLM。ここだけノートを作る",
  },
  {
    code: "W5",
    span: "10/15–10/21",
    topic: "400問③ AI史・強化学習・画像認識",
    bridge: "第18/19/22回。年代と固有名詞は鎖ではなく索引で引く",
  },
  {
    code: "W6",
    span: "10/22–10/28",
    topic: "400問④ 法規・倫理・社会実装",
    bridge: "第20/21/24回。技術論点に押されて捨てるのが典型的な失点。落とさない",
  },
  {
    code: "W7",
    span: "10/29–11/5",
    topic: "2周目：誤答のみ ＋ 模試",
    bridge: "新規は入れない。全問で「限定語に印 → 選択肢」を実行する",
  },
];

/** 今日が第何週か。開始前は -1、終了後は WEEKS.length 以上を返す。 */
export function currentWeekIndex(from: Date = new Date()): number {
  const diff = differenceInCalendarDays(from, parseISO(PLAN_START));
  if (diff < 0) return -1;
  return Math.floor(diff / 7);
}

export function currentWeek(from: Date = new Date()): Week | null {
  const i = currentWeekIndex(from);
  return i >= 0 && i < WEEKS.length ? WEEKS[i] : null;
}
