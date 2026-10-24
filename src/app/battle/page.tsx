import AuthGate from "@/components/AuthGate";
import BattleView from "@/components/game/BattleView";

export default function Page() {
  return (
    <AuthGate title="たたかう" greeting="誤答台帳から モンスターが あらわれた！">
      <BattleView />
    </AuthGate>
  );
}
