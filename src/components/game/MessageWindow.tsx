"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/components/game/GameProvider";

/** 画面下に固定するメッセージ窓。1文字ずつ出す。 */
export default function MessageWindow() {
  const { message, levelUp } = useGame();
  const [shown, setShown] = useState(message);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(message);
      return;
    }
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 1;
      setShown(message.slice(0, i));
      if (i >= message.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [message]);

  useEffect(() => {
    if (levelUp === 0) return;
    setBanner(true);
    const id = window.setTimeout(() => setBanner(false), 1900);
    return () => window.clearTimeout(id);
  }, [levelUp]);

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-10 px-4 pt-6"
        style={{
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          background: "linear-gradient(transparent, var(--bg) 30%)",
        }}
      >
        <div
          role="status"
          aria-live="polite"
          className="win mx-auto min-h-[100px] max-w-md text-[15px] leading-relaxed whitespace-pre-line"
        >
          {shown}
          <span className="cursor-blink absolute right-3 bottom-1.5 text-[11px]">▼</span>
        </div>
      </div>
      {banner && (
        <div className="pointer-events-none fixed inset-0 z-20 grid place-items-center">
          <span
            className="level-up text-4xl tracking-widest text-gold"
            style={{ textShadow: "3px 3px 0 #3a1a00" }}
          >
            LEVEL UP!
          </span>
        </div>
      )}
    </>
  );
}
