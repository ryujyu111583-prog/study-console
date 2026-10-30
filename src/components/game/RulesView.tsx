import Link from "next/link";
import { REWARD } from "@/lib/game/levels";
import { ASSIST_RATE, EFFECTS, EFFECT_ORDER, EVENT_MULTIPLIER, EVENT_NAME, MP_BASE, MP_PER_RECORD, WEEK_EVENT } from "@/lib/game/magic";
import { BOX_DAYS, NEW_CARDS_PER_DAY } from "@/lib/game/quiz";
import { DAILY_BONUS_GOLD, QUIZ_GOAL, CARD_GOAL } from "@/lib/game/daily";
import { DONE_HEAL, FAINT_GOLD, HP_MAX, MISS_DAMAGE } from "@/lib/game/vitality";
import { RESOLVE_STREAK } from "@/lib/mistakes";
import { TRACKS } from "@/lib/tracks";
import { MISTAKE_TYPES } from "@/lib/mistakeTypes";

/** 数字は各モジュールの定数から読むので、決まりを変えてもこのページは古くならない。 */

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="win group pt-3" open={open}>
      <summary className="font-dot cursor-pointer list-none text-base">
        <span className="mr-1 inline-block transition-transform group-open:rotate-90">▶</span>
        {title}
      </summary>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed">{children}</div>
    </details>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-faint">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="underline">
    {children}
  </Link>
);

