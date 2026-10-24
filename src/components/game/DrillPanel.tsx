"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import SkillCast from "@/components/game/SkillCast";
import { DRILL_DAILY_CAP, DRILL_SIZE, REWARD } from "@/lib/game/levels";
import { play } from "@/lib/game/sfx";
import { isSpell, nodesOf, poolOf, type Branch, type DrillCard, type SkillNode } from "@/lib/game/skills";
import { recordDrill } from "@/lib/game/state";
import { dayKey } from "@/lib/date";
import { addMistake } from "@/lib/mistakes";

/** 打った答えの照合用。全角半角・大小・空白・句読点の違いは無視する。 */
const norm = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s。、．，.,!?！？「」『』（）()]/g, "");

const matches = (typed: string, card: DrillCard) =>
  norm(typed) !== "" && [card.a, ...(card.accept ?? [])].some((x) => norm(x) === norm(typed));

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 自己採点のボタンの言葉。 */
const GRADE: Record<string, [string, string]> = {
  card: ["覚えてた", "まだ"],
  qa: ["合ってた", "違った"],
  compose: ["書けた", "まだ"],
};

/**
 * 系統の修行。出し方は系統の mode で変わる。
 * 説明の系統は特技を順に唱え、それ以外は開いたノードの問題から最大10問を出す。
 */
