"""
quiz_source.py から、アプリが読む JSON を作る。

  python scripts/build_quiz.py          # JSON を作り直す（作った時点のノートの指紋も記録）
  python scripts/build_quiz.py --check  # vault のノートが、問題を作った後に変わっていないか調べるだけ

出力：src/data/quiz/<area>.json、src/data/cards.json、src/data/sources.json（ノート → sha256）
正解の位置は問題IDから決まる並べ替えで散らす（作り直しても同じ並びになる）。
"""
import hashlib
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from quiz_source import CARDS, QUIZ  # noqa: E402

VAULT = Path(r"C:\Users\ユーザー\Dropbox\vault-share\ryuju")
OUT = Path(__file__).resolve().parent.parent / "src" / "data"


def note_hash(path: str) -> str:
    return hashlib.sha256((VAULT / f"{path}.md").read_bytes()).hexdigest()[:16]


def used_notes() -> dict[str, list[str]]:
    """ノート → それを根拠にしている地方（カードは 'cards'）"""
    users: dict[str, list[str]] = {}
    for area, (note, _) in QUIZ.items():
        users.setdefault(note, []).append(area)
    for _, _, note in CARDS:
        users.setdefault(note, [])
        if "cards" not in users[note]:
            users[note].append("cards")
    return users


def check() -> int:
    recorded = json.loads((OUT / "sources.json").read_text(encoding="utf-8"))
    stale = []
    for note, areas in used_notes().items():
        if not (VAULT / f"{note}.md").exists():
            stale.append((note, areas, "ノートが見つからない"))
        elif recorded.get(note) != note_hash(note):
            stale.append((note, areas, "更新あり"))
    if not stale:
        print("OK: 問題の元になったノートは、作った時から変わっていません")
        return 0
    print("問題を見直すべきノート：")
    for note, areas, why in stale:
        print(f"  [{why}] {note}  → {', '.join(areas)}")
    return 1


def build() -> None:
    (OUT / "quiz").mkdir(parents=True, exist_ok=True)
    total = 0
    for area, (note, items) in QUIZ.items():
        out = []
        for i, (q, correct, wrong, explain) in enumerate(items, 1):
            qid = f"{area}-{i:02d}"
            assert len(wrong) == 3, qid
            # 正解の位置は地方ごとにずらしながら順に回し、どの位置にも同じくらい来るようにする
            others = list(wrong)
            random.Random(qid).shuffle(others)
            pos = (i + len(area) + sum(map(ord, area))) % 4
            choices = others[:pos] + [correct] + others[pos:]
            out.append({
                "id": qid,
                "q": q,
                "choices": choices,
                "answer": choices.index(correct),
                "explain": explain,
                "note": note,
            })
        (OUT / "quiz" / f"{area}.json").write_text(
            json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
        )
        total += len(out)

    cards = [
        {"id": f"c{i:02d}", "front": f, "back": b, "note": n}
        for i, (f, b, n) in enumerate(CARDS, 1)
    ]
    (OUT / "cards.json").write_text(
        json.dumps(cards, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
    )

    missing = [n for n in used_notes() if not (VAULT / f"{n}.md").exists()]
    if missing:
        raise SystemExit(f"vault に無いノート: {missing}")
    sources = {n: note_hash(n) for n in sorted(used_notes())}
    (OUT / "sources.json").write_text(
        json.dumps(sources, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n"
    )

    answers = [q["answer"] for a in QUIZ for q in json.loads((OUT / "quiz" / f"{a}.json").read_text(encoding="utf-8"))]
    print(f"問題 {total} 問（{len(QUIZ)} 地方）、カード {len(cards)} 枚、ノート {len(sources)} 件")
    print("正解の位置の分布:", {k: answers.count(k) for k in range(4)})


if __name__ == "__main__":
    sys.exit(check() if "--check" in sys.argv else build())
