import AuthGate from "@/components/AuthGate";
import PlanView from "@/components/PlanView";

export default function Page() {
  return (
    <AuthGate title="計画">
      <PlanView />
    </AuthGate>
  );
}
