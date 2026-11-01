/**
 * 断面の工房（d1）の問題に添える断面図。キーは問題ID。
 * 寸法を書いた図は板厚まで実寸の比で描く（見た目の肌感も一緒に育てるため）。
 * 答えそのものは図に書かない。
 */
import type { ReactNode } from "react";

const SEC = "var(--dsn)";
const DIM = "var(--muted)";
const AXIS = "var(--faint)";
const LOAD = "var(--danger)";
const STRESS = "var(--gold)";

type Pt = { cx: number; cy: number };

function Label({ x, y, children, anchor = "middle", color = DIM }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; color?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={11}>
      {children}
    </text>
  );
}

/** 角管・矩形管（b, h, t は画面上の長さ） */
function Tube({ cx, cy, b, h, t }: Pt & { b: number; h: number; t: number }) {
  const [x, y] = [cx - b / 2, cy - h / 2];
  const d = `M${x} ${y}h${b}v${h}h${-b}z M${x + t} ${y + t}v${h - 2 * t}h${b - 2 * t}v${-(h - 2 * t)}z`;
  return <path d={d} fill={SEC} fillRule="evenodd" />;
}

function Solid({ cx, cy, b, h }: Pt & { b: number; h: number }) {
  return <rect x={cx - b / 2} y={cy - h / 2} width={b} height={h} fill={SEC} />;
}

function Ring({ cx, cy, d, t }: Pt & { d: number; t: number }) {
  return <circle cx={cx} cy={cy} r={(d - t) / 2} fill="none" stroke={SEC} strokeWidth={t} />;
}

/** 上辺の中央を切り開いた角管（開断面） */
function SlitTube({ cx, cy, size, t }: Pt & { size: number; t: number }) {
  const m = size / 2 - t / 2;
  const gap = 4;
  const d = `M${cx - gap} ${cy - m}H${cx - m}V${cy + m}H${cx + m}V${cy - m}H${cx + gap}`;
  return <path d={d} fill="none" stroke={SEC} strokeWidth={t} />;
}

/** 中立軸（曲げの軸は水平） */
function Axis({ x1, x2, y, label = false }: { x1: number; x2: number; y: number; label?: boolean }) {
  return (
    <>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={AXIS} strokeWidth={1} strokeDasharray="8 3 2 3" />
      {label && (
        <Label x={x2 + 3} y={y + 4} anchor="start" color={AXIS}>
          中立軸
        </Label>
      )}
    </>
  );
}

function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <>
      <path d={`M${x1} ${y - 4}v8M${x2} ${y - 4}v8M${x1} ${y}H${x2}`} stroke={DIM} strokeWidth={1} fill="none" />
      <Label x={(x1 + x2) / 2} y={y + 14}>
        {label}
      </Label>
    </>
  );
}

function DimV({ x, y1, y2, label, side = "left" }: { x: number; y1: number; y2: number; label: string; side?: "left" | "right" }) {
  return (
    <>
      <path d={`M${x - 4} ${y1}h8M${x - 4} ${y2}h8M${x} ${y1}V${y2}`} stroke={DIM} strokeWidth={1} fill="none" />
      <Label x={side === "left" ? x - 7 : x + 7} y={(y1 + y2) / 2 + 4} anchor={side === "left" ? "end" : "start"}>
        {label}
      </Label>
    </>
  );
}

function Arrow({ x1, y1, x2, y2, color = LOAD }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = [a + 2.6, a - 2.6].map((r) => `${x2 + 8 * Math.cos(r)},${y2 + 8 * Math.sin(r)}`).join(" ");
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} />
      <polygon points={`${x2},${y2} ${head}`} fill={color} />
    </>
  );
}

/** 板厚など、図の中の一点を指す引き出し線 */
function Lead({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth={1} />
      <Label x={x2 + 3} y={y2 + 4} anchor="start">
        {label}
      </Label>
    </>
  );
}

/** 曲げ応力の分布。elastic＝三角（Z の世界）、plastic＝全断面が降伏（Zp の世界） */
function Stress({ x, cy, h, w, kind = "elastic" }: { x: number; cy: number; h: number; w: number; kind?: "elastic" | "plastic" }) {
  const [top, bot] = [cy - h / 2, cy + h / 2];
  const pts =
    kind === "elastic"
      ? `${x},${top} ${x + w},${top} ${x - w},${bot} ${x},${bot}`
      : `${x},${top} ${x + w},${top} ${x + w},${cy} ${x - w},${cy} ${x - w},${bot} ${x},${bot}`;
  return (
    <>
      <polygon points={pts} fill={STRESS} fillOpacity={0.25} stroke={STRESS} strokeWidth={1} />
      <line x1={x} x2={x} y1={top - 4} y2={bot + 4} stroke={DIM} strokeWidth={1} />
    </>
  );
}

