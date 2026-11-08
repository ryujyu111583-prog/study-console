"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import NoteLink from "@/components/game/NoteLink";
import {
  BASE,
  MATS,
  SHAPES,
  SUPPORTS,
  clampT,
  fromQuery,
  sensitivity,
  solve,
  type Key,
  type LabState,
  type Mat,
  type Shape,
  type Support,
} from "@/lib/game/sectionLab";

/**
 * 断面ラボ。寸法をスライダーで動かすと、断面の形（実寸の比）と A・I・Z・M・σ・たわみが一緒に動く。
 * 「何を動かすと何がどれだけ効くか」を目で覚え、式に数字を入れた形で人に説明できるようにするための画面。
 */

const SEC = "var(--dsn)";
const AXIS = "var(--faint)";
const LOAD = "var(--danger)";
const STRESS = "var(--gold)";
/** 断面図の縮尺。固定にして、寸法を変えると図の大きさも変わるようにする（150 mm で 150 px） */
const PX = 1;

const fmt = (x: number) => {
  if (!Number.isFinite(x)) return "—";
  const a = Math.abs(x);
  if (a >= 1e6) return `${(x / 1e6).toFixed(a >= 1e7 ? 0 : 1)}×10⁶`;
  if (a >= 100) return Math.round(x).toLocaleString();
  if (a >= 10) return x.toFixed(1);
  return x.toFixed(2);
};
const ratio = (x: number, base: number) => {
  const r = x / base;
  return r >= 10 ? `×${Math.round(r)}` : `×${r.toFixed(r >= 1 ? 2 : 3).replace(/0+$/, "").replace(/\.$/, "")}`;
};
const pct = (p: number) => `${p >= 0 ? "+" : "−"}${Math.abs(p) < 0.5 ? "0" : Math.abs(p).toFixed(0)}%`;

function Slider(props: { label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; hint?: ReactNode }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="flex items-baseline justify-between text-sm">
        <span>{props.label}</span>
        <span className="font-dot text-dsn">
          {props.value} {props.unit}
        </span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full accent-[var(--dsn)]"
      />
      {props.hint && <span className="text-[11px] leading-snug text-faint">{props.hint}</span>}
    </label>
  );
}

function Choice<T extends string>({ items, value, onChange }: { items: Record<T, string>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(items) as T[]).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={`rounded-md border-2 px-2 py-1 text-xs ${k === value ? "border-dsn bg-dsnsoft text-dsn" : "border-line text-muted"}`}
        >
          {items[k]}
        </button>
      ))}
    </div>
  );
}