export default function RulesView() {
  return (
    <div className="flex flex-col gap-3">
      <Section title="1日の流れ（これだけやれば回る）" open>
        <ol className="list-decimal pl-5">
          <li>
            <A href="/">仲間</A>：今日やった項目をタップ（未 → フル → 最低ライン）。タイマーを使うと分数も入る
          </li>
          <li>
            <A href="/battle">たたかう</A>：クイズを{QUIZ_GOAL}問。間違えたら「なぜ間違えた？」で型を選んで台帳へ
          </li>
          <li>
            <A href="/cards">カード</A>：暗記カードを{CARD_GOAL}枚
          </li>
          <li>ホームで宝箱を開け、3つ達成したらボーナス {DAILY_BONUS_GOLD}G を受け取る</li>
        </ol>
        <p className="text-faint">
          最低限は <b className="text-ink">G検定に1回触れること</b>。ML の記録か、G検定のクイズ・カード1つで HP が守られる。
        </p>
      </Section>

      <Section title="HP と気絶（G検定だけ）">
        <Rows
          rows={[
            ["最大", `${HP_MAX}`],
            ["G検定に触れなかった日", `翌朝 HP −${MISS_DAMAGE}`],
            ["G検定に触れた日", `翌朝 HP +${DONE_HEAL}`],
            ["HP が 0", `気絶。${FAINT_GOLD}G を落とし、HP は満タンに戻る`],
          ]}
        />
        <p>
          「触れた」＝ ML の記録（フルか最低ライン）、G検定の地方のクイズ1問、G検定のカード1枚、Claude 経由の G検定の報告のどれか。
          統計・投資・英語・設計を休んでも HP は減らない。
        </p>
        <p className="text-faint">今日の分は明日の朝に決まる。ホームの「G検定の守り」に、このままだとどうなるかが出る。</p>
      </Section>

      <Section title="宿屋（休む日）">
        <p>ホームの「宿屋に泊まる」を押すと、出るまでの日は HP が減らず、連続日数も切れない。出張や体調不良の日に使う。</p>
        <p>押した日から有効。過去の日にはさかのぼれない。「宿屋を出る」を押した日から、また HP の対象になる。</p>
        <p className="text-faint">今月の宿泊日数がホームに出る。逃げ道なので、使いすぎていないかはそこで見る。</p>
      </Section>

      <Section title="放置ボーナス（G検定だけ）">
        <Rows
          rows={[
            ["7日 触れていない", <span key="y" className="text-gold">黄色・経験値×1.5</span>],
            ["14日 触れていない", <span key="r" className="text-danger">赤・経験値×2</span>],
          ]}
        />
        <p>
          地方：その地方のクイズに最後に答えた日から数える。ボーナスは<b>その日いっぱい</b>続く。たたかうの地方ボタンと地図に色が付き、たたかうはいちばん放っておいた地方から始まる。
        </p>
        <p>台帳：その問題と最後に戦った日から数える。放っておいた問題ほど先に出て、1回戦うと元に戻る。</p>
      </Section>

      <Section title="誤答台帳とモンスター">
        <p>間違えた問題は、誤りの型を選んで台帳に入れる。型がモンスターの種族になる。</p>
        <ul className="list-disc pl-5">
          {MISTAKE_TYPES.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>
          たたかうの「台帳」で同じ問題に再戦する。{RESOLVE_STREAK}回連続で正解すると倒せて「解消済み」になる。間違えると連続は 0 に戻る。2回以上間違えたものは「再発」として先に出る。
        </p>
        <p className="text-faint">問題の無い項目（外部の誤答など）は口頭チェック。声に出して説明できたら「言えた」。</p>
      </Section>

      <Section title="地図とボス">
        <p>
          <A href="/map">地図</A>の地方を選ぶと、その分野のボスに挑める。内蔵クイズのある地方は10問中7問以上で撃破。魔王城（G検定本番）は模試の正答率を入れ、70%以上で撃破。
        </p>
        <p>報酬は初回の撃破だけ。2回目からは最高記録が残る。装備の強さは演出だけで、撃破は正答数で決まる。</p>
        <p className="text-faint">魔王城を倒すと、まわりの暗黒大陸の霧が薄れて名前が読めるようになる。</p>
      </Section>

      <Section title="暗記カード">
        <p>
          覚えていたら次の箱へ、忘れたら箱1に戻る（5箱）。箱ごとの間隔は {BOX_DAYS.slice(1).join("・")} 日。新しいカードは1日 {NEW_CARDS_PER_DAY}枚まで。
        </p>
      </Section>

      <Section title="スキルと特技">
        <p>
          仲間の Lv が1上がるごとに SP が1。<A href="/skills">スキル</A>で論点を開くと特技になる。特技は「その論点を口で説明できるか」の確認で、言えたら経験値（1日1回）。
        </p>
      </Section>

      <Section title="MP と特技の効果">
        <p>
          覚えた特技は、<A href="/battle">たたかう</A>の野生で MP を払って使える。1問に1つまで。使えるのは、その地方と同じ分野で覚えた特技だけ（G検定の地方なら ML の特技）。
        </p>
        <Rows
          rows={EFFECT_ORDER.map((e, i) => [
            `${EFFECTS[e].name}（MP${EFFECTS[e].mp}）`,
            `${EFFECTS[e].desc}。必要SP ${i + 1}${i === 2 ? "以上" : ""}の特技`,
          ])}
        />
        <p>
          MP は毎日満タンに戻る。最大は {MP_BASE} ＋ 今日記録した項目 × {MP_PER_RECORD}（全{TRACKS.length}項目で {MP_BASE + MP_PER_RECORD * TRACKS.length}）。先に記録すると、戦闘が楽になる。
        </p>
        <p className="text-faint">
          見破る・ヒントで正解した問題は、報酬が {ASSIST_RATE * 100}%。思い出す練習が本体なので、助けを借りた分は減らしている。ボス戦では使えない。
        </p>
      </Section>

      <Section title="週のイベント">
        <Rows
          rows={WEEK_EVENT.map((t, d) => ["日月火水木金土"[d], `${EVENT_NAME[t]} ×${EVENT_MULTIPLIER}`])}
        />
        <p>その分野のクイズ（野生・ボス）とカードの経験値に掛かる。台帳と記録には掛からない。G検定を優先して週3日。</p>
      </Section>

      <Section title="経験値とゴールド">
        <Rows
          rows={[
            ["記録 フル", `${REWARD.fullXp}EX ・ ${REWARD.fullGold}G`],
            ["記録 最低ライン", `${REWARD.minXp}EX ・ ${REWARD.minGold}G`],
            ["タイマー 1分", `${REWARD.minuteXp}EX ・ ${REWARD.minuteGold}G`],
            ["クイズ 1問正解", `${REWARD.quizXp}EX ・ ${REWARD.quizGold}G（メタルは×${REWARD.metalMultiplier}）`],
            ["カード 1枚", `${REWARD.cardXp}EX（1日${REWARD.cardDailyCap}枚まで）`],
            ["台帳に正解", `${REWARD.hitXp}EX`],
            ["台帳のモンスター撃破", `${REWARD.defeatXp}EX ・ ${REWARD.defeatGold}G`],
            ["特技を言えた", `${REWARD.skillXp}EX（1日1回）`],
          ]}
        />
        <p className="text-faint">放置ボーナスはクイズと台帳に、週のイベントはクイズとカードに掛かる。倍率は重なる。ゴールドは装備の店で使う。</p>
      </Section>

      <Section title="外でやった勉強（ギルドと Claude）">
        <p>
          <A href="/guild">ギルド</A>に外部の学習（NotebookLM・公式例題・BBC など）への入口がある。結果画面のスクショを Claude に貼って「Study Quest に報告」と言うと、経験値・誤答・ボスの結果がアプリに入る。
        </p>
        <p className="text-faint">届いた報告は、開いたときにメッセージ窓と冒険の書に出る。</p>
      </Section>

      <Section title="画面の一覧">
        <Rows
          rows={[
            ["仲間", "今日の記録・タイマー・G検定の守り・クエスト"],
            ["たたかう", "野生（クイズ）と台帳（再戦）"],
            ["カード", "暗記カード"],
            ["地図", "地方とボス"],
            ["ギルド", "外部の学習への入口"],
            ["スキル", "SP で特技を覚える"],
            ["装備", "ゴールドで買う（見た目と演出）"],
            ["図鑑", "モンスター図鑑（型×地方）と誤答台帳の一覧・編集"],
            ["冒険の書", "実績・称号・Claude からの報告"],
          ]}
        />
      </Section>
    </div>
  );
}
