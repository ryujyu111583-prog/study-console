// Study Quest へ成績を報告する（Claude Code から使う）。
//
//   node scripts/report.mjs report.json            本番へ送る
//   node scripts/report.mjs report.json --dry-run  書き込まずに、反映される内容だけ確かめる
//   node scripts/report.mjs report.json --url http://localhost:3001
//
// report.json の形（src/lib/game/rewards.ts の Report）：
//   { "source": "NotebookLM クイズ", "track": "ml", "area": "g4", "score": 8, "total": 10,
//     "misses": [{ "concept": "...", "type": "索引喪失（索引）", "correct": "..." }] }
//
// 合言葉は repo にも vault にも置かない。既定の置き場所は下の SECRET_FILE（環境変数で変えられる）。
import { readFileSync } from "node:fs";

const SECRET_FILE =
  process.env.STUDY_QUEST_SECRET_FILE ?? "C:\\Users\\ユーザー\\Claude\\study_console\\report-secret.txt";
const DEFAULT_URL = "https://study-console-jbpt.vercel.app";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const urlIndex = args.indexOf("--url");
const base = urlIndex >= 0 ? args[urlIndex + 1] : DEFAULT_URL;

if (!file) {
  console.error("使い方: node scripts/report.mjs <report.json> [--dry-run] [--url <base>]");
  process.exit(2);
}

const secret = readFileSync(SECRET_FILE, "utf8").trim();
const body = readFileSync(file, "utf8");

const res = await fetch(`${base}/api/report${dryRun ? "?dryRun=1" : ""}`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
  body,
});
const text = await res.text();
console.log(`${res.status} ${text}`);
process.exit(res.ok ? 0 : 1);
