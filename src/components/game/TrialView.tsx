"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import MissRegister from "@/components/game/MissRegister";
import NoteLink from "@/components/game/NoteLink";
import { dayKey } from "@/lib/date";
import { fmt } from "@/lib/game/levels";
import { eventMultiplier } from "@/lib/game/magic";
import { TRIAL, TRIAL_CAT, type TrialCat, type TrialQuestion } from "@/lib/game/quiz";
import { play } from "@/lib/game/sfx";
import { answerTrial, recordBoss, recordTrialRun, type GameDoc } from "@/lib/game/state";
import { areaById } from "@/lib/game/world";

/**
 * 限定語の試練場。問いの〔限定語〕に印を付けるまで選択肢を隠し、1問41秒で解く。
 * 本人の最大の失点源「限定語の読み飛ばし」を直すための場所なので、野生戦とは分けてある。
 * 元は claude.ai の Artifact「G検定 限定語ドリル」（2026-11-03）。
 */

/** 本番は 160問 / 120分 ≒ 1問41秒 */
const LIMIT = 41;
/** ボス戦になるモード。合格ラインは world.ts の t1 */
const BOSS_MODE = "mix20";
const SETTINGS_KEY = "sq-trial-settings";

type Mode = { key: string; name: string; desc: string; pick: (g: GameDoc) => TrialQuestion[] };

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const byCat = (c: TrialCat) => TRIAL.filter((q) => q.cat === c);
const wrongLast = (g: GameDoc) => TRIAL.filter((q) => g.trial[q.id]?.last === false);
const unseen = (g: GameDoc) => TRIAL.filter((q) => !g.trial[q.id]);

const MODES: Mode[] = [
  { key: "mix10", name: "ランダム10問", desc: "全分類から。7分弱", pick: () => shuffle(TRIAL).slice(0, 10) },
  { key: BOSS_MODE, name: "ランダム20問", desc: "本番の時間感覚で14分。ボス戦", pick: () => shuffle(TRIAL).slice(0, 20) },
  ...(Object.keys(TRIAL_CAT) as TrialCat[]).map((c) => ({
    key: c,
    name: TRIAL_CAT[c],
    desc: { led: "台帳で落とした・再発した項目", pair: "C2⑦の対比表から", gen: "唯一の新規インプット", law: "2026-11 時点の法律の最新事実を含む" }[c],
    pick: () => shuffle(byCat(c)),
  })),
  { key: "wrong", name: "前回まちがえた問題", desc: "最後に解いたとき誤答だったもの", pick: (g) => shuffle(wrongLast(g)) },
  { key: "new", name: "まだ解いていない問題", desc: "一度も出ていないもの", pick: (g) => shuffle(unseen(g)).slice(0, 20) },
];

type Result = { q: TrialQuestion; ok: boolean; sec: number; pick: number };
type Run = { mode: Mode; qs: TrialQuestion[]; i: number; res: Result[] };

