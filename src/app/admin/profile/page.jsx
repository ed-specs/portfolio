import { getProfileRecord } from "@/services/profile";
import ProfileClientView from "@/components/view/ProfileClient";
export default async function Profile() {
  const profile = await getProfileRecord();
  console.log(profile);
  return (
    <div className="lg:relative min-h-screen md:min-h-dvh flex flex-col lg:flex-row">
      <ProfileClientView initialProfile={profile} />
    </div>
  );
}
