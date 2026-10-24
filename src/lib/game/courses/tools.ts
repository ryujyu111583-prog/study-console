import { LINK_GROUPS, type LinkItem } from "../../links";

/** リンク集（links.ts）に載っているツールを名前で引く。綴りを間違えたら読み込み時に気づけるよう投げる。 */
export function tool(name: string): LinkItem {
  for (const g of LINK_GROUPS) {
    const hit = g.items.find((i) => i.name === name);
    if (hit) return hit;
  }
  throw new Error(`リンク集に「${name}」が無い`);
}
