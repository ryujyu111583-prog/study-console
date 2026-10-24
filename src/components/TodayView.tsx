"use client";

import Timer from "@/components/Timer";
import DailyPanel from "@/components/game/DailyPanel";
import { useGame } from "@/components/game/GameProvider";
import { dayKey, recentDayKeys, shortDate } from "@/lib/date";
import { MEMBER_JOB, MEMBER_STEP, REWARD, levelProgress } from "@/lib/game/levels";
import { play } from "@/lib/game/sfx";
import { nextState, setTrackState, stateLabel } from "@/lib/log";
import { TRACK_COLOR, TRACK_LABEL, TRACKS, trackState, type Track } from "@/lib/tracks";

const STATE_TEXT = { "": "● 未", full: "● フル", min: "● 最低ライン" } as const;
const MEMBER_COLOR: Record<Track, string> = {
  stat: "var(--stat)",
  inv: "var(--inv)",
  ml: "var(--ml)",
  en: "var(--en)",
};

export default function TodayView() {
  const { logs, stats, say } = useGame();
  const today = dayKey();
  const days = recentDayKeys(14);

  const cycle = (track: Track) => {
    const current = trackState(logs[today], track);
    const next = nextState(current);
    void setTrackState(today, track, next);
    play(next === "" ? "select" : "coin");
    const who = `${TRACK_LABEL[track]}の${MEMBER_JOB[track]}`;
    if (next === "full") say([`${who}は しっかり修行した！`, `${REWARD.fullXp} の経験値と ${REWARD.fullGold}G を獲得！`]);
    else if (next === "min") say([`${who}は 最低ラインを守った。`, `経験値は ${REWARD.minXp} に（連続日数は守られる）`]);
    else say(`${who}の記録を取り消した。`);
  };

  return (
    <div className="flex flex-col gap-4">
      <DailyPanel />

      <section className="grid grid-cols-2 gap-3" aria-label="仲間（今日の記録）">
        {TRACKS.map((track) => {
          const state = trackState(logs[today], track);
          const lv = levelProgress(stats.xp[track], MEMBER_STEP);
          return (
            <button
              key={track}
              type="button"
              onClick={() => cycle(track)}
              className="win flex flex-col gap-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <span className="flex items-baseline justify-between">
                <span className="text-lg" style={{ color: MEMBER_COLOR[track] }}>
                  {TRACK_LABEL[track]}
                </span>
                <span className="text-sm text-gold">Lv {lv.level}</span>
              </span>
              <span className="text-xs text-faint">
                {MEMBER_JOB[track]}
                {stats.sp[track] > 0 && <span className="ml-1 text-gold">SP {stats.sp[track]}</span>}
              </span>
              <span
                className={`mt-1 text-sm ${state === "full" ? "text-ok" : state === "min" ? "text-gold" : "text-faint"}`}
              >
                {STATE_TEXT[state]}
              </span>
              <span className="mt-1 block h-1.5 border border-faint bg-surface2">
                <span
                  className="block h-full"
                  style={{ width: `${lv.ratio * 100}%`, background: MEMBER_COLOR[track] }}
                />
              </span>
            </button>
          );
        })}
      </section>
      <p className="-mt-2 text-center text-xs text-faint">仲間をタップ：未 → フル → 最低ライン</p>

      <div id="timer" className="scroll-mt-4">
        <Timer />
      </div>

      <section className="win flex flex-col gap-1.5 pt-4" aria-label="冒険の記録（直近14日）">
        <span className="win-label">冒険の記録（14日）</span>
        {TRACKS.map((track) => (
          <div key={track} className="grid grid-cols-[36px_1fr] items-center gap-2">
            <span className="text-xs" style={{ color: MEMBER_COLOR[track] }}>
              {TRACK_LABEL[track]}
            </span>
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[3px]">
              {days.map((key) => {
                const value = trackState(logs[key], track);
                const filled =
                  value === "full"
                    ? TRACK_COLOR[track].full
                    : value === "min"
                      ? TRACK_COLOR[track].min
                      : "bg-surface2 border-line";
                return (
                  <span
                    key={key}
                    title={`${key} ${TRACK_LABEL[track]} ${stateLabel(value)}`}
                    className={`aspect-square border ${filled} ${key === today ? "outline outline-1 outline-ink" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <p className="flex justify-between text-[10px] text-faint">
          <span>{shortDate(days[0])}</span>
          <span>今日</span>
        </p>
      </section>

      <section className="win pt-4 text-sm" aria-label="経験値の決まり">
        <span className="win-label">経験値とゴールドの決まり</span>
        <dl className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-0.5">
          {[
            ["記録 フル", `+${REWARD.fullXp}`, `+${REWARD.fullGold}G`],
            ["記録 最低ライン", `+${REWARD.minXp}`, `+${REWARD.minGold}G`],
            ["修行（タイマー）1分", `+${REWARD.minuteXp}`, `+${REWARD.minuteGold}G`],
            ["モンスターに「言えた」", `+${REWARD.hitXp}`, ""],
            ["モンスター撃破（3連続正答）", `+${REWARD.defeatXp}`, `+${REWARD.defeatGold}G`],
            ["特技を唱えて言えた（1日1回）", `+${REWARD.skillXp}`, ""],
          ].map(([what, xp, gold]) => (
            <div key={what} className="contents">
              <dt>{what}</dt>
              <dd className="text-right text-gold tabular-nums">{xp}</dd>
              <dd className="text-right text-gold tabular-nums">{gold}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-faint">記録は過去の分もさかのぼって経験値になる。ボスは地図から。</p>
      </section>
    </div>
  );
}
