/**
 * 今公開されている版（コミット）を返す。スマホのホーム画面アプリは裏から戻しただけでは
 * 読み込み直さないので、画面側が自分の版と比べて「新しい版があります」を出すのに使う。
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
