import { noteFor, noteUrl } from "@/lib/game/obsidian";

/**
 * vault のノートを Obsidian で開くリンク。id（スキル・地方）か path（vault 内のパス）で指定する。
 * 対応ノートが無ければ何も出さない。
 */
export default function NoteLink({ id, path, label }: { id?: string; path?: string; label?: string }) {
  const target = path ?? noteFor(id);
  if (!target) return null;
  const name = target.split("/").pop();

  return (
    <a href={noteUrl(target)} className="inline-flex items-center gap-1 text-xs text-ex underline underline-offset-2">
      📖 {label ?? name}
    </a>
  );
}
