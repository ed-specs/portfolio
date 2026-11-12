"use client";
import { useEffect, useState } from "react";
import { Phone, Cake, Calendar, MapPin } from "lucide-react";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import EditProfile from "@/components/forms/EditProfileForm";
import SuccessBanner from "../ui/SuccessBanner";

export default function ProfileClientView({ initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleUpdateSuccess = (newData) => {
    setProfile(newData);
    setIsEditing(false);
  };

  const fullName = `${profile.firstname} ${profile.middlename.slice(0, 1).concat(".")} ${profile.lastname}`;

  const calculateAge = (birthDate, today = new Date()) => {
    if (!birthDate) return null;

    const [year, month, day] = birthDate.split("-").map(Number);
    if (!year || !month || !day) return null;

    let age = today.getFullYear() - year;

    const beforeBirthDay =
      today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day);

    if (beforeBirthDay) age--;

    return age < 0 ? null : age;
  };

  const convertBirthday = (birth) => {
    if (!birth) return null;

    const date = new Date(`${birth}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null; // malformed input

    const monthName = date.toLocaleString("en-US", { month: "long" });
    return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  let age = calculateAge(profile.birthdate);
  let birth = convertBirthday(profile.birthdate);

  const ADDITIONAL_INFO = [
    { label: "Phone", data: profile.phone, icon: Phone },
    { label: "Birthday", data: birth, icon: Cake },
    { label: "Age", data: age, icon: Calendar },
    { label: "Address", data: profile.address, icon: MapPin },
  ];
  return (
    <div className="lg:relative min-h-screen md:min-h-dvh w-full flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />

      {isEditing ? (
        <EditProfile
          initialData={profile}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
          successMessage={setSuccessMsg}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-6 p-5">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">Profile.</h1>
            <span className="text-gray-500 text-sm">
              Manage your profile information.
            </span>
          </div>

          {successMsg && <SuccessBanner message={successMsg} />}
          <div className=" flex flex-col md:flex-row items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center text-center md:text-start">
              {/* image container */}
              <div className="flex size-24 md:size-26 lg:size-28 bg-gray-200 rounded-lg items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden border border-gray-300 hover:border-black/90 transition-colors duration-300">
                {profile.avatarurl ? (
                  <img
                    src={profile.avatarurl}
                    alt={`${profile.firstname} ${profile.lastname}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <>
                    {profile.firstname.slice(0, 1).toUpperCase()}
                    {profile.lastname.slice(0, 1).toUpperCase()}
                  </>
                )}
              </div>

              {/* name and & email */}
              <div className="flex flex-col gap-1">
                <h1 className="font-bold uppercase text-xl">{fullName}</h1>
                <span className="text-sm text-gray-500">{profile.email}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              Edit Profile
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-sm uppercase font-medium">
              Additional Information
            </span>
            <div className=" flex flex-col gap-2">
              {ADDITIONAL_INFO.map((info) => {
                const Icon = info.icon;

                return (
                  <div
                    key={info.data}
                    className="flex items-center gap-4 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 px-4 py-2.5"
                  >
                    {/* icon */}
                    <div className="flex items-center justify-center">
                      <Icon className="size-6" />
                    </div>
                    {/* label & data */}
                    <div className="flex flex-col">
                      <span className="text-gray-500  text-xs">
                        {info.label}
                      </span>
                      <p className="uppercase font-medium text-sm">
                        {info.data}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex"></div>
        </div>
      )}
    </div>
  );
}
