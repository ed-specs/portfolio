import { Suspense } from "react";
import { connection } from "next/server";
import { getCategoriesWithStacks } from "@/services/techStack";
import TechStackClient from "../../../components/view/TechStackClient";
import Loading from "@/components/ui/Loading";

async function TechStackContent() {
  await connection();
  const techstack = await getCategoriesWithStacks();

  return <TechStackClient initialTechStack={techstack} />;
}

export default function TechStack() {
  return (
    <Suspense fallback={<Loading />}>
      <TechStackContent />
    </Suspense>
  );
}
