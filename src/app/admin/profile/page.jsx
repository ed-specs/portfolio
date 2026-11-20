import { Suspense } from "react";
import { connection } from "next/server";
import { getProfileRecord } from "@/services/profile";
import { getSocialLinksRecord } from "@/services/socialLinks";
import ProfileClientView from "@/components/view/ProfileClient";
import Loading from "@/components/ui/Loading";

async function ProfileContent() {
  await connection();
  const [profile, socialLinks] = await Promise.all([
    getProfileRecord(),
    getSocialLinksRecord(),
  ]);
  return (
    <ProfileClientView
      initialProfile={profile}
      initialSocialLinks={socialLinks}
    />
  );
}

export default async function Profile() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContent />
    </Suspense>
  );
}
