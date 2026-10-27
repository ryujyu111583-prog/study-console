"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/game/GameProvider";
import NoteLink from "@/components/game/NoteLink";
import { dayKey } from "@/lib/date";
import { REWARD } from "@/lib/game/levels";
import { eventMultiplier } from "@/lib/game/magic";
import { BOX_DAYS, CARDS, NEW_CARDS_PER_DAY, trackOfNote, type CardState } from "@/lib/game/quiz";
import { play } from "@/lib/game/sfx";
import { reviewCard, subscribeSrs } from "@/lib/game/state";

/** 暗記カード：今日が期限のカードと、新しいカード（1日10枚まで）を出す。 */
export default function CardsView() {
  const { game, say } = useGame();
  const [srs, setSrs] = useState<Record<string, CardState> | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const today = dayKey();

  useEffect(() => subscribeSrs(setSrs), []);

  // セッション開始時点の出題リストを固定する（答えるたびに並びが変わらないように）
  const deck = useMemo(() => {
    if (!srs) return [];
    const due = CARDS.filter((c) => srs[c.id] && srs[c.id].due <= today);
    const fresh = CARDS.filter((c) => !srs[c.id]).slice(0, NEW_CARDS_PER_DAY);
    return [...due, ...fresh];
    // srs が最初に届いた時だけ作る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srs === null]);

  const rest = deck.filter((c) => !done.includes(c.id));
  const card = rest[0];
  const learned = srs ? Object.values(srs).filter((s) => s.box >= 4).length : 0;
  const reviewedToday = game.cardLog[today] ?? 0;

  const answer = async (remembered: boolean) => {
    if (!card) return;
    play(remembered ? "coin" : "miss");
    const track = trackOfNote(card.note);
    const box = await reviewCard(game, card.id, track, srs?.[card.id], remembered, eventMultiplier(track));
    setDone((d) => [...d, card.id]);
    setFlipped(false);
    say(
      remembered
        ? [`覚えていた！ 箱${box}へ（次は ${box >= 5 ? "2週間" : `${BOX_DAYS[box]}日`}後）`, reviewedToday < REWARD.cardDailyCap ? `${Math.round(REWARD.cardXp * eventMultiplier(track))} の経験値を獲得。${eventMultiplier(track) > 1 ? "（週のイベント）" : ""}` : "今日の経験値は上限。"]
        : ["忘れていた… 箱1に戻した。", "明日もう一度出る。"],
    );
  };

  if (!srs) return <p className="win text-sm text-faint">カードを読み込み中…</p>;

  return (
    <div className="flex flex-col gap-3">
      <p className="flex justify-between text-xs text-faint">
        <span>
          残り {rest.length}枚 ・ 今日 {reviewedToday}枚
        </span>
        <span>
          定着（箱4以上） {learned}/{CARDS.length}
        </span>
      </p>

      {card ? (
        <section className="win flex min-h-[220px] flex-col gap-3 pt-5" aria-label="カード">
          <span className="win-label">{srs[card.id] ? `復習 ・ 箱${srs[card.id].box}` : "新しいカード"}</span>
          <p className="text-base leading-relaxed">{card.front}</p>
          {flipped ? (
            <>
              <p className="border-t border-line pt-2 text-sm leading-relaxed text-gold">{card.back}</p>
              <NoteLink path={card.note} />
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button type="button" onClick={() => void answer(false)} className="font-dot rounded-md border-2 border-line py-2">
                  忘れてた
                </button>
                <button type="button" onClick={() => void answer(true)} className="font-dot rounded-md border-2 border-ink py-2">
                  覚えてた
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFlipped(true);
                play("select");
              }}
              className="font-dot mt-auto rounded-md border-2 border-ink py-2"
            >
              めくる（口で答えてから）
            </button>
          )}
        </section>
      ) : (
        <section className="win flex flex-col items-center gap-1 py-6 text-center">
          <p className="font-dot text-gold">今日のカードは おしまい！</p>
          <p className="text-xs text-faint">忘れたカードは明日、覚えたカードは間隔をあけてまた出る。</p>
        </section>
      )}
      <p className="text-xs text-faint">
        箱1→1日、箱2→2日、箱3→4日、箱4→7日、箱5→14日後に再出題。忘れたら箱1へ。中身は vault の C1・C2 チートシートなど。
      </p>
    </div>
  );
}
