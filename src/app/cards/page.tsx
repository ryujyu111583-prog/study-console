import AuthGate from "@/components/AuthGate";
import CardsView from "@/components/game/CardsView";

export default function Page() {
  return (
    <AuthGate title="カード" greeting="暗記カードだ。口で答えてから めくろう。">
      <CardsView />
    </AuthGate>
  );
}
