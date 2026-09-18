import AuthGate from "@/components/AuthGate";
import SettingsView from "@/components/SettingsView";

export default function Page() {
  return (
    <AuthGate title="設定">
      <SettingsView />
    </AuthGate>
  );
}