/** 断面図（実寸の比）＋曲げ応力の分布 */
function Section({ s }: { s: LabState }) {
  const t = clampT(s);
  const W = 260, H = 190, cx = 85, cy = H / 2;
  const r = solve(s);
  let body: ReactNode;
  if (s.shape === "rect") {
    body = <rect x={cx - (s.b * PX) / 2} y={cy - (s.h * PX) / 2} width={s.b * PX} height={s.h * PX} fill={SEC} />;
  } else if (s.shape === "box") {
    const [b, h, tt] = [s.b * PX, s.h * PX, t * PX];
    const [x, y] = [cx - b / 2, cy - h / 2];
    body = <path d={`M${x} ${y}h${b}v${h}h${-b}z M${x + tt} ${y + tt}v${h - 2 * tt}h${b - 2 * tt}v${-(h - 2 * tt)}z`} fill={SEC} fillRule="evenodd" />;
  } else if (s.shape === "pipe") {
    body = <circle cx={cx} cy={cy} r={((s.d - t) * PX) / 2} fill="none" stroke={SEC} strokeWidth={t * PX} />;
  } else if (s.shape === "bar") {
    body = <circle cx={cx} cy={cy} r={(s.d * PX) / 2} fill={SEC} />;
  } else {
    const [b, h, tt] = [s.b * PX, s.h * PX, t * PX];
    // 強軸：フランジが上下。弱軸：同じ形を90°回してフランジが左右
    const flange = (dx: number, dy: number, w: number, hh: number) => <rect key={`${dx}-${dy}`} x={cx + dx} y={cy + dy} width={w} height={hh} fill={SEC} />;
    body = !s.weak ? (
      <>
        {flange(-b / 2, -h / 2, b, tt)}
        {flange(-b / 2, h / 2 - tt, b, tt)}
        {flange(-tt / 2, -h / 2 + tt, tt, h - 2 * tt)}
      </>
    ) : (
      <>
        {flange(-h / 2, -b / 2, tt, b)}
        {flange(h / 2 - tt, -b / 2, tt, b)}
        {flange(-h / 2 + tt, -tt / 2, h - 2 * tt, tt)}
      </>
    );
  }
  const c = r.c * PX;
  const sx = 200, sw = 45;
  // 片持ち（先端を下に押す）は根元で上が引張。両端支持（中央を押す）は中央で上が圧縮
  const topTension = s.support === "cant";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="断面と曲げ応力の分布">
      <line x1={8} x2={160} y1={cy} y2={cy} stroke={AXIS} strokeWidth={1} strokeDasharray="8 3 2 3" />
      <text x={8} y={cy - 4} fill={AXIS} fontSize={10}>中立軸</text>
      {body}
      <line x1={sx} x2={sx} y1={cy - c} y2={cy + c} stroke={AXIS} />
      <path d={`M${sx} ${cy}L${sx + sw} ${cy - c}L${sx} ${cy - c}z M${sx} ${cy}L${sx - sw} ${cy + c}L${sx} ${cy + c}z`} fill={STRESS} opacity={0.75} />
      <text x={sx} y={Math.max(11, cy - c - 4)} textAnchor="middle" fill={STRESS} fontSize={10}>
        {topTension ? "引張" : "圧縮"} {fmt(r.sigma)} MPa
      </text>
      <text x={sx} y={Math.min(H - 3, cy + c + 12)} textAnchor="middle" fill={STRESS} fontSize={10}>
        {topTension ? "圧縮" : "引張"}
      </text>
      <text x={W - 4} y={H - 4} textAnchor="end" fill={AXIS} fontSize={9}>縮尺：1 mm ＝ 1 目盛 ／ 応力は縁で最大・中立軸で0</text>
    </svg>
  );
}

/** 梁と曲げモーメント図。たわみは見えるように拡大して描く */
function Beam({ s }: { s: LabState }) {
  const r = solve(s);
  const W = 260, x0 = 20, x1 = 240, y = 40;
  const cant = s.support === "cant";
  const loadX = cant ? x1 : (x0 + x1) / 2;
  const sag = Math.min(28, 6 + Math.log10(1 + r.delta) * 14);
  const curve = cant ? `M${x0} ${y}Q${(x0 + x1) / 2} ${y} ${x1} ${y + sag}` : `M${x0} ${y}Q${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`;
  const mY = 110;
  const mPath = cant ? `M${x0} ${mY}L${x0} ${mY - 40}L${x1} ${mY}z` : `M${x0} ${mY}L${(x0 + x1) / 2} ${mY - 40}L${x1} ${mY}z`;
  return (
    <svg viewBox={`0 0 ${W} 135`} className="w-full" role="img" aria-label="梁と曲げモーメント図">
      {cant ? (
        <rect x={x0 - 8} y={y - 18} width={8} height={36} fill={AXIS} />
      ) : (
        <>
          <path d={`M${x0} ${y + 3}l-7 11h14z`} fill={AXIS} />
          <path d={`M${x1} ${y + 3}l-7 11h14z`} fill={AXIS} />
        </>
      )}
      <line x1={x0} x2={x1} y1={y} y2={y} stroke={SEC} strokeWidth={5} />
      <path d={curve} fill="none" stroke={SEC} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.8} />
      <line x1={loadX} x2={loadX} y1={y - 30} y2={y - 6} stroke={LOAD} strokeWidth={2} />
      <path d={`M${loadX - 5} ${y - 11}L${loadX} ${y - 4}L${loadX + 5} ${y - 11}z`} fill={LOAD} />
      <text x={loadX + (cant ? -4 : 6)} y={y - 22} textAnchor={cant ? "end" : "start"} fill={LOAD} fontSize={10}>F = {s.F} kN</text>
      <text x={(x0 + x1) / 2} y={y + 28 + (cant ? 0 : sag)} textAnchor="middle" fill={SEC} fontSize={10}>たわみ δ ≈ {fmt(r.delta)} mm（点線は誇張）</text>
      <path d={mPath} fill={STRESS} opacity={0.3} stroke={STRESS} />
      <text x={cant ? x0 + 4 : (x0 + x1) / 2} y={mY - 44} textAnchor={cant ? "start" : "middle"} fill={STRESS} fontSize={10}>
        M最大 {fmt(r.M / 1e6)} kN·m（{cant ? "根元" : "中央"}）
      </text>
      <text x={x1} y={mY + 14} textAnchor="end" fill={AXIS} fontSize={9}>曲げモーメント図　L = {s.L} mm</text>
    </svg>
  );
}

