import AuthGate from "@/components/AuthGate";
import LinksView from "@/components/LinksView";

export default function Page() {
  return (
    <AuthGate title="リンク">
      <LinksView />
    </AuthGate>
  );
}
