"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import MissRegister from "@/components/game/MissRegister";
import NoteLink from "@/components/game/NoteLink";
import QuizCard from "@/components/game/QuizCard";
import SkillCast from "@/components/game/SkillCast";
import Sprite from "@/components/game/Sprite";
import { dayKey } from "@/lib/date";
import { REWARD } from "@/lib/game/levels";
import { BANK, hasQuiz, pickQuestions, questionById, type Question } from "@/lib/game/quiz";
import { play } from "@/lib/game/sfx";
import { skillById } from "@/lib/game/skills";
import { monsterFor, rollWild, type Species } from "@/lib/game/sprites";
import { addBonus, answerQuiz } from "@/lib/game/state";
import { AREAS, areaById } from "@/lib/game/world";
import { RESOLVE_STREAK, bucketOf, markCorrect, markWrong, type Mistake } from "@/lib/mistakes";

type Mode = "wild" | "ledger";
type Effect = "" | "hit" | "defeat";

const QUIZ_AREAS = AREAS.filter((a) => hasQuiz(a.id));

/** ダメージ表示と揺れつきのモンスター枠 */
function Stage({
  look,
  name,
  effect,
  popup,
  children,
}: {
  look: Parameters<typeof Sprite>[0]["look"];
  name: string;
  effect: Effect;
  popup: { text: string; key: number } | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="win flex flex-col items-center gap-1 pt-5" aria-label="戦闘">
      <span className="win-label">{name}が あらわれた！</span>
      <div className="relative grid h-[96px] w-full place-items-center">
        {popup && (
          <span
            key={popup.key}
            className="damage-pop font-dot pointer-events-none absolute top-1 text-2xl text-gold"
            style={{ textShadow: "2px 2px 0 #3a1a00" }}
          >
            {popup.text}
          </span>
        )}
        <Sprite
          look={look}
          size={84}
          className={effect === "hit" ? "hit-flash" : effect === "defeat" ? "defeat" : "bounce"}
        />
      </div>
      {children}
    </section>
  );
}

/** 野生：地方を選んで4択クイズと戦う */
function WildBattle() {
  const { game, say } = useGame();
  const [areaId, setAreaId] = useState("g1");
  const [queue, setQueue] = useState<Question[]>(() => pickQuestions("g1", 10));
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [effect, setEffect] = useState<Effect>("");
  const [popup, setPopup] = useState<{ text: string; key: number } | null>(null);
  // 問題ごとに種族を引き直す。メタルプルンはまれで、正解すると経験値が多い
  const [foe, setFoe] = useState<Species>(() => rollWild());
  const area = areaById(areaId)!;
  const question = queue[index % queue.length];
  const isMetal = foe.look.kind === "metal";
  const todayCount = game.quizLog[dayKey()] ?? 0;

  const changeArea = (id: string) => {
    setAreaId(id);
    setQueue(pickQuestions(id, 10));
    setIndex(0);
    setAnswered(null);
    setEffect("");
    setFoe(rollWild());
    play("select");
  };

  const onAnswer = (correct: boolean) => {
    setAnswered(correct);
    const mult = isMetal ? REWARD.metalMultiplier : 1;
    void answerQuiz(area.track, correct, mult);
    if (correct) {
      setEffect("defeat");
      play(isMetal ? "levelUp" : "defeat");
      setPopup({ text: isMetal ? "会心の一撃！" : "HIT!", key: Date.now() });
      say([
        `${foe.name}を たおした！`,
        `${REWARD.quizXp * mult} の経験値と ${REWARD.quizGold * mult}G を獲得。${isMetal ? "（メタル5倍！）" : ""}`,
      ]);
    } else if (isMetal) {
      setEffect("defeat");
      play("miss");
      setPopup({ text: "逃げられた…", key: Date.now() });
      say([`${foe.name}は 逃げ出した！`, "解説とノートで確かめて、台帳に登録しよう。"]);
    } else {
      setEffect("hit");
      play("miss");
      setPopup({ text: "MISS…", key: Date.now() });
      say([`${foe.name}の反撃！`, "解説とノートで確かめて、台帳に登録しよう。"]);
    }
  };

  const next = () => {
    setAnswered(null);
    setEffect("");
    setPopup(null);
    const nextFoe = rollWild();
    setFoe(nextFoe);
    if (nextFoe.look.kind === "metal") {
      play("chest");
      say(["メタルプルンが あらわれた！", "正解すれば経験値5倍。間違えると逃げられる。"]);
    }
    if (index + 1 >= queue.length) {
      setQueue(pickQuestions(areaId, 10));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1" role="group" aria-label="地方">
        {QUIZ_AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => changeArea(a.id)}
            aria-pressed={a.id === areaId}
            className={`rounded-md border px-1.5 py-0.5 text-[11px] ${a.id === areaId ? "border-ink text-ink" : "border-line text-faint"}`}
          >
            {a.name}
          </button>
        ))}
      </div>
      <Stage look={foe.look} name={foe.name} effect={effect} popup={popup}>
        <p className="text-xs text-faint">
          {area.topic} ・ {index + 1}/{queue.length} ・ 今日 {todayCount}問
        </p>
      </Stage>
      <section className="win" aria-label="問題">
        <QuizCard key={`${areaId}-${question.id}-${index}`} question={question} onAnswer={onAnswer}>
          {answered === false && <MissRegister question={question} area={areaId} />}
          <button type="button" onClick={next} className="font-dot self-end rounded-md border-2 border-ink px-4 py-1">
            つぎの敵 ▶
          </button>
        </QuizCard>
      </section>
    </div>
  );
}

