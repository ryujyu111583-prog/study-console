"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import SkillCast from "@/components/game/SkillCast";
import Sprite from "@/components/game/Sprite";
import { REWARD } from "@/lib/game/levels";
import { play } from "@/lib/game/sfx";
import { skillById } from "@/lib/game/skills";
import { monsterFor } from "@/lib/game/sprites";
import { addBonus } from "@/lib/game/state";
import { areaById } from "@/lib/game/world";
import { RESOLVE_STREAK, bucketOf, markCorrect, markWrong } from "@/lib/mistakes";

type Panel = "fight" | "skills";

export default function BattleView() {
  const { mistakes, game, say } = useGame();
  // 再発 → 要注意の順。解消済みは出てこない。
  const queue = useMemo(
    () => [
      ...mistakes.filter((m) => bucketOf(m) === "recurring"),
      ...mistakes.filter((m) => bucketOf(m) === "watch"),
    ],
    [mistakes],
  );
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [effect, setEffect] = useState<"" | "hit" | "defeat">("");
  const [panel, setPanel] = useState<Panel>("fight");
  const [casting, setCasting] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ text: string; key: number } | null>(null);

  if (queue.length === 0) {
    return (
      <section className="win flex flex-col items-center gap-2 py-6 text-center">
        <p>あたりには モンスターの気配がない。</p>
        <p className="text-xs text-faint">
          演習で間違えたら
          <Link href="/mistakes" className="mx-1 underline">
            誤答台帳
          </Link>
          に入れよう。翌日からモンスターとして現れる。
        </p>
      </section>
    );
  }

  const m = queue[index % queue.length];
  const monster = monsterFor(m.type);
  const track = areaById(m.area)?.track ?? "ml";
  const hp = RESOLVE_STREAK - m.correctStreak;

  const next = () => {
    setReveal(false);
    setEffect("");
    setIndex((i) => i + 1);
  };

  const hit = async () => {
    setEffect("hit");
    play("hit");
    setPopup({ text: m.correctStreak + 1 >= RESOLVE_STREAK ? "CRITICAL!" : "HIT!", key: Date.now() });
    await markCorrect(m);
    if (m.correctStreak + 1 >= RESOLVE_STREAK) {
      setEffect("defeat");
      play("defeat");
      await addBonus(track, REWARD.defeatXp, REWARD.defeatGold);
      say([
        `${monster.name}（${m.concept}）を やっつけた！`,
        `${REWARD.defeatXp} の経験値と ${REWARD.defeatGold}G を獲得！`,
        "台帳では「解消済み」になった。",
      ]);
      window.setTimeout(next, 900);
    } else {
      await addBonus(track, REWARD.hitXp);
      say([`勇者の攻撃！ ${monster.name}に ダメージ！`, `${REWARD.hitXp} の経験値を獲得。あと ${hp - 1} 回で倒せる。`]);
      window.setTimeout(next, 700);
    }
  };

  const miss = async () => {
    await markWrong(m);
    play("miss");
    setPopup({ text: "MISS…", key: Date.now() });
    setReveal(true);
    say([`${monster.name}の反撃！`, "連続正答が 0 に戻った。", m.correct ? "正しい答えを読み直そう。" : "台帳に正解を書いておこう。"]);
  };

  const unlocked = game.skills.map((id) => skillById(id)).filter((s) => !!s);

  return (
    <div className="flex flex-col gap-4">
      <section className="win flex flex-col items-center gap-1.5 pt-5" aria-label="戦闘">
        <span className="win-label">{monster.name}が あらわれた！</span>
        <div className="relative grid h-[120px] w-full place-items-center">
          {popup && (
            <span
              key={popup.key}
              className="damage-pop pointer-events-none absolute top-2 text-2xl text-gold"
              style={{ textShadow: "2px 2px 0 #3a1a00" }}
            >
              {popup.text}
            </span>
          )}
          <Sprite
            key={m.id}
            look={monster.look}
            size={104}
            className={effect === "hit" ? "hit-flash" : effect === "defeat" ? "defeat" : "bounce"}
          />
        </div>
        <p className="text-center text-base">{m.concept}</p>
        <p className="text-center text-xs text-faint">
          {m.type} ・ 誤答 {m.wrongCount}回{bucketOf(m) === "recurring" && " ・ 再発"}
          {areaById(m.area) && ` ・ ${areaById(m.area)?.name}`}
        </p>
        <div className="flex gap-1.5" aria-label={`残りHP ${hp}`}>
          {Array.from({ length: RESOLVE_STREAK }, (_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 border-2 ${i < hp ? "border-ink bg-danger" : "border-line"}`}
            />
          ))}
        </div>
        {reveal && m.correct && (
          <p className="mt-1 w-full border-t border-line pt-2 text-sm leading-relaxed text-muted">
            {m.correct}
          </p>
        )}
        {reveal && <NoteLink id={m.area} label={`ノートで確かめる：${areaById(m.area)?.name ?? ""}`} />}
        <p className="text-xs text-faint">のこり {queue.length} 匹</p>
      </section>

      {panel === "fight" ? (
        <section className="win grid grid-cols-2 gap-x-3 gap-y-1" aria-label="コマンド">
          {[
            { label: "言えた", sub: "説明できた", act: () => void hit() },
            { label: "間違えた", sub: "反撃を受ける", act: () => void miss() },
            { label: reveal ? "答えを隠す" : "答えを見る", sub: "台帳の正解", act: () => setReveal((r) => !r) },
            { label: "特技", sub: `${unlocked.length}個`, act: () => setPanel("skills") },
            { label: "逃げる", sub: "次の敵へ", act: () => { next(); say("勇者は逃げ出した！"); } },
          ].map((c) => (
            <button key={c.label} type="button" onClick={c.act} className="group relative py-1 pl-5 text-left">
              <span className="absolute top-1 left-0 hidden group-hover:inline group-focus-visible:inline">▶</span>
              <span className="block text-base leading-tight">{c.label}</span>
              <span className="block text-[11px] leading-tight text-faint">{c.sub}</span>
            </button>
          ))}
        </section>
      ) : (
        <section className="win flex flex-col gap-2 pt-4" aria-label="特技">
          <span className="win-label">特技</span>
          {casting ? (
            <SkillCast node={skillById(casting)!} onDone={() => { setCasting(null); setPanel("fight"); }} />
          ) : unlocked.length === 0 ? (
            <p className="text-sm text-faint">
              まだ特技を覚えていない。
              <Link href="/skills" className="mx-1 underline">
                スキル
              </Link>
              でSPを使って覚えよう。
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {unlocked.map((s) => (
                <button key={s.id} type="button" onClick={() => setCasting(s.id)} className="py-1 text-left text-sm">
                  ・{s.skill}
                </button>
              ))}
            </div>
          )}
          {!casting && (
            <button type="button" onClick={() => setPanel("fight")} className="self-end text-xs text-faint">
              もどる
            </button>
          )}
        </section>
      )}
    </div>
  );
}
