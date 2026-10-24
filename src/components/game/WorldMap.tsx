"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { H, TILE, W, buildWorld, paintWorld } from "@/lib/game/overworld";
import { ART_SIZE, HERO_ART, SHIP_ART, SITE_ART, artRuns } from "@/lib/game/siteArt";
import { FRONTIER, G_ROAD, SEA_LANES, areaById, type Area, type Frontier } from "@/lib/game/world";

type Zoom = "near" | "realm" | "world";
const ZOOMS: { id: Zoom; label: string }[] = [
  { id: "near", label: "近く" },
  { id: "realm", label: "人間界" },
  { id: "world", label: "世界" },
];
/** 人間界の真ん中（「人間界」表示で画面の中心に置く点） */
const REALM = { x: 95, y: 93, w: 88 };

/** 暗黒大陸の名札。内海のすぐ外側、東西南北に置く */
const DARK_LABELS: [number, number][] = [
  [96, 33],
  [96, 159],
  [24, 92],
  [168, 92],
];

// 魔の島へは橋で渡る。橋の上は地形のほうで描くので、道はその手前で切る
const roadPoints = () => {
  const pts = G_ROAD.map((id) => areaById(id)!).map((a) => [a.x + 0.5, a.y + 0.5]);
  const maou = pts.pop()!;
  return { land: [...pts, [87, 75], [91.5, 72]], island: [[91.5, 60.5], maou] };
};
const toPoints = (pts: number[][]) => pts.map(([x, y]) => `${x},${y}`).join(" ");

