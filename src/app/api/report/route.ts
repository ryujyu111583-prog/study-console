import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { jstDayKey } from "@/lib/date";
import { getAdminDb } from "@/lib/firebaseAdmin";
import {
  bossOf,
  bossOutcome,
  reportRewards,
  validateReport,
  type BossRecord,
  type ReportItem,
} from "@/lib/game/rewards";
import type { AreaTouch } from "@/lib/game/vitality";
import { MISTAKE_TYPES } from "@/lib/mistakeTypes";

export const dynamic = "force-dynamic";

/** 履歴に残す件数 */
const KEEP = 100;

/**
 * Claude からの成績報告を受け取る。外部サイト（NotebookLM のクイズなど）の結果を、
 * Claude が読み取ってここへ送る。送り手は scripts/report.mjs。
 *
 * 認証は send-reminders と同じ Bearer 方式で、合言葉は REPORT_SECRET。
 * ?dryRun=1 なら書き込まずに、反映される内容だけを返す。
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.REPORT_SECRET || authHeader !== `Bearer ${process.env.REPORT_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "本文が JSON ではありません" }, { status: 400 });
  }
  const checked = validateReport(body);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
  const report = checked.report;
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";

  const today = jstDayKey();
  const reward = reportRewards(report);
  const area = bossOf(report);

  // DB にはボス戦の前回記録・地方に触れた日が要るときと、本当に書くときだけつなぐ
  const gameData = report.area ? (await getAdminDb().doc("settings/game").get()).data() : undefined;
  const prevBoss = area ? (gameData?.bosses?.[area.id] as BossRecord | undefined) : undefined;
  const touch = report.area ? (gameData?.areaTouch?.[report.area] as AreaTouch[string] | undefined) : undefined;
  const boss = area ? bossOutcome(prevBoss, area, report.score ?? 0, today) : null;
  const misses = (report.misses ?? []).map((m) => ({
    concept: m.concept,
    // 型が分からない誤答は処置できない（台帳の約束）。Claude が判定できなかったときだけ共通症状に置く
    type: MISTAKE_TYPES.includes(m.type as (typeof MISTAKE_TYPES)[number]) ? m.type! : "用語止まり",
    correct: m.correct ?? "",
  }));

  const item: ReportItem = {
    id: `${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    source: report.source,
    track: report.track,
    ...(report.area ? { area: report.area } : {}),
    ...(report.score !== undefined ? { score: report.score } : {}),
    ...(report.total !== undefined ? { total: report.total } : {}),
    ...(report.minutes !== undefined ? { minutes: report.minutes } : {}),
    misses: misses.length,
    xp: reward.xp + (boss?.xp ?? 0),
    gold: reward.gold + (boss?.gold ?? 0),
    ...(boss ? { boss: boss.firstClear ? "first" : boss.cleared ? "clear" : "fail" } : {}),
    ...(report.note ? { note: report.note } : {}),
  };

  if (dryRun) return NextResponse.json({ dryRun: true, item, misses });

  const db = getAdminDb();
  const gameRef = db.doc("settings/game");

  const batch = db.batch();
  batch.set(
    gameRef,
    {
      bonusXp: { [report.track]: FieldValue.increment(item.xp) },
      bonusGold: FieldValue.increment(item.gold),
      ...(report.total ? { quizLog: { [today]: FieldValue.increment(report.total) } } : {}),
      // G検定の報告は、その日の HP を守る（vitality.ts の gkDone）
      ...(report.track === "ml" ? { gkLog: { [today]: FieldValue.increment(Math.max(1, report.total ?? 0)) } } : {}),
      ...(report.area && touch?.last !== today
        ? { areaTouch: { [report.area]: { last: today, ...(touch?.last ? { prev: touch.last } : {}) } } }
        : {}),
      ...(area && boss ? { bosses: { [area.id]: boss.record } } : {}),
    },
    { merge: true },
  );
  for (const m of misses) {
    batch.set(db.collection("mistakes").doc(), {
      ...m,
      week: "",
      area: report.area ?? "",
      qid: "",
      wrongCount: 1,
      correctStreak: 0,
      createdAt: FieldValue.serverTimestamp(),
      lastCheckedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();

  // 履歴は直近 KEEP 件だけ残す
  const reportsRef = db.doc("settings/reports");
  await db.runTransaction(async (tx) => {
    const items = ((await tx.get(reportsRef)).data()?.items ?? []) as ReportItem[];
    tx.set(reportsRef, { items: [...items, item].slice(-KEEP) });
  });

  return NextResponse.json({ ok: true, item });
}
