import { noteFor, noteUrl } from "@/lib/game/obsidian";

/** vault のノートを Obsidian で開くリンク。対応ノートが無ければ何も出さない。 */
export default function NoteLink({ id, label }: { id: string | undefined; label?: string }) {
  const path = noteFor(id);
  if (!path) return null;
  const name = path.split("/").pop();

  return (
    <a href={noteUrl(path)} className="inline-flex items-center gap-1 text-xs text-ex underline underline-offset-2">
      📖 {label ?? name}
    </a>
  );
}