function ArtSymbol({ id, rows }: { id: string; rows: string[] }) {
  return (
    <symbol id={id} viewBox={`0 0 ${ART_SIZE} ${ART_SIZE}`}>
      {artRuns(rows).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
    </symbol>
  );
}

export default function WorldMap({
  areas,
  cleared,
  selected,
  heroAt,
  revealed,
  onPick,
  onFrontier,
}: {
  areas: Area[];
  cleared: (id: string) => boolean;
  selected: string;
  /** 勇者が立っている地点（次に挑む場所） */
  heroAt: string;
  /** 魔王城を倒して、暗黒大陸の霧が薄れたか */
  revealed: boolean;
  onPick: (a: Area) => void;
  onFrontier: (f: Frontier) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const frameA = useRef<HTMLCanvasElement>(null);
  const frameB = useRef<HTMLCanvasElement>(null);
  const fogRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<Zoom>("realm");
  const [box, setBox] = useState({ w: 360, h: 420 });
  const [dpr, setDpr] = useState(2);
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);

  const s = zoom === "near" ? 8 : zoom === "realm" ? box.w / REALM.w : box.w / W;
  const crisp = s * dpr >= 6;
  // 画面上で同じ大きさに見せたいもの（文字・建物）は、マス数に直して置く
  const px = (n: number) => n / s;
  const icon = Math.max(3.2, px(18));

  useEffect(() => {
    setDpr(window.devicePixelRatio || 1);
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 地形は一度だけ塗る（波と溶岩の2コマ）
  useEffect(() => {
    const { tiles } = buildWorld();
    [frameA, frameB].forEach((ref, frame) => {
      const ctx = ref.current?.getContext("2d");
      if (!ctx) return;
      ctx.putImageData(new ImageData(paintWorld(tiles, frame as 0 | 1), W * TILE, H * TILE), 0, 0);
    });
  }, []);

  useEffect(() => {
    const ctx = fogRef.current?.getContext("2d");
    if (!ctx) return;
    const { fog } = buildWorld();
    const img = new ImageData(W, H);
    for (let i = 0; i < W * H; i++) {
      img.data[i * 4] = 12;
      img.data[i * 4 + 1] = 6;
      img.data[i * 4 + 2] = 26;
      img.data[i * 4 + 3] = Math.round(fog[i] * (revealed ? 0.5 : 1) * 255);
    }
    ctx.putImageData(img, 0, 0);
  }, [revealed]);

  // 倍率を変えたら、見たい場所を画面の真ん中に寄せる
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const a = areaById(selected);
    const c = zoom === "near" && a ? { x: a.x, y: a.y } : zoom === "realm" ? REALM : { x: W / 2, y: H / 2 };
    el.scrollLeft = c.x * s - el.clientWidth / 2;
    el.scrollTop = c.y * s - el.clientHeight / 2;
    // selected は追わない：タップのたびに画面が飛ぶと地図を眺めにくい
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, s]);

  const road = roadPoints();
  const hero = areaById(heroAt);

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="overflow-auto overscroll-contain rounded-[3px] bg-[#0c061a]"
        style={{ height: zoom === "world" ? box.w : "min(64vh, 460px)", scrollbarWidth: "none" }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !scroller.current) return;
          const el = scroller.current;
          drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = scroller.current;
          if (!d || !el) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
          el.scrollLeft = d.left - dx;
          el.scrollTop = d.top - dy;
        }}
        onPointerUp={() => {
          // click はこのあとに来るので、ドラッグだったかどうかは少し残しておく
          setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => (drag.current = null)}
        onClickCapture={(e) => {
          if (drag.current?.moved) e.stopPropagation();
        }}
      >
        <div className="relative" style={{ width: W * s, height: H * s }}>
          <canvas
            ref={frameA}
            width={W * TILE}
            height={H * TILE}
            className="absolute inset-0 h-full w-full"
            style={{ imageRendering: crisp ? "pixelated" : "auto" }}
            aria-hidden
          />
          <canvas
            ref={frameB}
            width={W * TILE}
            height={H * TILE}
            className="wave-swap absolute inset-0 h-full w-full"
            style={{ imageRendering: crisp ? "pixelated" : "auto" }}
            aria-hidden
          />
          <canvas ref={fogRef} width={W} height={H} className="fog-drift absolute inset-0 h-full w-full" aria-hidden />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="世界地図。人間界のまわりを暗黒大陸が囲む"
            shapeRendering="crispEdges"
          >
            <defs>
              {Object.entries(SITE_ART).map(([k, rows]) => (
                <ArtSymbol key={k} id={`art-${k}`} rows={rows} />
              ))}
              <ArtSymbol id="art-hero" rows={HERO_ART} />
              <ArtSymbol id="art-ship" rows={SHIP_ART} />
            </defs>

            {/* 航路と街道 */}
            {SEA_LANES.map(([from, to]) => {
              const a = areaById(from)!;
              const b = areaById(to)!;
              const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.25;
              const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.25;
              return (
                <path
                  key={from + to}
                  d={`M${a.x + 0.5} ${a.y + 0.5} Q${mx} ${my} ${b.x + 0.5} ${b.y + 0.5}`}
                  fill="none"
                  stroke="#cfe6ff"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                  strokeDasharray="2 5"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="auto"
                />
              );
            })}
            {[road.land, road.island].map((pts, i) => (
              <polyline
                key={i}
                points={toPoints(pts)}
                fill="none"
                stroke="#f1dd9c"
                strokeWidth={zoom === "world" ? 1.5 : 3}
                strokeDasharray="5 4"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                shapeRendering="auto"
              />
            ))}

            {/* 人間界のふち（世界を引いて見たときだけ） */}
            {zoom === "world" && (
              <ellipse
                cx="96"
                cy="92"
                rx="56"
                ry="54"
                fill="none"
                stroke="#ffd84a"
                strokeOpacity="0.7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
                shapeRendering="auto"
              />
            )}

            {/* 暗黒大陸のうわさの地 */}
            {FRONTIER.map((f) => (
              <g key={f.id} onClick={() => onFrontier(f)} className="cursor-pointer" role="button" aria-label={revealed ? f.name : "未踏の地"}>
                <circle cx={f.x} cy={f.y} r={px(22)} fill="transparent" />
                <circle
                  cx={f.x}
                  cy={f.y}
                  r={px(9)}
                  fill="#2a0f3e"
                  fillOpacity="0.8"
                  stroke="#c58cff"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="auto"
                >
                  <animate attributeName="stroke-opacity" values="1;0.25;1" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <text
                  x={f.x}
                  y={f.y + px(4.5)}
                  textAnchor="middle"
                  fontSize={px(13)}
                  fill="#e8d4ff"
                  className="font-dot"
                  style={{ pointerEvents: "none" }}
                >
                  ？
                </text>
                {(revealed || zoom === "world") && (
                  <text
                    x={f.x}
                    y={f.y + px(22)}
                    textAnchor="middle"
                    fontSize={px(10)}
                    fill="#d9c2ff"
                    stroke="#0c061a"
                    strokeWidth={px(3)}
                    paintOrder="stroke"
                    className="font-dot"
                  >
                    {revealed ? f.name : "？？？"}
                  </text>
                )}
              </g>
            ))}
            {DARK_LABELS.map(([x, y]) => (
              <text
                key={`${x}-${y}`}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={px(zoom === "world" ? 11 : 14)}
                letterSpacing={px(4)}
                fill="#b9a4d8"
                fillOpacity="0.85"
                stroke="#0c061a"
                strokeWidth={px(3)}
                paintOrder="stroke"
                className="font-dot"
              >
                暗黒大陸
              </text>
            ))}

            {/* 地名（島の名前） */}
            {zoom !== "world" &&
              (
                [
                  ["G検定大陸", 90, 136],
                  ["統計の島", 61, 117],
                  ["英語の島", 126, 106],
                  ["投資の島", 124, 132],
                  ["魔の島", 106, 56],
                ] as const
              ).map(([name, x, y]) => (
                <text
                  key={name}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize={px(11)}
                  fill="#f4f4f4"
                  stroke="#0b1d4a"
                  strokeWidth={px(3)}
                  paintOrder="stroke"
                  className="font-dot"
                >
                  {name}
                </text>
              ))}
            {zoom === "world" && (
              <text
                x="96"
                y="141"
                textAnchor="middle"
                fontSize={px(11)}
                fill="#ffd84a"
                stroke="#0b1d4a"
                strokeWidth={px(3)}
                paintOrder="stroke"
                className="font-dot"
              >
                人間界
              </text>
            )}

            {/* 船（港町の沖） */}
            <use href="#art-ship" x={109} y={81.5} width={icon * 0.9} height={icon * 0.9} />

            {/* 地点 */}
            {areas.map((a) => {
              const done = cleared(a.id);
              const size = a.site === "castle" ? icon * 1.25 : icon;
              return (
                <g key={a.id} onClick={() => onPick(a)} className="cursor-pointer" role="button" aria-label={a.name}>
                  <rect x={a.x + 0.5 - size / 2 - 1} y={a.y + 0.5 - size / 2 - 1} width={size + 2} height={size + 2} fill="transparent" />
                  <use href={`#art-${a.site}`} x={a.x + 0.5 - size / 2} y={a.y + 0.5 - size * 0.7} width={size} height={size} />
                  {done && (
                    <text x={a.x + 0.5 + size * 0.45} y={a.y + 0.5 - size * 0.45} textAnchor="middle" fontSize={px(12)} fill="#ffd84a" stroke="#10121e" strokeWidth={px(2.5)} paintOrder="stroke">
                      ★
                    </text>
                  )}
                  {a.id === selected && (
                    <rect
                      x={a.x + 0.5 - size / 2 - px(3)}
                      y={a.y + 0.5 - size * 0.7 - px(3)}
                      width={size + px(6)}
                      height={size + px(6)}
                      fill="none"
                      stroke="#f4f4f4"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    >
                      <animate attributeName="opacity" values="1;0;1" dur="1s" calcMode="discrete" repeatCount="indefinite" />
                    </rect>
                  )}
                  {zoom === "near" && (
                    <text
                      x={a.x + 0.5}
                      y={a.y + 0.5 + size * 0.3 + px(12)}
                      textAnchor="middle"
                      fontSize={px(11)}
                      fill="#f4f4f4"
                      stroke="#10121e"
                      strokeWidth={px(3)}
                      paintOrder="stroke"
                      className="font-dot"
                    >
                      {a.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 勇者は次に挑む場所の脇に立つ */}
            {hero && (
              <g style={{ pointerEvents: "none" }}>
                <use href="#art-hero" x={hero.x + 0.5 - icon * 1.35} y={hero.y + 0.5 - icon * 0.75} width={icon * 0.85} height={icon * 0.85}>
                  <animate attributeName="y" values={`${hero.y + 0.5 - icon * 0.75};${hero.y + 0.5 - icon * 0.85};${hero.y + 0.5 - icon * 0.75}`} dur="0.8s" calcMode="discrete" repeatCount="indefinite" />
                </use>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* 方位と倍率（地図の上に固定） */}
      <svg viewBox="0 0 40 40" className="pointer-events-none absolute left-2 top-2 h-10 w-10" aria-hidden>
        <circle cx="20" cy="22" r="13" fill="#0c061a" fillOpacity="0.55" stroke="#f1dd9c" strokeWidth="1.5" />
        <path d="M20 9 L24 22 L20 20 L16 22Z" fill="#ff6b5b" />
        <path d="M20 35 L24 22 L20 24 L16 22Z" fill="#f4f4f4" />
        <text x="20" y="7" textAnchor="middle" fontSize="8" fill="#f1dd9c" className="font-dot">
          N
        </text>
      </svg>
      <div className="absolute right-2 top-2 flex gap-1" role="group" aria-label="地図の倍率">
        {ZOOMS.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => setZoom(z.id)}
            aria-pressed={zoom === z.id}
            className={`font-dot rounded-[3px] border-2 px-1.5 py-0.5 text-xs ${
              zoom === z.id ? "border-ink bg-ink text-bg" : "border-ink bg-[#0c061acc] text-ink"
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>
    </div>
  );
}
