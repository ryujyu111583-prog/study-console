import AuthGate from "@/components/AuthGate";
import GuildView from "@/components/game/GuildView";

export default function Page() {
  return (
    <AuthGate title="ギルド" greeting="ギルドへようこそ。外の世界の依頼が届いているぞ。">
      <GuildView />
    </AuthGate>
  );
}
