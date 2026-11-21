import { Suspense } from "react";
import { connection } from "next/server";
import { getAchievementsRecord } from "@/services/achievements";
import AchievementClient from "@/components/view/Achievements";
import Loading from "@/components/ui/Loading";

async function AchievementContent() {
  await connection();
  const achievement = await getAchievementsRecord();
  return <AchievementClient initialAchievement={achievement} />;
}

export default function AboutMe() {
  return (
    <Suspense fallback={<Loading />}>
      <AchievementContent />
    </Suspense>
  );
}
