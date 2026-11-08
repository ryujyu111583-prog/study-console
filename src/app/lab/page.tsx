import { Suspense } from "react";
import AuthGate from "@/components/AuthGate";
import SectionLab from "@/components/game/SectionLab";

export default function Page() {
  return (
    <AuthGate title="断面ラボ" greeting="寸法を 動かして 効き方を 見よう！">
      {/* URL の ?s=box&b=50... で初期値を受け取るので Suspense が要る */}
      <Suspense>
        <SectionLab />
      </Suspense>
    </AuthGate>
  );
}
