"use client";

import Nav from "@/components/Nav";
import GameProvider from "@/components/game/GameProvider";
import MessageWindow from "@/components/game/MessageWindow";
import StatusWindow from "@/components/game/StatusWindow";
import { useAuth } from "@/lib/useAuth";

/**
 * ログイン状態の出し分けと、全ページ共通の外枠。
 * 個人用アプリなので、許可アドレス以外は中身を一切見せない。
 */
export default function AuthGate({
  title,
  greeting = "勇者よ、よくぞ戻った！ 今日の修行を始めよう。",
  children,
}: {
  title: string;
  /** 開いたときにメッセージ窓に出す一言 */
  greeting?: string;
  children: React.ReactNode;
}) {
  const { status, login, loginError, stalled } = useAuth();

  // 認証サーバーに届かないまま黙って回り続けると、何が起きているか分からなくなる。
  // 一定時間で打ち切ってログイン画面を出し、理由を書く。
  if (status === "loading" && !stalled) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-faint">
        読み込み中…
      </main>
    );
  }

  if (status !== "signed-in") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-4">
        <p className="text-2xl tracking-widest text-gold">Study Quest</p>
        <p className="text-sm text-muted">
          {status === "not-allowed"
            ? "このアカウントでは開けません"
            : stalled
              ? "接続が確認できません"
              : "先にログインしてください"}
        </p>
        {stalled && status === "loading" && (
          <p className="max-w-xs px-2 text-center text-xs leading-relaxed text-faint">
            オフラインか、Firebaseの設定がまだかもしれません。電波が戻れば自動で入り直します。
          </p>
        )}
        <button
          onClick={login}
          className="win px-6 py-2 text-base"
        >
          Googleでログイン
        </button>
        {loginError && (
          <p className="max-w-xs text-center font-mono text-xs text-danger">{loginError}</p>
        )}
      </main>
    );
  }

  return (
    <GameProvider greeting={greeting}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-4 pb-40">
        <StatusWindow />
        <Nav />
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
      <MessageWindow />
    </GameProvider>
  );
}