/** 軸力を受ける棒の側面と、切り口の位置 */
function AxialBar({ y, label }: { y: number; label: string }) {
  return (
    <>
      <rect x={50} y={y - 12} width={110} height={24} fill="var(--dsn-soft)" stroke={SEC} strokeWidth={1} />
      <Arrow x1={50} y1={y} x2={14} y2={y} />
      <Arrow x1={160} y1={y} x2={196} y2={y} />
      <line x1={105} x2={105} y1={y - 22} y2={y + 22} stroke={DIM} strokeDasharray="3 3" />
      <Label x={105} y={y - 28}>
        {label}
      </Label>
      <Label x={105} y={y + 36}>
        切り口 →
      </Label>
    </>
  );
}

/** 片持ち梁の側面（先端荷重） */
function Cantilever({ x, y, L, f = "F", delta }: { x: number; y: number; L: number; f?: string; delta?: string }) {
  return (
    <>
      <rect x={x - 8} y={y - 16} width={8} height={32} fill={AXIS} />
      <rect x={x} y={y - 4} width={L} height={8} fill="var(--dsn-soft)" stroke={SEC} strokeWidth={1} />
      <path d={`M${x} ${y}Q${x + L * 0.6} ${y} ${x + L} ${y + 14}`} fill="none" stroke={DIM} strokeDasharray="3 3" />
      <Arrow x1={x + L} y1={y - 24} x2={x + L} y2={y - 5} />
      <Label x={x + L - 4} y={y - 16} anchor="end" color={LOAD}>
        {f}
      </Label>
      {delta && (
        <Label x={x + L + 5} y={y + 16} anchor="start">
          {delta}
        </Label>
      )}
    </>
  );
}

/** 両端支持の側面（中央荷重） */
function Simple({ x, y, L, f = "F" }: { x: number; y: number; L: number; f?: string }) {
  const tri = (px: number) => `M${px} ${y + 4}l-6 10h12z`;
  return (
    <>
      <rect x={x} y={y - 4} width={L} height={8} fill="var(--dsn-soft)" stroke={SEC} strokeWidth={1} />
      <path d={`${tri(x + 3)}${tri(x + L - 3)}`} fill={AXIS} />
      <Arrow x1={x + L / 2} y1={y - 24} x2={x + L / 2} y2={y - 5} />
      <Label x={x + L / 2 + 5} y={y - 16} anchor="start" color={LOAD}>
        {f}
      </Label>
    </>
  );
}

/** □50×t の閉断面と、同じ板を切り開いた開断面を同じ縮尺で並べる */
function ClosedOpen({ t, spec }: { t: number; spec: string }) {
  const s = 1.6;
  return (
    <>
      <Tube cx={85} cy={58} b={50 * s} h={50 * s} t={t * s} />
      <SlitTube cx={235} cy={58} size={50 * s} t={t * s} />
      <Label x={85} y={118}>閉じた断面</Label>
      <Label x={235} y={118}>切り開いた断面</Label>
      <Label x={160} y={62}>{spec}</Label>
    </>
  );
}

/** 図の中で選ばせる点。番号は問いの選択肢と対応する */
function Mark({ x, y, n, dx = 0, dy = 18 }: { x: number; y: number; n: string; dx?: number; dy?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={3} fill={STRESS} />
      <Label x={x + dx} y={y + dy} color={STRESS}>
        {n}
      </Label>
    </>
  );
}

/** 寸法を読ませる方眼 */
function Grid({ x, y, cols, rows, cell }: { x: number; y: number; cols: number; rows: number; cell: number }) {
  const v = Array.from({ length: cols + 1 }, (_, i) => `M${x + i * cell} ${y}v${rows * cell}`);
  const h = Array.from({ length: rows + 1 }, (_, i) => `M${x} ${y + i * cell}h${cols * cell}`);
  return <path d={[...v, ...h].join("")} stroke={AXIS} strokeWidth={0.5} strokeOpacity={0.6} fill="none" />;
}

