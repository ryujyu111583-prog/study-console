import type { Formula } from "@/lib/game/quiz";

/** 式・意味・計算・見立ての4段の解説。間違えたときは開き、正解のときは1タップで開く。 */
export default function FormulaDetail({ formula, open }: { formula: Formula; open: boolean }) {
  const rows = [
    ["式", formula.expr],
    ["意味", formula.terms],
    ["計算", formula.steps],
    ["見立て", formula.insight],
  ].filter(([, text]) => text);

  return (
    <details open={open} className="rounded-md border border-line px-2.5 py-1.5">
      <summary className="font-dot cursor-pointer text-sm text-gold">式の解説</summary>
      <dl className="mt-1.5 flex flex-col gap-1.5">
        {rows.map(([label, text]) => (
          <div key={label}>
            <dt className="text-xs text-faint">{label}</dt>
            <dd className="whitespace-pre-line break-words text-sm leading-relaxed">{text}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
