import AuthGate from "@/components/AuthGate";
import BookView from "@/components/game/BookView";

export default function Page() {
  return (
    <AuthGate title="冒険の書" greeting="冒険の書を ひらいた。これまでの戦いの記録だ。">
      <BookView />
    </AuthGate>
  );
}