/** H 形断面。turned でウェブを横にする */
function HSection({ cx, cy, b, h, t, turned = false }: Pt & { b: number; h: number; t: number; turned?: boolean }) {
  return (
    <g transform={turned ? `rotate(90 ${cx} ${cy})` : undefined} fill={SEC}>
      <rect x={cx - b / 2} y={cy - h / 2} width={b} height={t} />
      <rect x={cx - b / 2} y={cy + h / 2 - t} width={b} height={t} />
      <rect x={cx - t / 2} y={cy - h / 2} width={t} height={h} />
    </g>
  );
}

/** 開いた線の断面（C 形・ハット形）。d は板厚の中心線 */
function OpenSection({ d, t, color = SEC }: { d: string; t: number; color?: string }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={t} />;
}

/** 角管と、選ばせる4点（d1-28, 29 共通） */
function BoxPoints() {
  return (
    <>
      <Axis x1={40} x2={180} y={70} />
      <Tube cx={110} cy={70} b={100} h={100} t={2.4} />
      <Mark x={61} y={21} n="①" dx={-13} dy={4} />
      <Mark x={61} y={45} n="②" dx={-13} dy={4} />
      <Mark x={61} y={70} n="③" dx={-13} dy={-5} />
      <Mark x={61} y={119} n="④" dx={-13} dy={4} />
    </>
  );
}

/** 方眼に載せた T 字断面（1マス 10 mm）。上フランジ 60×10、ウェブ 10×40 */
function TSection() {
  return (
    <>
      <Grid x={80} y={8} cols={8} rows={6} cell={20} />
      <rect x={100} y={28} width={120} height={20} fill={SEC} fillOpacity={0.85} />
      <rect x={150} y={48} width={20} height={80} fill={SEC} fillOpacity={0.85} />
      <Label x={160} y={146} color={AXIS}>1マス = 10 mm</Label>
    </>
  );
}

type Fig = { h: number; alt: string; body: ReactNode };

