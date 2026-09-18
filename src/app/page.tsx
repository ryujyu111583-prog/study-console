import AuthGate from "@/components/AuthGate";
import TodayView from "@/components/TodayView";

export default function Page() {
  return (
    <AuthGate title="今日">
      <TodayView />
    </AuthGate>
  );
}
