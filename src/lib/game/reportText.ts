/** 報告1件を1行の文にする（メッセージ窓と冒険の書で使う）。 */
import { TRACK_LABEL } from "../tracks";
import { fmt } from "./levels";
import type { ReportItem } from "./rewards";
import { areaById } from "./world";

export function reportLine(r: ReportItem) {
  const score = r.score !== undefined && r.total ? ` ${r.score}/${r.total}` : "";
  const minutes = r.minutes ? ` ${r.minutes}分` : "";
  const boss =
    r.boss === "first"
      ? ` ・ ${areaById(r.area)?.boss}撃破！`
      : r.boss === "fail"
        ? ` ・ ${areaById(r.area)?.boss}に敗北`
        : "";
  return `${r.source}${score}${minutes}（${TRACK_LABEL[r.track]}）+${fmt(r.xp)}EX${boss}`;
}
