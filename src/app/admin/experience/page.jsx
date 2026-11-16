import { Suspense } from "react";
import { connection } from "next/server";
import { getExperienceRecord } from "@/services/experience";
import ExperienceClientView from "@/components/view/ExperienceClient";
import Loading from "../Loading";

async function ExperienceContent() {
  await connection();
  const experience = getExperienceRecord();
  return <ExperienceClientView initialExperience={experience} />;
}

export default function Experience() {
  return (
    <Suspense fallback={<Loading />}>
      <ExperienceContent />
    </Suspense>
  );
}