export default function TrialView() {
  const { game, say } = useGame();
  const [settings, setSettings] = useState({ gate: true, timer: true });
  const [run, setRun] = useState<Run | null>(null);
  const [done, setDone] = useState<Run | null>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
      if (s) setSettings((prev) => ({ ...prev, ...s }));
    } catch {}
  }, []);
  const toggle = (k: "gate" | "timer") => {
    const next = { ...settings, [k]: !settings[k] };
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {}
  };

  const start = (m: Mode, qs = m.pick(game)) => {
    if (!qs.length) return;
    play("select");
    setDone(null);
    setRun({ mode: m, qs, i: 0, res: [] });
    say(m.key === BOSS_MODE ? ["読み飛ばしの影が 立ちはだかった！", "20問中 14問 正解で撃破。"] : [`${m.name}を はじめる。`, "まず〔限定語〕を口に出して 印を付けよう。"]);
  };

  const finish = async (r: Run) => {
    setRun(null);
    if (!r.res.length) return;
    setDone(r);
    const ok = r.res.filter((x) => x.ok).length;
    const avg = Math.round((r.res.reduce((a, x) => a + x.sec, 0) / r.res.length) * 10) / 10;
    await recordTrialRun({ date: dayKey(), mode: r.mode.name, n: r.res.length, ok, avg });
    const area = areaById("t1")!;
    // ボス戦は20問を最後まで解いたときだけ数える
    if (r.mode.key === BOSS_MODE && r.res.length === r.qs.length) {
      const out = await recordBoss(game, area, ok);
      if (out.firstClear) {
        play("levelUp");
        say([`${area.boss}を たおした！（${ok}/${r.res.length}）`, `${fmt(area.xp)} の経験値と ${fmt(area.gold)}G を獲得！`]);
      } else if (out.cleared) {
        play("defeat");
        say([`${area.boss}を 再び たおした！（${ok}/${r.res.length}）`, "報酬は初回だけ。最高記録を記録した。"]);
      } else {
        play("miss");
        say([`${area.boss}は まだ倒れない…（${ok}/${r.res.length}）`, `合格ラインは ${area.pass}問。間違えた問題を台帳に入れて出直そう。`]);
      }
    } else {
      say([`${r.mode.name}：${ok}/${r.res.length}問 正解`, `平均 ${avg}秒/問（目安 ${LIMIT}秒）`]);
    }
  };

  if (run) {
    return (
      <TrialQuestionView
        key={`${run.i}-${run.qs[run.i].id}`}
        run={run}
        settings={settings}
        onAnswer={(res) => {
          const correct = res.ok;
          void answerTrial(game, res.q.id, correct, eventMultiplier("ml"));
          play(correct ? "hit" : "miss");
          setRun({ ...run, res: [...run.res, res] });
        }}
        onNext={() => (run.i + 1 < run.qs.length ? setRun({ ...run, i: run.i + 1 }) : void finish(run))}
        onQuit={() => void finish(run)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {done && <TrialResult run={done} onRetry={(qs) => start({ ...done.mode, key: "retry", name: "まちがえた問題の再挑戦" }, shuffle(qs))} />}
      <TrialHome game={game} settings={settings} toggle={toggle} onStart={(m) => start(m)} />
    </div>
  );
}

function TrialHome({
  game,
  settings,
  toggle,
  onStart,
}: {
  game: GameDoc;
  settings: { gate: boolean; timer: boolean };
  toggle: (k: "gate" | "timer") => void;
  onStart: (m: Mode) => void;
}) {
  const counts: Record<string, number> = {
    mix10: 10,
    [BOSS_MODE]: 20,
    ...Object.fromEntries((Object.keys(TRIAL_CAT) as TrialCat[]).map((c) => [c, byCat(c).length])),
    wrong: wrongLast(game).length,
    new: Math.min(20, unseen(game).length),
  };
  const boss = game.bosses.t1;
  const last = game.trialLast;

  return (
    <>
      <section className="win flex flex-col gap-2 pt-4" aria-label="モード">
        <span className="win-label">モードを選ぶ</span>
        <div className="grid grid-cols-2 gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              disabled={!counts[m.key]}
              onClick={() => onStart(m)}
              className={`flex flex-col gap-0.5 rounded-md border-2 px-2 py-1.5 text-left disabled:opacity-40 ${m.key === BOSS_MODE ? "border-gold" : "border-line hover:border-ink"}`}
            >
              <span className="text-sm">{m.name}</span>
              <span className="text-[11px] leading-snug text-faint">{m.desc}</span>
              <span className="font-dot text-xs text-ml">{counts[m.key]}問</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-faint">
          ボス：読み飛ばしの影（ランダム20問で14問以上）
          {boss?.clearedAt ? <span className="ml-1 text-gold">★ 撃破 {boss.clearedAt}</span> : " ・ 未撃破"}
          {boss && ` ・ 最高 ${boss.best}/20`}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.gate} onChange={() => toggle("gate")} className="h-4 w-4 accent-[var(--gold)]" />
          限定語に印を付けるまで選択肢を隠す
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.timer} onChange={() => toggle("timer")} className="h-4 w-4 accent-[var(--gold)]" />
          1問{LIMIT}秒のタイマー
        </label>
      </section>

      <section className="win flex flex-col gap-2 pt-4" aria-label="これまでの記録">
        <span className="win-label">これまでの記録</span>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TRIAL_CAT) as TrialCat[]).map((c) => {
            const qs = byCat(c);
            let n = 0;
            let ok = 0;
            for (const q of qs) {
              const s = game.trial[q.id];
              if (s) {
                n += s.n;
                ok += s.ok;
              }
            }
            const rate = n ? Math.round((ok / n) * 100) : null;
            return (
              <div key={c} className="flex flex-col gap-0.5 border-t-2 border-line pt-1">
                <span className="text-[11px] text-faint">{TRIAL_CAT[c]}</span>
                <span className="font-dot text-base">{rate === null ? "—" : `${rate}%`}</span>
                <span className="text-[11px] text-faint">
                  {qs.filter((q) => game.trial[q.id]).length}/{qs.length}問に挑戦
                </span>
                <span className="h-1 bg-line">
                  <span className="block h-full bg-ml" style={{ width: `${rate ?? 0}%` }} />
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-faint">
          {last ? `前回 ${last.date}：${last.mode} ${last.ok}/${last.n}問正解、平均${last.avg}秒` : `まだ記録はない。全${TRIAL.length}問。`}
        </p>
      </section>

      <section className="win flex flex-col gap-1 pt-4" aria-label="解き方">
        <span className="win-label">解き方</span>
        <ol className="list-decimal pl-5 text-sm leading-relaxed">
          <li>問いの中の限定語（〔誤っているもの〕〔それぞれ〕〔理由〕など）を口に出し、タップして印を付ける</li>
          <li>「違い」なら答える前に対比の軸を1本立て、両側を考える</li>
          <li>「誤っているもの」は知っている選択肢から先に潰す</li>
        </ol>
        <NoteLink id="t1" label="G検定 MOC（答え方の習慣）" />
      </section>
    </>
  );
}

function TrialQuestionView({
  run,
  settings,
  onAnswer,
  onNext,
  onQuit,
}: {
  run: Run;
  settings: { gate: boolean; timer: boolean };
  onAnswer: (r: Result) => void;
  onNext: () => void;
  onQuit: () => void;
}) {
  const q = run.qs[run.i];
  const parts = q.q.split(/(〔[^〕]+〕)/).filter(Boolean);
  const nMarks = parts.filter((p) => p.startsWith("〔")).length;
  const [order] = useState(() => shuffle([0, 1, 2, 3]));
  const [marked, setMarked] = useState<number[]>(() => (settings.gate ? [] : parts.map((_, i) => i)));
  const [picked, setPicked] = useState<number | null>(null);
  const [sec, setSec] = useState(0);
  const t0 = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const open = !settings.gate || nMarks === 0 || parts.every((p, i) => !p.startsWith("〔") || marked.includes(i));
  const answered = picked !== null;

  useEffect(() => {
    t0.current = performance.now();
    if (!settings.timer) return;
    const id = setInterval(() => setSec((performance.now() - t0.current) / 1000), 100);
    return () => clearInterval(id);
  }, [settings.timer]);

  const pick = (oi: number) => {
    if (answered) return;
    const s = (performance.now() - t0.current) / 1000;
    setSec(s);
    setPicked(oi);
    onAnswer({ q, ok: oi === q.answer, sec: s, pick: oi });
  };

  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  // 1〜4 で選ぶ。Enter は答えた後の「次へ」ボタンに焦点が移るので、ブラウザの既定で進む
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answered || !open || !/^[1-4]$/.test(e.key)) return;
      pick(order[Number(e.key) - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const left = parts.filter((p, i) => p.startsWith("〔") && !marked.includes(i)).length;
  const over = settings.timer && sec > LIMIT;
  const ok = picked === q.answer;

  return (
    <div className="flex flex-col gap-3">
      <section className="win flex flex-col gap-2 pt-4" aria-live="polite">
        <span className="win-label text-ml">{TRIAL_CAT[q.cat]}</span>
        <div className="flex items-center justify-between text-xs text-faint">
          <span>{run.mode.name}</span>
          <span className="font-dot">
            {run.i + 1} / {run.qs.length}
          </span>
        </div>
        {settings.timer && (
          <div className="flex flex-col gap-0.5">
            <span className="h-1.5 bg-line">
              <span className={`block h-full ${over ? "bg-danger" : "bg-ml"}`} style={{ width: `${Math.min(100, (sec / LIMIT) * 100)}%` }} />
            </span>
            <span className={`font-dot self-end text-[11px] tabular-nums ${over ? "text-danger" : "text-faint"}`}>
              {sec.toFixed(1)} / {LIMIT}秒
            </span>
          </div>
        )}
        <p className="text-[15px] leading-loose">
          {parts.map((p, i) =>
            p.startsWith("〔") ? (
              <button
                key={i}
                type="button"
                onClick={() => setMarked((m) => (m.includes(i) ? m : [...m, i]))}
                className={`mx-0.5 px-0.5 font-bold ${marked.includes(i) ? "bg-gold text-bg" : "border-b-2 border-dashed border-gold"}`}
              >
                {p.slice(1, -1)}
              </button>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
        </p>
        {!open && <p className="text-xs text-gold">限定語をタップして印を付けると選択肢が出る（残り{left}）</p>}
        {open && (
          <ol className="flex flex-col gap-1.5">
            {order.map((oi, ix) => {
              const style = !answered
                ? "border-line hover:border-ink"
                : oi === q.answer
                  ? "border-ok text-ok"
                  : oi === picked
                    ? "border-danger text-danger"
                    : "border-line text-faint";
              return (
                <li key={oi}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => pick(oi)}
                    className={`flex w-full items-start gap-2 rounded-md border-2 px-2.5 py-1.5 text-left text-sm leading-snug ${style}`}
                  >
                    <span className="font-dot shrink-0">{ix + 1}</span>
                    <span>{q.choices[oi]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        {answered && (
          <div className="flex flex-col gap-1.5 border-t border-line pt-2">
            <p className={`font-dot ${ok ? "text-ok" : "text-danger"}`}>
              {ok ? "せいかい！" : "ざんねん…"}
              <span className="ml-2 font-sans text-xs text-faint">
                {sec.toFixed(1)}秒{over ? `（${LIMIT}秒超過）` : ""}
              </span>
            </p>
            <p className="text-sm leading-relaxed text-muted">{q.explain}</p>
            {q.axis && <p className="rounded-md bg-mlsoft px-2 py-1 text-sm">軸：{q.axis}</p>}
            <NoteLink path={q.note} label={`ノートで確かめる：${q.note.split("/").pop()}`} />
            {!ok && <MissRegister question={q} area="t1" />}
            <button ref={nextRef} type="button" onClick={onNext} className="font-dot self-end rounded-md border-2 border-ink px-4 py-1">
              {run.i + 1 < run.qs.length ? "つぎ ▶" : "結果を見る ▶"}
            </button>
          </div>
        )}
      </section>
      <button type="button" onClick={onQuit} className="self-start text-xs text-faint">
        中断して結果へ
      </button>
    </div>
  );
}

function TrialResult({ run, onRetry }: { run: Run; onRetry: (qs: TrialQuestion[]) => void }) {
  const r = run.res;
  const ok = r.filter((x) => x.ok).length;
  const avg = (r.reduce((a, x) => a + x.sec, 0) / r.length).toFixed(1);
  const over = r.filter((x) => x.sec > LIMIT).length;
  const wrong = r.filter((x) => !x.ok);
  const plain = (s: string) => s.replace(/[〔〕]/g, "");
  // vault の誤答台帳.md に貼る行（アプリの台帳とは別。vault 側が誤答の正本）
  const ledger = wrong
    .map((x) => `| ${x.q.note.split("/").pop()?.split("_")[0]}/試練場 | 「${x.q.choices[x.pick]}」を選んだ | ${x.q.axis || x.q.choices[x.q.answer]} | 🆕演習(${dayKey()}) |`)
    .join("\n");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ledger);
      setCopied(true);
    } catch {}
  };

  return (
    <>
      <section className="win flex flex-col gap-2 pt-4" aria-label="結果">
        <span className="win-label">{run.mode.name} の結果</span>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="font-dot text-3xl tabular-nums">
              {ok}
              <span className="text-base"> / {r.length}</span>
            </p>
            <p className="text-xs text-faint">正解</p>
          </div>
          <div>
            <p className="font-dot text-2xl tabular-nums">
              {avg}
              <span className="text-sm">秒</span>
            </p>
            <p className="text-xs text-faint">1問の平均（目安{LIMIT}秒）</p>
          </div>
          <div>
            <p className={`font-dot text-2xl tabular-nums ${over ? "text-danger" : ""}`}>{over}</p>
            <p className="text-xs text-faint">{LIMIT}秒超過</p>
          </div>
        </div>
      </section>
      {wrong.length > 0 && (
        <section className="win flex flex-col gap-2 pt-4" aria-label="まちがえた問題">
          <span className="win-label">まちがえた問題</span>
          {wrong.map((x) => (
            <div key={x.q.id} className="flex flex-col gap-1 border-l-2 border-danger pl-2">
              <p className="text-sm">{plain(x.q.q)}</p>
              <p className="text-xs text-danger">選んだ答え：{x.q.choices[x.pick]}</p>
              <p className="text-xs text-ok">正解：{x.q.choices[x.q.answer]}</p>
              <MissRegister question={x.q} area="t1" />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
            <button type="button" onClick={() => onRetry(wrong.map((x) => x.q))} className="font-dot rounded-md border-2 border-ink px-3 py-1 text-sm">
              まちがえた{wrong.length}問をもう一度
            </button>
            <button type="button" onClick={() => void copy()} className="rounded-md border border-line px-2 py-1 text-xs">
              vault の誤答台帳に貼る行をコピー
            </button>
            {copied && <span className="text-xs text-ok">コピーした</span>}
          </div>
        </section>
      )}
    </>
  );
}
