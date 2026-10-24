import AuthGate from "@/components/AuthGate";
import RulesView from "@/components/game/RulesView";

export default function Page() {
  return (
    <AuthGate title="ルール" greeting="これが この世界の決まりだ。迷ったら いつでも ここへ。">
      <RulesView />
    </AuthGate>
  );
}
