import AuthGate from "@/components/AuthGate";
import ShopView from "@/components/game/ShopView";

export default function Page() {
  return (
    <AuthGate title="装備" greeting="店主「いらっしゃい！ 何をお求めかな？」">
      <ShopView />
    </AuthGate>
  );
}
