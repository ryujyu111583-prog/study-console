"use client";

import { useEffect, useRef } from "react";
import { GRID, monsterGrid, monsterPalette, type MonsterLook } from "@/lib/game/sprites";

/** 32x32 のドット絵を canvas に描き、CSS で拡大する（ぼかさない）。 */
export default function Sprite({
  look,
  size = 96,
  className = "",
  label,
}: {
  look: MonsterLook;
  size?: number;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const palette = monsterPalette(look);
    ctx.clearRect(0, 0, GRID, GRID);
    monsterGrid(look).forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === ".") return;
        ctx.fillStyle = palette[ch] ?? "#ffffff";
        ctx.fillRect(x, y, 1, 1);
      }),
    );
  }, [look]);

  return (
    <canvas
      ref={ref}
      width={GRID}
      height={GRID}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`pixelated ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
