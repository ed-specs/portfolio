import { Suspense } from "react";
import { connection } from "next/server";
import { getAboutRecord } from "@/services/about";
import AboutMeClient from "@/components/view/AboutMeClient";
import Loading from "@/components/ui/Loading";

async function AboutMeContent() {
  await connection();
  const about = await getAboutRecord();
  return <AboutMeClient initialAbout={about} />;
}

export default function AboutMe() {
  return (
    <Suspense fallback={<Loading />}>
      <AboutMeContent />
    </Suspense>
  );
}
