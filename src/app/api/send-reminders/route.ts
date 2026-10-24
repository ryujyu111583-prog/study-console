import { NextResponse } from "next/server";
import webpush from "web-push";
import { jstDayKey } from "@/lib/date";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { hasAnyRecord, type DayRecord } from "@/lib/tracks";

export const dynamic = "force-dynamic";

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
  // 統計・投資・ML・英語のどれか1つでも付いていれば記録済み（旧 gk は ML として数える）
  const data = todayLog.exists ? (todayLog.data() as DayRecord) : null;
  if (hasAnyRecord(data)) {
    return NextResponse.json({ sent: 0, reason: "already logged" });
  }

  const body = "統計・投資・ML・英語のどれか1つ。無理なら2分版でいい。";

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
            body,
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
