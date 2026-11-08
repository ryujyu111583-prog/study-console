"use client";

import { useEffect, useState } from "react";

/** ビルドした時点の版。next.config.ts で埋め込む */
const BUILT = process.env.BUILD_SHA ?? "dev";

export default function PwaRegister() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {});
  }, []);

  // ホーム画面アプリは裏から戻しても読み込み直さない。戻ったときに公開中の版と比べ、違えば知らせる
  useEffect(() => {
    if (BUILT === "dev") return;
    const check = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/version", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { version?: string }) => setStale(!!d.version && d.version !== "dev" && d.version !== BUILT))
        .catch(() => {});
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);

  if (!stale) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 border-b-2 border-gold bg-surface px-4 py-2 text-sm">
      <span>新しい版が公開されています</span>
      <button
        type="button"
        onClick={() => {
          navigator.serviceWorker?.getRegistration().then((r) => r?.update());
          window.location.reload();
        }}
        className="rounded-md border-2 border-gold px-3 py-1 font-dot text-gold"
      >
        更新する
      </button>
    </div>
  );
}
