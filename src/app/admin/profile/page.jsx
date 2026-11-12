import { Suspense } from "react";
import { connection } from "next/server";
import { getProfileRecord } from "@/services/profile";
import ProfileClientView from "@/components/view/ProfileClient";
import Loading from "@/components/ui/Loading";

async function ProfileContent() {
  await connection();
  const profile = await getProfileRecord();
  return <ProfileClientView initialProfile={profile} />;
}

export default async function Profile() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContent />
    </Suspense>
  );
}
