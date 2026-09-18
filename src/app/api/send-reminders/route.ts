import { differenceInCalendarDays, parseISO } from "date-fns";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { currentWeek } from "@/lib/plan";

export const dynamic = "force-dynamic";

/**
 * Vercel の cron は UTC で動く。JST の「今日」を得るために9時間ぶんずらしてから
 * 日付部分だけ読む。アプリ側が書く studyLog のキーと同じ形になる。
 */
function jstNow(now = new Date()): Date {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000);
}

function jstDayKey(now = new Date()): string {
  return jstNow(now).toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_SUBJECT_EMAIL ?? "noreply@example.com"}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const db = getAdminDb();
  const today = jstDayKey();

  // すでに今日のぶんが付いているなら送らない。催促は未了のときだけ意味がある。
  const todayLog = await db.doc(`studyLog/${today}`).get();
  const data = todayLog.exists ? todayLog.data() : null;
  if (data && (data.gk || data.en)) {
    return NextResponse.json({ sent: 0, reason: "already logged" });
  }

  const settingsDoc = await db.doc("settings/main").get();
  const examDate = (settingsDoc.exists ? (settingsDoc.data()?.examDate as string) : "") || "";

  const week = currentWeek(jstNow());
  const parts: string[] = [];
  if (week) parts.push(`${week.code} ${week.topic}`);
  if (examDate) {
    const left = differenceInCalendarDays(parseISO(examDate), jstNow());
    if (left >= 0) parts.push(`残り${left}日`);
  }
  parts.push("G検定30分、英語15分。無理なら2分版でいい。");

  const subsSnap = await db.collection("pushSubscriptions").get();
  let sent = 0;
  await Promise.all(
    subsSnap.docs.map(async (doc) => {
      const sub = doc.data();
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({
            title: "今日のぶんが残っています",
            body: parts.join("\n"),
            url: "/",
          }),
        );
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // 失効した購読は消しておかないと、毎朝エラーを出し続ける
        if (statusCode === 404 || statusCode === 410) {
          await doc.ref.delete();
        }
      }
    }),
  );

  return NextResponse.json({ sent, day: today });
}
