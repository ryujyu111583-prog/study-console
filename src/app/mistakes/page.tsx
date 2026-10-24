import AuthGate from "@/components/AuthGate";
import MistakesView from "@/components/MistakesView";

export default function Page() {
  return (
    <AuthGate title="誤答台帳" greeting="モンスター図鑑だ。間違えたものは ここに登録しよう。">
      <MistakesView />
    </AuthGate>
  );
}
