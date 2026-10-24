import AuthGate from "@/components/AuthGate";
import MapView from "@/components/game/MapView";

export default function Page() {
  return (
    <AuthGate title="地図" greeting="世界地図だ。挑みたい場所をタップしよう。">
      <MapView />
    </AuthGate>
  );
}
