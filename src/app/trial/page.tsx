import AuthGate from "@/components/AuthGate";
import TrialView from "@/components/game/TrialView";

export default function Page() {
  return (
    <AuthGate title="限定語の試練場" greeting="問いの 限定語を 見落とすな！">
      <TrialView />
    </AuthGate>
  );
}
