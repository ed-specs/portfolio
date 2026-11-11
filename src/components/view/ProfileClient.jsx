"use client";
import { useState } from "react";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import EditProfile from "@/components/forms/EditProfileForm";

export default function ProfileClientView({ initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateSuccess = (newData) => {
    setProfile(newData);
    setIsEditing(false);
  };

  const fullName = `${profile.firstName} ${profile.middleName} ${profile.lastName}`;
  return (
    <div className="lg:relative min-h-screen md:min-h-dvh flex flex-col lg:flex-row">
      <HeaderSection />
      {/* left (sidebar)*/}
      <Sidebar />
      {/* right */}

      {isEditing ? (
        <EditProfile onCancel={setIsEditing} />
      ) : (
        <div className="flex flex-1 flex-col gap-6 p-5">
          <div className="flex">
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              Edit Profile
            </Button>
          </div>

          <p className="text-2xl font-semibold">{fullName}</p>
        </div>
      )}
    </div>
  );
}
