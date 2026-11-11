import { Suspense } from "react";
import { connection } from "next/server";
import { getProfileRecord } from "@/services/profile";
import ProfileClientView from "@/components/view/ProfileClient";

async function ProfileContent() {
  await connection();
  const profile = await getProfileRecord();
  console.log(profile);
  return <ProfileClientView initialProfile={profile} />;
}

export default async function Profile() {
  return (
    <div className="lg:relative min-h-screen md:min-h-dvh flex flex-col lg:flex-row">
      <Suspense fallback={<p>Loading profile...</p>}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