/** 台帳：登録したモンスターに再戦する。問題つきなら同じ4択、無ければ口頭チェック */
function LedgerBattle({ queue }: { queue: Mistake[] }) {
  const { game, say } = useGame();
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [effect, setEffect] = useState<Effect>("");
  const [popup, setPopup] = useState<{ text: string; key: number } | null>(null);
  const [casting, setCasting] = useState<string | null>(null);
  const [showSkills, setShowSkills] = useState(false);

  if (queue.length === 0) {
    return (
      <section className="win flex flex-col items-center gap-2 py-6 text-center">
        <p>台帳のモンスターは すべて倒した！</p>
        <p className="text-xs text-faint">「野生」でクイズに挑み、間違えた問題を台帳に入れよう。</p>
      </section>
    );
  }

  const m = queue[index % queue.length];
  const monster = monsterFor(m.type);
  const question = questionById(m.qid);
  const track = areaById(m.area)?.track ?? "ml";
  const hp = RESOLVE_STREAK - m.correctStreak;
  const unlocked = game.skills.map((id) => skillById(id)).filter((s) => !!s);

  const next = () => {
    setReveal(false);
    setEffect("");
    setPopup(null);
    setIndex((i) => i + 1);
    setRound((r) => r + 1);
  };

  const hit = async () => {
    setEffect("hit");
    play("hit");
    const finishing = m.correctStreak + 1 >= RESOLVE_STREAK;
    setPopup({ text: finishing ? "CRITICAL!" : "HIT!", key: Date.now() });
    await markCorrect(m);
    if (finishing) {
      setEffect("defeat");
      play("defeat");
      await addBonus(track, REWARD.defeatXp, REWARD.defeatGold);
      say([`${monster.name}を やっつけた！`, `${REWARD.defeatXp} の経験値と ${REWARD.defeatGold}G を獲得！`, "台帳では「解消済み」になった。"]);
    } else {
      await addBonus(track, REWARD.hitXp);
      say([`${monster.name}に ダメージ！`, `${REWARD.hitXp} の経験値。あと ${hp - 1} 回で倒せる。`]);
    }
  };

  const miss = async () => {
    await markWrong(m);
    play("miss");
    setPopup({ text: "MISS…", key: Date.now() });
    setReveal(true);
    say([`${monster.name}の反撃！`, "連続正答が 0 に戻った。"]);
  };

  return (
    <div className="flex flex-col gap-3">
      <Stage look={monster.look} name={monster.name} effect={effect} popup={popup}>
        <p className="text-center text-xs text-faint">
          {m.type} ・ 誤答 {m.wrongCount}回{bucketOf(m) === "recurring" && " ・ 再発"}
          {areaById(m.area) && ` ・ ${areaById(m.area)?.name}`}
        </p>
        <div className="flex gap-1.5" aria-label={`残りHP ${hp}`}>
          {Array.from({ length: RESOLVE_STREAK }, (_, i) => (
            <span key={i} className={`h-3 w-3 border-2 ${i < hp ? "border-ink bg-danger" : "border-line"}`} />
          ))}
        </div>
        <p className="text-xs text-faint">のこり {queue.length} 匹</p>
      </Stage>

      {question ? (
        <section className="win" aria-label="問題">
          <QuizCard key={`${m.id}-${round}`} question={question} onAnswer={(ok) => void (ok ? hit() : miss())}>
            <button type="button" onClick={next} className="font-dot self-end rounded-md border-2 border-ink px-4 py-1">
              つぎの敵 ▶
            </button>
          </QuizCard>
        </section>
      ) : (
        <section className="win flex flex-col gap-2" aria-label="口頭チェック">
          <p className="text-[15px]">{m.concept}</p>
          <p className="text-xs text-faint">声に出して説明できたら「言えた」。</p>
          {reveal && m.correct && <p className="border-t border-line pt-2 text-sm leading-relaxed text-muted">{m.correct}</p>}
          {reveal && <NoteLink id={m.area} />}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => void hit().then(next)} className="rounded-md border-2 border-ink py-1.5">
              言えた
            </button>
            <button type="button" onClick={() => void miss()} className="rounded-md border-2 border-line py-1.5">
              間違えた
            </button>
            <button type="button" onClick={() => setReveal((r) => !r)} className="text-xs text-faint">
              {reveal ? "答えを隠す" : "答えを見る"}
            </button>
            <button type="button" onClick={() => setShowSkills((s) => !s)} className="text-xs text-faint">
              特技（{unlocked.length}）
            </button>
          </div>
          {showSkills &&
            (casting ? (
              <SkillCast node={skillById(casting)!} onDone={() => setCasting(null)} />
            ) : unlocked.length === 0 ? (
              <p className="text-xs text-faint">
                まだ特技を覚えていない。<Link href="/skills" className="underline">スキル</Link>で覚えよう。
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {unlocked.map((s) => (
                  <button key={s.id} type="button" onClick={() => setCasting(s.id)} className="text-left text-sm">
                    ・{s.skill}
                  </button>
                ))}
              </div>
            ))}
          <button type="button" onClick={next} className="self-end text-xs text-faint">
            逃げる ▶
          </button>
        </section>
      )}
    </div>
  );
}

export default function BattleView() {
  const { mistakes } = useGame();
  const queue = useMemo(
    () => [
      ...mistakes.filter((m) => bucketOf(m) === "recurring"),
      ...mistakes.filter((m) => bucketOf(m) === "watch"),
    ],
    [mistakes],
  );
  const [mode, setMode] = useState<Mode>("wild");
  const total = Object.values(BANK).reduce((s, b) => s + b.length, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="戦う相手">
        {(
          [
            ["wild", `野生（${total}問）`],
            ["ledger", `台帳（${queue.length}匹）`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => {
              setMode(id);
              play("select");
            }}
            className={`font-dot rounded-md border-2 py-1.5 text-sm ${mode === id ? "border-ink" : "border-line text-faint"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "wild" ? <WildBattle /> : <LedgerBattle queue={queue} />}
    </div>
  );
}
