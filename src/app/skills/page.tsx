import AuthGate from "@/components/AuthGate";
import SkillsView from "@/components/game/SkillsView";

export default function Page() {
  return (
    <AuthGate title="スキル" greeting="SPを使って 特技を覚えよう。">
      <SkillsView />
    </AuthGate>
  );
}