const ROWS: { key: Key | "M" | "mass"; label: string; unit: string; note: string }[] = [
  { key: "A", label: "断面積 A", unit: "mm²", note: "重さと軸力" },
  { key: "mass", label: "1 m の質量", unit: "kg", note: "A×密度" },
  { key: "I", label: "断面二次モーメント I", unit: "mm⁴", note: "曲げ剛性（たわみ）" },
  { key: "Z", label: "断面係数 Z", unit: "mm³", note: "曲げ強さ（応力）" },
  { key: "M", label: "最大曲げモーメント M", unit: "kN·m", note: "荷重×腕の長さ" },
  { key: "sigma", label: "最大曲げ応力 σ = M/Z", unit: "MPa", note: "縁で最大" },
  { key: "delta", label: "たわみ δ", unit: "mm", note: "F·L³/(k·E·I)" },
];

export default function SectionLab() {
  const query = useSearchParams();
  const [s, setS] = useState<LabState>(() => fromQuery(new URLSearchParams(query.toString())));
  const [base, setBase] = useState<LabState>(BASE);
  const set = (p: Partial<LabState>) => setS((cur) => ({ ...cur, ...p }));
  const r = useMemo(() => solve(s), [s]);
  const r0 = useMemo(() => solve(base), [base]);
  const value = (res: typeof r, k: (typeof ROWS)[number]["key"]) => (k === "M" ? res.M / 1e6 : res[k]);
  const round = s.shape === "pipe" || s.shape === "bar";
  const hint = (field: "b" | "h" | "t" | "d" | "F" | "L") => {
    const e = sensitivity(s, field);
    return `1割増やすと I ${pct(e.I)}、Z ${pct(e.Z)}、σ ${pct(e.sigma)}、たわみ ${pct(e.delta)}、A ${pct(e.A)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="win flex flex-col gap-2 pt-4">
        <span className="win-label text-dsn">断面（実寸の比）</span>
        <Choice items={SHAPES} value={s.shape} onChange={(shape: Shape) => set({ shape })} />
        <Section s={s} />
        {(s.shape === "rect" || s.shape === "box" || s.shape === "H") && (
          <button
            type="button"
            onClick={() => (s.shape === "H" ? set({ weak: !s.weak }) : set({ b: s.h, h: s.b }))}
            className="self-start rounded-md border-2 border-line px-2 py-1 text-xs text-muted"
          >
            ↻ 90°回す（{s.shape === "H" ? (s.weak ? "弱軸" : "強軸") : "幅と高さを入れ替え"}）
          </button>
        )}
      </section>

      <section className="win flex flex-col gap-3 pt-4">
        <span className="win-label text-dsn">寸法を動かす</span>
        {round ? (
          <Slider label="外径 D" unit="mm" value={s.d} min={5} max={150} step={1} onChange={(d) => set({ d })} hint={hint("d")} />
        ) : (
          <>
            <Slider label={s.shape === "H" ? "フランジ幅 b" : "幅 b"} unit="mm" value={s.b} min={2} max={150} step={1} onChange={(b) => set({ b })} hint={hint("b")} />
            <Slider label="高さ h" unit="mm" value={s.h} min={2} max={150} step={1} onChange={(h) => set({ h })} hint={hint("h")} />
          </>
        )}
        {(s.shape === "box" || s.shape === "pipe" || s.shape === "H") && (
          <Slider label="板厚 t" unit="mm" value={clampT(s)} min={0.5} max={10} step={0.1} onChange={(t) => set({ t })} hint={hint("t")} />
        )}
      </section>

      <section className="win flex flex-col gap-3 pt-4">
        <span className="win-label text-dsn">はりの条件</span>
        <Choice items={SUPPORTS} value={s.support} onChange={(support: Support) => set({ support })} />
        <Choice items={Object.fromEntries(Object.entries(MATS).map(([k, v]) => [k, `${v.name}（E ${v.E / 1000} GPa）`])) as Record<Mat, string>} value={s.mat} onChange={(mat: Mat) => set({ mat })} />
        <Slider label="荷重 F" unit="kN" value={s.F} min={0.1} max={20} step={0.1} onChange={(F) => set({ F })} hint={hint("F")} />
        <Slider label="長さ L" unit="mm" value={s.L} min={100} max={2000} step={50} onChange={(L) => set({ L })} hint={hint("L")} />
        <Beam s={s} />
      </section>

      <section className="win flex flex-col gap-2 pt-4">
        <span className="win-label text-dsn">数値（右は基準との比）</span>
        <table className="w-full text-sm">
          <tbody>
            {ROWS.map((row) => {
              const v = value(r, row.key);
              const v0 = value(r0, row.key);
              const up = v / v0;
              return (
                <tr key={row.key} className="border-b border-line/50 align-baseline">
                  <td className="py-1 pr-2">
                    {row.label}
                    <span className="block text-[11px] text-faint">{row.note}</span>
                  </td>
                  <td className="py-1 text-right font-dot whitespace-nowrap">
                    {fmt(v)} <span className="text-[11px] text-faint">{row.unit}</span>
                  </td>
                  <td className={`py-1 pl-2 text-right font-dot whitespace-nowrap ${Math.abs(up - 1) < 0.005 ? "text-faint" : up > 1 ? "text-gold" : "text-ex"}`}>{ratio(v, v0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center gap-2 text-xs text-faint">
          <span>
            基準：{SHAPES[base.shape]} {base.shape === "pipe" || base.shape === "bar" ? `φ${base.d}` : `${base.b}×${base.h}`}
            {base.shape === "box" || base.shape === "pipe" || base.shape === "H" ? `×t${clampT(base)}` : ""}・{MATS[base.mat].name}・{SUPPORTS[base.support].slice(0, 4)} L{base.L}・{base.F} kN
          </span>
          <button type="button" onClick={() => setBase(s)} className="rounded-md border-2 border-line px-2 py-0.5 text-muted">
            今の状態を基準にする
          </button>
          <button type="button" onClick={() => { setBase(BASE); setS(BASE); }} className="rounded-md border-2 border-line px-2 py-0.5 text-muted">
            □50×1.2 に戻す
          </button>
        </div>
      </section>

      <section className="win flex flex-col gap-1 pt-4">
        <span className="win-label text-dsn">説明するときの式</span>
        {r.steps.map((line, i) => (
          <p key={i} className="font-mono text-xs leading-relaxed text-muted">{line}</p>
        ))}
        <p className="font-mono text-xs leading-relaxed text-muted">
          M = {s.support === "cant" ? "F·L" : "F·L/4"} = {s.F}×10³ × {s.L}{s.support === "cant" ? "" : " / 4"} ≈ {fmt(r.M / 1e6)} kN·m
        </p>
        <p className="font-mono text-xs leading-relaxed text-muted">
          σ = M/Z = {fmt(r.M)} / {fmt(r.Z)} ≈ {fmt(r.sigma)} MPa
        </p>
        <p className="font-mono text-xs leading-relaxed text-muted">
          δ = F·L³/({s.support === "cant" ? 3 : 48}·E·I) = {s.F}×10³ × {s.L}³ / ({s.support === "cant" ? 3 : 48} × {MATS[s.mat].E.toLocaleString()} × {fmt(r.I)}) ≈ {fmt(r.delta)} mm
        </p>
        <p className="mt-1 text-xs leading-relaxed text-faint">
          覚え方：高さは I に3乗・Z に2乗で効き、幅と板厚はほぼ1乗。長さはたわみに3乗、応力に1乗。材料を変えても I・Z・σ は同じで、たわみだけが E に反比例する。
        </p>
        <NoteLink path="knowledge/設計肌感トレーニング" label="ノートで確かめる：設計肌感トレーニング" />
      </section>
    </div>
  );
}
