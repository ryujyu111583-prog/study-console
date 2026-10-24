/**
 * 武器屋・防具屋の品物。ゴールドで買って装備する。
 * 強さはボス戦の「与えるダメージ」の演出にだけ使い、撃破の判定（演習の正答数）には影響させない。
 * 装備で勉強を代わりにはできない、という線引き。
 */
export type Slot = "weapon" | "armor" | "charm";

export type Item = {
  id: string;
  slot: Slot;
  name: string;
  price: number;
  atk?: number;
  def?: number;
  note: string;
};

export const SLOT_LABEL: Record<Slot, string> = {
  weapon: "武器",
  armor: "防具",
  charm: "装飾品",
};

export const ITEMS: Item[] = [
  { id: "w-pencil", slot: "weapon", name: "ひのきの鉛筆", price: 50, atk: 2, note: "冒険の始まりはいつもこれ" },
  { id: "w-sharp", slot: "weapon", name: "鋼のシャーペン", price: 300, atk: 8, note: "芯が折れない" },
  { id: "w-calc", slot: "weapon", name: "関数電卓ブレード", price: 800, atk: 15, note: "統計の魔法使いが好む" },
  { id: "w-grad", slot: "weapon", name: "勾配の剣", price: 1500, atk: 25, note: "最急降下で斬りつける" },
  { id: "w-attn", slot: "weapon", name: "アテンションの槍", price: 3000, atk: 40, note: "大事なところだけを貫く" },
  { id: "w-gpu", slot: "weapon", name: "GPUの大剣", price: 6000, atk: 60, note: "並列に100回斬る" },

  { id: "a-note", slot: "armor", name: "布のノート", price: 50, def: 2, note: "書けば守ってくれる" },
  { id: "a-binder", slot: "armor", name: "革のバインダー", price: 250, def: 6, note: "プリントが散らからない" },
  { id: "a-cheat", slot: "armor", name: "チートシートの鎧", price: 700, def: 12, note: "回すほど硬くなる" },
  { id: "a-moc", slot: "armor", name: "MOCの盾", price: 1400, def: 20, note: "すべての道はここに通じる" },
  { id: "a-vault", slot: "armor", name: "vaultの全身鎧", price: 4000, def: 35, note: "記録した者が最後に勝つ" },

  { id: "c-coffee", slot: "charm", name: "早起きのコーヒー", price: 100, note: "朝6:30の通知と相性がいい" },
  { id: "c-timer", slot: "charm", name: "集中のお守り", price: 400, note: "30分タイマーの友" },
  { id: "c-streak", slot: "charm", name: "連続の指輪", price: 1000, note: "途切れさせない者の証" },
  { id: "c-crown", slot: "charm", name: "合格の王冠", price: 9999, note: "魔王を倒してから買いたい" },
];

export const itemById = (id: string | undefined) => ITEMS.find((i) => i.id === id);