export default function DrillPanel({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const { game, say } = useGame();
  const speedTiers = nodesOf(branch.id)
    .filter((n) => game.skills.includes(n.id) && n.seconds)
    .map((n) => n.seconds!)
    .sort((a, b) => a - b);

  const [phase, setPhase] = useState<"setup" | "run" | "done">("setup");
  const [picked, setPicked] = useState(0);
  // 窓を開いたあとに段位を開いても効くよう、選んだ秒数が無ければいちばん短い段位にする
  const seconds = speedTiers.includes(picked) ? picked : (speedTiers[0] ?? 0);
  const [deck, setDeck] = useState<DrillCard[]>([]);
  const [spells, setSpells] = useState<SkillNode[]>([]);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [typed, setTyped] = useState("");
  const [results, setResults] = useState<boolean[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [revealedAt, setRevealedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [logged, setLogged] = useState<number[]>([]);
  const [reward, setReward] = useState(0);

  const pool = poolOf(branch, game.skills);
  const card = deck[i];
  const mode = card?.mode;
  const speed = branch.mode === "speed";
  const left = speed && phase === "run" && !shown ? Math.max(0, seconds - (now - startedAt) / 1000) : seconds;
  const today = game.drill[branch.id]?.day === dayKey() ? (game.drill[branch.id]?.n ?? 0) : 0;

  const begin = () => {
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setShown(false);
    setRevealedAt(0);
    setVerdict(null);
    setTimedOut(false);
    setTyped("");
  };

  const start = () => {
    if (branch.mode === "recall") {
      setSpells(shuffle(game.skills.map((id) => nodesOf(branch.id).find((n) => n.id === id)).filter((n): n is SkillNode => !!n && isSpell(n))));
    } else {
      setDeck(shuffle(pool).slice(0, DRILL_SIZE));
    }
    setI(0);
    setResults([]);
    setTimes([]);
    setLogged([]);
    setPhase("run");
    begin();
    play("select");
  };

  const finish = async (res: boolean[], tm: number[]) => {
    setPhase("done");
    if (branch.mode === "recall") {
      say(`${branch.name}の修行を終えた。`);
      return;
    }
    const correct = res.filter(Boolean).length;
    const counted = await recordDrill(game, branch, correct);
    setReward(counted);
    play(correct === res.length && res.length > 0 ? "levelUp" : "quest");
    const avg = tm.length > 0 ? (tm.reduce((a, b) => a + b, 0) / tm.length / 1000).toFixed(1) : null;
    say([
      `${branch.name}の修行を終えた！ ${res.length}問中 ${correct}問 正解。${speed && avg ? `平均 ${avg}秒。` : ""}`,
      counted > 0
        ? `${counted * REWARD.drillXp} の経験値と、熟練度 ${counted * REWARD.drillBranchXp} を獲得！`
        : "今日の報酬は上限に達している。回すほど忘れない。",
    ]);
  };

  /** 答えを見た。瞬発力の時計はここで止まる。 */
  const reveal = () => {
    setRevealedAt(Date.now());
    setShown(true);
  };

  /** この問題の正誤が決まった。かかった時間は、答えを見た（または答えた）ところまで。 */
  const judge = (ok: boolean) => {
    const elapsed = (revealedAt || Date.now()) - startedAt;
    setShown(true);
    setVerdict(ok);
    setResults((r) => [...r, ok]);
    if (ok) setTimes((t) => [...t, elapsed]);
    play(ok ? "hit" : "miss");
  };

  const next = () => {
    if (i + 1 >= deck.length) {
      void finish(results, times);
      return;
    }
    setI(i + 1);
    begin();
  };

  // 瞬発力：表示中だけ時計を進め、時間切れで不正解にする。
  useEffect(() => {
    if (!speed || phase !== "run" || shown) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - startedAt >= seconds * 1000) {
        setTimedOut(true);
        setShown(true);
        setVerdict(false);
        setResults((r) => [...r, false]);
        play("miss");
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [speed, phase, shown, startedAt, seconds]);

  const toLedger = async () => {
    await addMistake({
      concept: card.q,
      type: branch.mistakeType ?? "用語止まり",
      correct: card.a,
      week: "",
      area: card.node.area ?? "",
    });
    setLogged((l) => [...l, i]);
    say(`「${card.q}」を誤答台帳に入れた。明日からモンスターとして現れる。`);
  };

  // ---- 始める前 ----
  if (phase === "setup") {
    const empty = branch.mode === "recall" ? !game.skills.some((id) => nodesOf(branch.id).some((n) => n.id === id)) : pool.length === 0;
    const locked = speed && speedTiers.length === 0;
    return (
      <div className="flex flex-col gap-2">
        {branch.mode !== "recall" && (
          <p className="text-xs text-faint">
            問題 {pool.length}問から最大{DRILL_SIZE}問 ・ 今日の報酬 {today}/{DRILL_DAILY_CAP}
            {game.drill[branch.id]?.best !== undefined && ` ・ 最高 ${game.drill[branch.id]?.best}問正解`}
          </p>
        )}
        {speed && speedTiers.length > 1 && (
          <div className="flex gap-2" role="radiogroup" aria-label="制限時間">
            {speedTiers.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={s === seconds}
                onClick={() => setPicked(s)}
                className={`rounded-md border-2 px-2 py-0.5 text-xs ${s === seconds ? "border-gold text-gold" : "border-line text-faint"}`}
              >
                {s}秒
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={empty || locked}
            onClick={start}
            className="rounded-md border-2 border-ink py-1.5 disabled:border-line disabled:text-faint"
          >
            {locked ? "段位を先に開く" : empty ? (speed ? "元の系統を先に開く" : "ノードを先に開く") : "修行を始める"}
          </button>
          <button type="button" onClick={onClose} className="rounded-md border-2 border-line py-1.5 text-muted">
            とじる
          </button>
        </div>
      </div>
    );
  }

  // ---- 終わったあと ----
  if (phase === "done") {
    const missed = deck.filter((_, k) => results[k] === false);
    return (
      <div className="flex flex-col gap-2">
        {branch.mode !== "recall" && (
          <p className="text-base">
            {results.length}問中 <span className="text-gold">{results.filter(Boolean).length}問</span> 正解
            {reward > 0 && <span className="ml-2 text-xs text-faint">熟練度 +{reward * REWARD.drillBranchXp}</span>}
          </p>
        )}
        {missed.length > 0 && (
          <ul className="flex flex-col gap-1 border-t border-line pt-2 text-sm">
            {missed.map((c, k) => (
              <li key={k}>
                <span className="text-danger">✗</span> {c.q}
                <span className="block pl-4 text-xs text-muted">{c.a}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={start} className="rounded-md border-2 border-ink py-1.5">
            もう一度
          </button>
          <button type="button" onClick={onClose} className="rounded-md border-2 border-line py-1.5 text-muted">
            とじる
          </button>
        </div>
      </div>
    );
  }

  // ---- 説明の系統：特技を順に唱える ----
  if (branch.mode === "recall") {
    const node = spells[i];
    if (!node) return null;
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-faint">
          {i + 1} / {spells.length}
        </p>
        <SkillCast
          key={node.id}
          node={node}
          onDone={() => (i + 1 >= spells.length ? void finish([], []) : setI(i + 1))}
        />
      </div>
    );
  }

  // ---- 1問ずつ ----
  const grade = GRADE[mode] ?? ["できた", "まだ"];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-faint">
        <span>
          {i + 1} / {deck.length}
          {speed && ` ・ ${card.branch.name}`}
        </span>
        <span>{card.node.topic}</span>
      </div>
      {speed && (
        <div className="h-2 w-full border border-line" aria-label={`残り ${Math.ceil(left)}秒`}>
          <div
            className={`h-full ${left <= seconds / 3 ? "bg-danger" : "bg-gold"}`}
            style={{ width: `${(left / seconds) * 100}%` }}
          />
        </div>
      )}

      <p className={`leading-relaxed ${mode === "card" ? "py-2 text-center text-xl" : "text-base"}`}>{card.q}</p>

      {!shown && mode === "card" && (
        <button type="button" onClick={reveal} className="rounded-md border-2 border-ink py-1.5">
          めくる
        </button>
      )}
      {!shown && mode === "yesno" && (
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => judge(v === card.ok)}
              className="rounded-md border-2 border-ink py-2 text-lg"
            >
              {v ? "○ Yes" : "× No"}
            </button>
          ))}
        </div>
      )}
      {!shown && mode === "qa" && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (matches(typed, card)) judge(true);
            else reveal();
          }}
        >
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="答えを打つ（空でもいい）"
            className="min-w-0 flex-1 rounded-md border-2 border-line bg-surface2 px-2 py-1 text-sm"
          />
          <button type="submit" className="rounded-md border-2 border-ink px-3 py-1 text-sm">
            答え合わせ
          </button>
        </form>
      )}
      {!shown && mode === "compose" && (
        <>
          <textarea
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            rows={2}
            placeholder="英語で書く（口で言うだけでもいい）"
            className="rounded-md border-2 border-line bg-surface2 px-2 py-1 text-sm"
          />
          <button type="button" onClick={reveal} className="rounded-md border-2 border-ink py-1.5">
            見本を見る
          </button>
        </>
      )}

      {shown && (
        <div className="flex flex-col gap-2 border-t border-line pt-2">
          {timedOut && <p className="text-sm text-danger">時間切れ！</p>}
          {verdict !== null && !timedOut && (
            <p className={`text-sm ${verdict ? "text-ok" : "text-danger"}`}>{verdict ? "正解！" : "不正解…"}</p>
          )}
          {mode === "compose" && typed && <p className="text-sm text-muted">あなた：{typed}</p>}
          {mode === "qa" && typed && verdict === null && <p className="text-sm text-muted">あなた：{typed}</p>}
          <p className="text-sm leading-relaxed">{card.a}</p>
          <NoteLink id={card.node.id} />

          {verdict === null ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => judge(true)}
                className="rounded-md border-2 border-ink py-1.5"
              >
                {grade[0]}
              </button>
              <button type="button" onClick={() => judge(false)} className="rounded-md border-2 border-line py-1.5 text-muted">
                {grade[1]}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {!verdict && (
                <button
                  type="button"
                  disabled={logged.includes(i)}
                  onClick={() => void toLedger()}
                  className="rounded-md border-2 border-line py-1.5 text-sm text-muted disabled:opacity-40"
                >
                  {logged.includes(i) ? "台帳に入れた" : "誤答台帳へ"}
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className={`rounded-md border-2 border-ink py-1.5 ${verdict ? "col-span-2" : ""}`}
              >
                {i + 1 >= deck.length ? "結果を見る" : "次へ"}
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => void finish(results, times)}
        className="self-end text-xs text-faint"
      >
        ここでやめる
      </button>
    </div>
  );
}
