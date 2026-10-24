/**
 * スキルツリー。トラックごとのコース（courses/）を、出題の形が違う「系統」に分けて持つ。
 * - 系統：単語・一問一答・○×・作文・瞬発力・説明… 何を育てるかはコースが決める
 * - ノード：開くと特技（説明の系統）か、修行に出る問題の束が手に入る
 * - SP は仲間のレベルが1上がるごとに1。系統の熟練度 Lv は、その系統の修行で上がる
 */
import type { Track } from "../tracks";
import { EN_COURSE } from "./courses/en";
import { INV_COURSE } from "./courses/inv";
import { ML_COURSE } from "./courses/ml";
import { STAT_COURSE } from "./courses/stat";
import type { BranchDef, Course, DrillItem, DrillMode, NodeDef } from "./courses/types";

export type { DrillItem, DrillMode } from "./courses/types";

export const COURSES: Record<Track, Course> = {
  stat: STAT_COURSE,
  inv: INV_COURSE,
  ml: ML_COURSE,
  en: EN_COURSE,
};

export type SkillNode = NodeDef & { track: Track; branch: string };
export type Branch = Omit<BranchDef, "nodes"> & { track: Track };

export const BRANCHES: Branch[] = Object.values(COURSES).flatMap((c) =>
  c.branches.map(({ nodes: _nodes, ...b }) => ({ ...b, track: c.track })),
);

export const SKILLS: SkillNode[] = Object.values(COURSES).flatMap((c) =>
  c.branches.flatMap((b) => b.nodes.map((n) => ({ ...n, track: c.track, branch: b.id }))),
);

// データの書き間違いは、画面で変な挙動になる前にここで止める。
{
  const ids = new Set<string>();
  for (const n of SKILLS) {
    if (ids.has(n.id)) throw new Error(`スキルの id が重複している: ${n.id}`);
    ids.add(n.id);
  }
  for (const n of SKILLS) {
    for (const r of n.requires) {
      if (SKILLS.find((s) => s.id === r)?.branch !== n.branch) {
        throw new Error(`${n.id} の前提 ${r} が同じ系統に無い`);
      }
    }
  }
  for (const b of BRANCHES) {
    for (const f of b.from ?? []) {
      if (!BRANCHES.some((x) => x.id === f)) throw new Error(`${b.id} の from にある ${f} が無い`);
    }
  }
}

export const skillById = (id: string) => SKILLS.find((s) => s.id === id);

export const skillsOf = (track: Track) => SKILLS.filter((s) => s.track === track);

export const branchById = (id: string) => BRANCHES.find((b) => b.id === id);

export const branchesOf = (track: Track) => BRANCHES.filter((b) => b.track === track);

export const nodesOf = (branchId: string) => SKILLS.filter((s) => s.branch === branchId);

export const MODE_LABEL: Record<DrillMode, string> = {
  recall: "口頭で説明",
  card: "単語カード",
  qa: "一問一答",
  yesno: "○×（Yes / No）",
  compose: "作文",
  speed: "制限時間つき",
};

/** 説明の系統の特技か。戦闘中に唱えられるのはこれだけ。 */
export const isSpell = (node: SkillNode) => branchById(node.branch)?.mode === "recall";

export function canUnlock(node: SkillNode, unlocked: string[], sp: number, branchLv: number) {
  return (
    !unlocked.includes(node.id) &&
    node.requires.every((r) => unlocked.includes(r)) &&
    branchLv >= (node.lv ?? 1) &&
    sp >= node.cost
  );
}

/** 修行の1問。どの系統・ノードから来たかと、その系統での出し方を持つ。 */
export type DrillCard = DrillItem & { mode: DrillMode; node: SkillNode; branch: Branch };

/** 開いたノードの問題を集める。瞬発力の系統は from の系統から借りてくる。 */
export function poolOf(branch: Branch, unlocked: string[]): DrillCard[] {
  const sources = branch.mode === "speed" ? (branch.from ?? []) : [branch.id];
  return sources.flatMap((id) => {
    const src = branchById(id);
    if (!src) return [];
    return nodesOf(id)
      .filter((n) => unlocked.includes(n.id))
      .flatMap((n) => (n.items ?? []).map((item) => ({ ...item, mode: src.mode, node: n, branch: src })));
  });
}

/** 瞬発力の系統で、開いた段位のうちいちばん短い制限時間。まだ開いていなければ undefined。 */
export function speedLimit(branch: Branch, unlocked: string[]) {
  const secs = nodesOf(branch.id)
    .filter((n) => unlocked.includes(n.id) && n.seconds)
    .map((n) => n.seconds!);
  return secs.length > 0 ? Math.min(...secs) : undefined;
}
