"use client";

import { useEffect, useState } from "react";
import { currentPushState, subscribeToPush, type PushResult } from "@/lib/push";
import { useAuth } from "@/lib/useAuth";

export default function SettingsView() {
  const { user, logout } = useAuth();
  const [pushState, setPushState] = useState<"on" | "off" | "unsupported" | "loading">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    void currentPushState().then(setPushState);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const enablePush = async () => {
    setMessage(null);
    let result: PushResult;
    try {
      result = await subscribeToPush();
    } catch {
      setMessage("通知の登録に失敗しました");
      return;
    }
    if (result === "subscribed") {
      setPushState("on");
      setMessage("朝6:30に通知が届きます");
    } else if (result === "denied") {
      setMessage("ブラウザで通知が拒否されています。端末の設定から許可してください");
    } else {
      setMessage(
        isIOS && !standalone
          ? "iPhoneでは、先にホーム画面に追加してから開き直すと通知を登録できます"
          : "この環境では通知を使えません",
      );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-surface p-4">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
          通知
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          朝6:30に「今日のぶんが残っています」を送ります。前日に記録が付いている日は送りません。
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={enablePush}
            disabled={pushState === "on" || pushState === "loading"}
            className="rounded-lg bg-ink px-4 py-2 text-sm text-bg disabled:opacity-40"
          >
            {pushState === "on" ? "登録済み" : "この端末で通知を受け取る"}
          </button>
          <span className="font-mono text-xs text-faint">
            {pushState === "loading" ? "…" : pushState}
          </span>
        </div>
        {message && <p className="mt-2 text-xs text-muted">{message}</p>}
      </section>

      {!standalone && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
            ホーム画面に追加
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {isIOS
              ? "共有ボタン ⎋ →「ホーム画面に追加」。追加したアイコンから開くと、アドレスバーのない全画面で起動し、通知も使えるようになります。"
              : "ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選んでください。"}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-line bg-surface p-4">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-faint uppercase">
          アカウント
        </p>
        <p className="mt-1 font-mono text-xs break-all text-muted">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-3 rounded-lg border border-line px-4 py-2 text-sm text-muted"
        >
          ログアウト
        </button>
      </section>

      <p className="text-xs leading-relaxed text-faint">
        記録は端末のブラウザにも保存されるので、電波がなくても起動して記録できます。オンラインに戻った時点で自動的に同期されます。
      </p>
    </div>
  );
}