const FIGURES: Record<string, Fig> = {
  "d1-01": {
    h: 125,
    alt: "軸方向に 10 kN で引かれる棒の側面と、断面積 100 mm² の切り口",
    body: (
      <>
        <AxialBar y={55} label="F = 10 kN" />
        <Solid cx={260} cy={55} b={50} h={50} />
        <Label x={260} y={100}>A = 100 mm²</Label>
      </>
    ),
  },
  "d1-02": {
    h: 175,
    alt: "幅 50、高さ 50、板厚 1.2 の角管の断面",
    body: (
      <>
        <Tube cx={130} cy={78} b={120} h={120} t={2.88} />
        <DimV x={55} y1={18} y2={138} label="50" />
        <DimH x1={70} x2={190} y={150} label="50" />
        <Lead x1={188} y1={70} x2={215} y2={70} label="t1.2" />
        <Label x={215} y={100} anchor="start" color={AXIS}>板厚も実寸の比</Label>
      </>
    ),
  },
  "d1-03": {
    h: 130,
    alt: "軸方向に引かれる棒の側面と、50 角、板厚 1.2 の角管の切り口",
    body: (
      <>
        <AxialBar y={60} label="F = ?" />
        <Tube cx={262} cy={52} b={70} h={70} t={1.68} />
        <Label x={262} y={104}>□50×t1.2</Label>
        <Label x={262} y={120}>σy = 590 MPa</Label>
      </>
    ),
  },
  "d1-04": {
    h: 165,
    alt: "50 角、板厚 1.2 の角管の断面。中立軸から外面までの距離 25",
    body: (
      <>
        <Axis x1={50} x2={190} y={80} />
        <Tube cx={120} cy={80} b={120} h={120} t={2.88} />
        <DimV x={195} y1={20} y2={80} label="y_max = 25" side="right" />
        <Lead x1={178} y1={120} x2={205} y2={120} label="t1.2" />
        <Label x={40} y={15} anchor="start">□50×t1.2</Label>
      </>
    ),
  },
  "d1-05": {
    h: 155,
    alt: "断面係数 4000 mm³ の角管に曲げ 2 kN·m。曲げ応力は上下の外面で最大になる三角形の分布",
    body: (
      <>
        <Axis x1={30} x2={280} y={65} />
        <Tube cx={90} cy={65} b={100} h={100} t={2.4} />
        <Stress x={215} cy={65} h={100} w={45} />
        <Label x={90} y={132}>Z = 4,000 mm³</Label>
        <Label x={90} y={148}>M = 2 kN·m</Label>
        <Label x={215} y={132}>曲げ応力の分布</Label>
        <Label x={264} y={22} anchor="start" color={STRESS}>σ = ?</Label>
      </>
    ),
  },
  "d1-06": {
    h: 170,
    alt: "板厚が同じ 2 つの角管。右は幅も高さも左の 2 倍",
    body: (
      <>
        <Tube cx={75} cy={82} b={60} h={60} t={2} />
        <DimV x={35} y1={52} y2={112} label="h" />
        <DimH x1={45} x2={105} y={122} label="h" />
        <Arrow x1={112} y1={82} x2={136} y2={82} color={DIM} />
        <Tube cx={230} cy={72} b={120} h={120} t={2} />
        <DimV x={162} y1={12} y2={132} label="2h" />
        <DimH x1={170} x2={290} y={142} label="2h" />
        <Label x={75} y={36}>t は同じ</Label>
      </>
    ),
  },
  "d1-07": {
    h: 140,
    alt: "今の角管と、板厚を増した案、背を高くした案、中実にした案の 4 つの断面",
    body: (
      <>
        <Axis x1={8} x2={312} y={60} />
        <Tube cx={45} cy={60} b={50} h={50} t={2} />
        <Tube cx={122} cy={60} b={50} h={50} t={6} />
        <Tube cx={199} cy={60} b={50} h={94} t={2} />
        <Solid cx={276} cy={60} b={50} h={50} />
        <Label x={45} y={124}>いま</Label>
        <Label x={122} y={124}>板厚を増す</Label>
        <Label x={199} y={124}>背を高く</Label>
        <Label x={276} y={124}>中実に</Label>
      </>
    ),
  },
  "d1-08": {
    h: 150,
    alt: "箱断面の、降伏し始めたときの三角形の応力分布と、全断面が降伏したときの長方形の応力分布",
    body: (
      <>
        <Axis x1={8} x2={312} y={65} />
        <Tube cx={62} cy={65} b={100} h={100} t={2.4} />
        <Stress x={172} cy={65} h={100} w={32} />
        <Stress x={268} cy={65} h={100} w={32} kind="plastic" />
        <Label x={172} y={134}>降伏の始まり（Z）</Label>
        <Label x={268} y={134}>全塑性（Zp）</Label>
      </>
    ),
  },
  "d1-09": { h: 130, alt: "板厚 4 の 50 角の閉断面と、同じ板を切り開いた開断面", body: <ClosedOpen t={4} spec="□50×t4" /> },
  "d1-10": {
    h: 130,
    alt: "5 枚の板でできたハット形の開断面。それぞれの板の幅と、共通の板厚 t",
    body: (
      <>
        <path d="M30 100H85L110 30H210L235 100H290" fill="none" stroke={SEC} strokeWidth={5} />
        <Label x={58} y={118}>b₁</Label>
        <Label x={84} y={62} anchor="end">b₂</Label>
        <Label x={160} y={20}>b₃</Label>
        <Label x={236} y={62} anchor="start">b₄</Label>
        <Label x={262} y={118}>b₅</Label>
        <Lead x1={160} y1={32} x2={160} y2={62} label="t" />
      </>
    ),
  },
  "d1-11": {
    h: 150,
    alt: "同じ断面の、先端に荷重を受ける片持ち梁と、中央に荷重を受ける両端支持梁",
    body: (
      <>
        <Cantilever x={38} y={38} L={170} />
        <Label x={123} y={68}>片持ち（長さ L）</Label>
        <Simple x={38} y={106} L={170} />
        <Label x={123} y={138}>両端支持（長さ L）</Label>
        <Tube cx={272} cy={70} b={56} h={56} t={1.5} />
        <Label x={272} y={118}>同じ断面</Label>
      </>
    ),
  },
  "d1-12": {
    h: 125,
    alt: "長さ 500 の片持ち梁の先端に 1 kN。断面は 50 角、板厚 1.2 の角管",
    body: (
      <>
        <Cantilever x={24} y={44} L={180} f="1 kN" delta="δ = ?" />
        <DimH x1={24} x2={204} y={82} label="L = 500" />
        <Tube cx={275} cy={44} b={60} h={60} t={1.44} />
        <Label x={275} y={92}>□50×t1.2</Label>
      </>
    ),
  },
  "d1-13": {
    h: 150,
    alt: "同じ荷重を受ける、長さ L と長さ 2L の片持ち梁",
    body: (
      <>
        <Cantilever x={24} y={38} L={90} delta="δ" />
        <DimH x1={24} x2={114} y={60} label="L" />
        <Cantilever x={24} y={106} L={180} delta="？" />
        <DimH x1={24} x2={204} y={128} label="2L" />
      </>
    ),
  },
  "d1-14": {
    h: 135,
    alt: "角管の断面の中立軸と外面までの距離、曲げ応力の分布、片持ち梁のたわみ",
    body: (
      <>
        <Axis x1={16} x2={205} y={60} />
        <Tube cx={68} cy={60} b={80} h={80} t={2} />
        <DimV x={118} y1={20} y2={60} label="y_max" side="right" />
        <Stress x={190} cy={60} h={80} w={22} />
        <Label x={190} y={120}>曲げ応力</Label>
        <Cantilever x={236} y={60} L={70} />
        <Label x={272} y={120}>たわみ</Label>
      </>
    ),
  },
  "d1-15": {
    h: 150,
    alt: "幅 3a、高さ a の横置きの中実矩形と、同じものを立てた幅 a、高さ 3a の縦置き",
    body: (
      <>
        <Axis x1={27} x2={262} y={68} />
        <Solid cx={75} cy={68} b={90} h={30} />
        <DimH x1={30} x2={120} y={94} label="3a" />
        <DimV x={22} y1={53} y2={83} label="a" />
        <Arrow x1={135} y1={40} x2={175} y2={40} color={DIM} />
        <Solid cx={235} cy={68} b={30} h={90} />
        <DimV x={268} y1={23} y2={113} label="3a" side="right" />
        <DimH x1={220} x2={250} y={121} label="a" />
        <Label x={75} y={28}>横置き</Label>
        <Label x={190} y={18}>縦置き</Label>
      </>
    ),
  },
  "d1-16": {
    h: 145,
    alt: "鋼の角管と、板厚が同じで高さが未知のアルミの角管",
    body: (
      <>
        <Tube cx={80} cy={58} b={80} h={80} t={2.5} />
        <DimV x={32} y1={18} y2={98} label="h" />
        <Label x={80} y={116}>鋼</Label>
        <Label x={80} y={132}>E = 210 GPa</Label>
        <Arrow x1={130} y1={58} x2={165} y2={58} color={DIM} />
        <rect x={190} y={18} width={80} height={80} fill="none" stroke={SEC} strokeWidth={2.5} strokeDasharray="6 4" />
        <DimV x={280} y1={18} y2={98} label="h×?" side="right" />
        <Label x={230} y={116}>アルミ（t は同じ）</Label>
        <Label x={230} y={132}>E = 70 GPa</Label>
      </>
    ),
  },
  "d1-17": {
    h: 150,
    alt: "同じ縮尺で描いた、断面積がほぼ同じ 4 つの断面：直径 17.5 の丸棒、15.5 角の中実、50 角板厚 1.2 の角管、直径 64 板厚 1.2 の円管",
    body: (
      <>
        <Label x={8} y={14} anchor="start" color={AXIS}>同じ縮尺・どれも約 240 mm²</Label>
        <Axis x1={4} x2={316} y={72} />
        <circle cx={28} cy={72} r={13.1} fill={SEC} />
        <Solid cx={76} cy={72} b={23.25} h={23.25} />
        <Tube cx={150} cy={72} b={75} h={75} t={1.8} />
        <Ring cx={258} cy={72} d={96} t={1.8} />
        <Label x={28} y={138}>φ17.5</Label>
        <Label x={76} y={138}>15.5角</Label>
        <Label x={150} y={138}>□50×t1.2</Label>
        <Label x={258} y={138}>φ64×t1.2</Label>
      </>
    ),
  },
  "d1-18": {
    h: 150,
    alt: "50 角、板厚 1.2 の角管と、全断面が 590 MPa で降伏した応力分布",
    body: (
      <>
        <Axis x1={30} x2={285} y={65} />
        <Tube cx={90} cy={65} b={100} h={100} t={2.4} />
        <Stress x={225} cy={65} h={100} w={45} kind="plastic" />
        <Label x={90} y={134}>□50×t1.2</Label>
        <Label x={225} y={134}>全塑性（σy = 590 MPa）</Label>
      </>
    ),
  },
  "d1-19": {
    h: 165,
    alt: "幅 50、高さ 100、板厚 2 の矩形管を縦長に置いた断面。曲げの軸は水平",
    body: (
      <>
        <Axis x1={112} x2={220} y={72} label />
        <Tube cx={150} cy={72} b={60} h={120} t={2.4} />
        <DimV x={108} y1={12} y2={132} label="100" />
        <DimH x1={120} x2={180} y={140} label="50" />
        <Lead x1={178} y1={35} x2={205} y2={35} label="t2" />
      </>
    ),
  },
  "d1-20": {
    h: 135,
    alt: "幅 100、高さ 50、板厚 2 の矩形管を横長に置いた断面。曲げの軸は水平",
    body: (
      <>
        <Axis x1={84} x2={230} y={50} label />
        <Tube cx={150} cy={50} b={120} h={60} t={2.4} />
        <DimV x={80} y1={20} y2={80} label="50" />
        <DimH x1={90} x2={210} y={92} label="100" />
        <Lead x1={208} y1={30} x2={235} y2={22} label="t2" />
      </>
    ),
  },
  "d1-21": {
    h: 165,
    alt: "幅 20、高さ 60 の中実矩形を縦長に置いた断面。曲げの軸は水平",
    body: (
      <>
        <Axis x1={122} x2={200} y={72} label />
        <Solid cx={150} cy={72} b={40} h={120} />
        <DimV x={118} y1={12} y2={132} label="60" />
        <DimH x1={130} x2={170} y={140} label="20" />
      </>
    ),
  },
  "d1-22": {
    h: 130,
    alt: "直径 20 の中実の丸棒の断面",
    body: (
      <>
        <Axis x1={90} x2={210} y={55} label />
        <circle cx={150} cy={55} r={40} fill={SEC} />
        <DimH x1={110} x2={190} y={103} label="φ20" />
      </>
    ),
  },
  "d1-23": {
    h: 165,
    alt: "直径 60、板厚 1.5 の円管の断面",
    body: (
      <>
        <Axis x1={70} x2={230} y={70} label />
        <Ring cx={150} cy={70} d={120} t={3} />
        <DimH x1={90} x2={210} y={140} label="φ60" />
        <Lead x1={192} y1={28} x2={215} y2={15} label="t1.5" />
      </>
    ),
  },
  "d1-24": { h: 130, alt: "板厚 1.2 の 50 角の閉断面と、同じ板を切り開いた開断面", body: <ClosedOpen t={1.2} spec="□50×t1.2" /> },
  "d1-25": {
    h: 155,
    alt: "同じ H 形断面を 2 通りに置いた図。①はフランジが上下、②はフランジが左右。曲げの軸は水平",
    body: (
      <>
        <Axis x1={10} x2={310} y={70} />
        <HSection cx={85} cy={70} b={60} h={120} t={6} />
        <HSection cx={235} cy={70} b={60} h={120} t={6} turned />
        <Label x={85} y={148}>①</Label>
        <Label x={235} y={148}>②</Label>
      </>
    ),
  },
  "d1-26": {
    h: 140,
    alt: "幅 30、厚さ 3 の定規を、①立てて置いた図と、②寝かせて置いた図。どちらも上から押す",
    body: (
      <>
        <Solid cx={80} cy={72} b={9} h={90} />
        <Arrow x1={80} y1={6} x2={80} y2={25} />
        <Solid cx={235} cy={72} b={90} h={9} />
        <Arrow x1={235} y1={40} x2={235} y2={66} />
        <Label x={80} y={134}>① 立てる</Label>
        <Label x={235} y={134}>② 寝かせる</Label>
      </>
    ),
  },
  "d1-27": {
    h: 165,
    alt: "幅 50、高さ 100、板厚 2 の縦長の矩形管を、左から水平に押す荷重",
    body: (
      <>
        <Tube cx={170} cy={72} b={60} h={120} t={2.4} />
        <Arrow x1={70} y1={72} x2={138} y2={72} />
        <Label x={88} y={64} color={LOAD}>F</Label>
        <DimV x={215} y1={12} y2={132} label="100" side="right" />
        <DimH x1={140} x2={200} y={140} label="50" />
      </>
    ),
  },
  "d1-28": {
    h: 135,
    alt: "角管の断面の 4 点。①上面、②上面と中立軸の中間、③中立軸の上、④下面",
    body: (
      <>
        <BoxPoints />
        <Label x={190} y={74} anchor="start" color={AXIS}>曲げの軸（水平）</Label>
      </>
    ),
  },
  "d1-29": {
    h: 135,
    alt: "角管の断面の 4 点と、上面で 400 MPa になる三角形の曲げ応力の分布",
    body: (
      <>
        <BoxPoints />
        <Stress x={245} cy={70} h={100} w={40} />
        <Label x={245} y={14} color={STRESS}>400 MPa</Label>
      </>
    ),
  },
  "d1-30": {
    h: 95,
    alt: "先端を下に押した片持ち梁。根元の上面が①、下面が②",
    body: (
      <>
        <Cantilever x={40} y={48} L={200} />
        <Mark x={46} y={44} n="①" dx={10} dy={-8} />
        <Mark x={46} y={52} n="②" dx={10} dy={20} />
      </>
    ),
  },
  "d1-31": {
    h: 90,
    alt: "先端に荷重を受ける片持ち梁。①根元、②中央、③先端",
    body: (
      <>
        <Cantilever x={30} y={45} L={220} />
        <Mark x={34} y={45} n="①" dy={36} />
        <Mark x={140} y={45} n="②" dy={36} />
        <Mark x={247} y={45} n="③" dy={36} />
      </>
    ),
  },
  "d1-32": {
    h: 100,
    alt: "中央に荷重を受ける両端支持梁。①支点の近く、②1/4 の位置、③中央",
    body: (
      <>
        <Simple x={30} y={45} L={220} />
        <Mark x={46} y={45} n="①" dy={40} />
        <Mark x={85} y={45} n="②" dy={40} />
        <Mark x={140} y={45} n="③" dy={40} />
      </>
    ),
  },
  "d1-33": {
    h: 105,
    alt: "長さ 1000 の両端支持梁の中央に 4 kN",
    body: (
      <>
        <Simple x={40} y={40} L={240} f="4 kN" />
        <DimH x1={40} x2={280} y={74} label="L = 1000" />
      </>
    ),
  },
  "d1-34": {
    h: 125,
    alt: "周長と板厚が同じ 4 つの断面。①円管、②角管、③切り開いた角管、④C 形",
    body: (
      <>
        <Ring cx={45} cy={55} d={70} t={1.32} />
        <Tube cx={122} cy={55} b={55} h={55} t={1.32} />
        <SlitTube cx={192} cy={55} size={55} t={1.32} />
        <OpenSection d="M312 22H235V88H312" t={1.32} />
        <Label x={45} y={112}>①</Label>
        <Label x={122} y={112}>②</Label>
        <Label x={192} y={112}>③</Label>
        <Label x={272} y={112}>④</Label>
      </>
    ),
  },
  "d1-35": {
    h: 115,
    alt: "ハット断面だけの開断面と、下に閉じ板を溶接した閉断面",
    body: (
      <>
        <OpenSection d="M12 75H37L52 25H92L107 75H132" t={3} />
        <OpenSection d="M177 75H202L217 25H257L272 75H297" t={3} />
        <OpenSection d="M177 78H297" t={3} color={STRESS} />
        <Label x={72} y={104}>ハットだけ</Label>
        <Label x={237} y={104}>閉じ板を溶接</Label>
      </>
    ),
  },
  "d1-36": {
    h: 175,
    alt: "幅 50、高さ 50 の角管の断面。板厚は図から読む",
    body: (
      <>
        <Tube cx={130} cy={78} b={120} h={120} t={4.8} />
        <DimV x={55} y1={18} y2={138} label="50" />
        <DimH x1={70} x2={190} y={150} label="50" />
        <Lead x1={187} y1={70} x2={215} y2={70} label="t = ?" />
      </>
    ),
  },
  "d1-37": {
    h: 178,
    alt: "方眼の上の中実の矩形。幅は 3 マス、高さは 4 マス。1 マスは 10 mm",
    body: (
      <>
        <Grid x={75} y={8} cols={6} rows={6} cell={25} />
        <rect x={100} y={33} width={75} height={100} fill={SEC} fillOpacity={0.85} />
        <Axis x1={75} x2={225} y={83} label />
        <Label x={150} y={172} color={AXIS}>1マス = 10 mm</Label>
      </>
    ),
  },
  "d1-38": {
    h: 172,
    alt: "方眼の上の中空の矩形。外形は幅 4 マス、高さ 6 マスで、壁の厚さは 1 マス。1 マスは 10 mm",
    body: (
      <>
        <Grid x={100} y={6} cols={6} rows={7} cell={20} />
        <path d="M120 26h80v120h-80z M140 46v80h40v-80z" fill={SEC} fillOpacity={0.85} fillRule="evenodd" />
        <Label x={160} y={165} color={AXIS}>1マス = 10 mm</Label>
      </>
    ),
  },
  "d1-39": {
    h: 155,
    alt: "方眼の上の T 字断面。上のフランジは幅 6 マス、厚さ 1 マス。ウェブは幅 1 マス、高さ 4 マス。1 マスは 10 mm",
    body: <TSection />,
  },
  "d1-40": {
    h: 155,
    alt: "方眼の上の T 字断面と中立軸。中立軸は下端から 35 mm の高さ",
    body: (
      <>
        <TSection />
        <Axis x1={80} x2={240} y={58} label />
        <Label x={246} y={32} anchor="start">上端</Label>
        <Label x={176} y={122} anchor="start">下端</Label>
      </>
    ),
  },
  "d1-41": {
    h: 158,
    alt: "同じ矩形断面に開けた同じ大きさの穴。①は中立軸の上、②は上の外縁の近く",
    body: (
      <>
        <Solid cx={90} cy={70} b={70} h={120} />
        <circle cx={90} cy={70} r={12} fill="var(--surface-2)" />
        <Solid cx={230} cy={70} b={70} h={120} />
        <circle cx={230} cy={28} r={12} fill="var(--surface-2)" />
        <Axis x1={30} x2={290} y={70} />
        <Label x={90} y={150}>①</Label>
        <Label x={230} y={150}>②</Label>
      </>
    ),
  },
  "d1-42": {
    h: 118,
    alt: "同じ 2 枚の板。左は重ねただけ、右は接着して一体にしたもの",
    body: (
      <>
        <Solid cx={85} cy={36} b={110} h={18} />
        <Solid cx={85} cy={58} b={110} h={18} />
        <Solid cx={235} cy={47} b={110} h={40} />
        <line x1={180} x2={290} y1={47} y2={47} stroke={STRESS} strokeWidth={1.5} />
        <Label x={85} y={100}>重ねただけ</Label>
        <Label x={235} y={100}>接着して一体</Label>
      </>
    ),
  },
  "d1-43": {
    h: 145,
    alt: "H 形断面。上下の板がフランジ、縦の板がウェブ。曲げの軸は水平",
    body: (
      <>
        <Axis x1={50} x2={170} y={72} />
        <HSection cx={110} cy={72} b={60} h={120} t={6} />
        <Lead x1={138} y1={15} x2={170} y2={15} label="フランジ" />
        <Lead x1={112} y1={100} x2={170} y2={100} label="ウェブ" />
      </>
    ),
  },
  "d1-44": {
    h: 145,
    alt: "H 形断面に、上から下へのせん断力の矢印。上下の板がフランジ、縦の板がウェブ",
    body: (
      <>
        <HSection cx={110} cy={72} b={60} h={120} t={6} />
        <Arrow x1={40} y1={40} x2={40} y2={104} />
        <Label x={30} y={76} anchor="end" color={LOAD}>F</Label>
        <Lead x1={138} y1={15} x2={170} y2={15} label="フランジ" />
        <Lead x1={112} y1={100} x2={170} y2={100} label="ウェブ" />
      </>
    ),
  },
  "d1-45": {
    h: 165,
    alt: "幅 20、高さ 60 の中実矩形の柱の断面。軸力は紙面に垂直",
    body: (
      <>
        <Solid cx={120} cy={72} b={40} h={120} />
        <DimV x={88} y1={12} y2={132} label="60" />
        <DimH x1={100} x2={140} y={140} label="20" />
        <Label x={165} y={76} anchor="start">軸力は紙面に垂直</Label>
      </>
    ),
  },
};

export default function SectionFigure({ id }: { id: string }) {
  const fig = FIGURES[id];
  if (!fig) return null;
  return (
    <svg
      viewBox={`0 0 320 ${fig.h}`}
      role="img"
      aria-label={fig.alt}
      className="w-full max-w-sm self-center rounded-md border border-line bg-surface2"
    >
      {fig.body}
    </svg>
  );
}
