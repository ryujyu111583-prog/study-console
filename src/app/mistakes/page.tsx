import AuthGate from "@/components/AuthGate";
import MistakesView from "@/components/MistakesView";

export default function Page() {
  return (
    <AuthGate title="誤答台帳">
      <MistakesView />
    </AuthGate>
  );
}
