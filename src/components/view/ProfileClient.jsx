"use client";
import { useEffect, useState } from "react";
import {
  Phone,
  Cake,
  Calendar,
  MapPin,
  FileText,
  ExternalLink,
  Download,
  Globe,
} from "lucide-react";
import Link from "next/link";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import EditProfile from "@/components/forms/EditProfileForm";
import SuccessBanner from "../ui/SuccessBanner";

export default function ProfileClientView({
  initialProfile,
  initialSocialLinks = [],
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleUpdateSuccess = (newProfileData, updatedLinks) => {
    setProfile(newProfileData);
    if (updatedLinks) {
      setSocialLinks(updatedLinks);
    }
    setIsEditing(false);
  };

  const fullName = `${profile.firstname} ${
    profile.middlename ? `${profile.middlename.slice(0, 1)}. ` : ""
  }${profile.lastname}`;

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
    if (Number.isNaN(date.getTime())) return null;

    const monthName = date.toLocaleString("en-US", { month: "long" });
    return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const age = calculateAge(profile.birthdate);
  const birth = convertBirthday(profile.birthdate);

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
          initialSocialLinks={socialLinks}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
          successMessage={setSuccessMsg}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-6 p-5">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">Profile</h1>
            <span className="text-gray-500 text-sm">
              Manage your profile information, resume, and social links
            </span>
          </div>

          {successMsg && <SuccessBanner message={successMsg} />}

          {/* Avatar + Name + Edit Button */}
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center text-center md:text-start">
              <div className="flex size-24 md:size-26 lg:size-28 bg-gray-200 rounded-lg items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden border border-gray-300 hover:border-black/90 transition-colors duration-300">
                {profile.avatarurl ? (
                  <img
                    src={profile.avatarurl}
                    alt={`${profile.firstname} ${profile.lastname}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <>
                    {profile.firstname?.slice(0, 1).toUpperCase()}
                    {profile.lastname?.slice(0, 1).toUpperCase()}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="font-bold uppercase text-xl">{fullName}</h1>
                <span className="text-sm text-gray-500">{profile.email}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </div>

          {/* Additional Information */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-sm uppercase font-medium">
              Additional Information
            </span>
            <div className="flex flex-col gap-2">
              {ADDITIONAL_INFO.map((info) => {
                const Icon = info.icon;
                return (
                  <div
                    key={info.label}
                    className="flex items-center gap-4 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 px-4 py-2.5"
                  >
                    <div className="flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs">
                        {info.label}
                      </span>
                      <p className="uppercase font-medium text-sm">
                        {info.data || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Links Section */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-sm uppercase font-medium">
              Social Links ({socialLinks.length})
            </span>

            {socialLinks.length === 0 ? (
              // <div className="rounded-lg border border-dashed border-gray-300 px-4 py-4  text-gray-500">
              //   No social links added yet. Click &ldquo;Edit Profile&rdquo; to
              //   add your GitHub, LinkedIn, or Facebook links.
              // </div>

              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12 px-6">
                <div className="flex flex-col items-center justify-center gap-1">
                  <h1 className="text-lg md:text-xl font-bold">
                    No Social Links
                  </h1>

                  <span className="text-gray-500 text-sm text-center">
                    There are no current available social links
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {socialLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <Globe className="size-5 shrink-0" />
                      <div className="flex flex-col ">
                        <span className="text-sm font-medium ">
                          {link.platform}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {link.url}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="size-4 text-gray-500 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Resume / CV Section */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-sm uppercase font-medium">
              Resume / CV
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 p-4">
              <div className="flex items-center gap-4">
                <FileText className="size-6 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">
                    Curriculum Vitae
                  </span>
                  <p className="font-medium text-sm">
                    {profile.resume_url
                      ? `${profile.firstname}_${profile.lastname}_Resume.pdf`
                      : "No resume uploaded yet"}
                  </p>
                </div>
              </div>

              {profile.resume_url && (
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-gray-300 rounded-md px-4 py-2 text-sm w-full justify-center font-medium hover:border-black/90 transition-colors duration-300"
                  >
                    <span>View</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                  <Link
                    href={`${profile.resume_url}${
                      profile.resume_url.includes("?") ? "&" : "?"
                    }download=${profile.firstname}_${profile.lastname}_Resume.pdf`}
                    className="inline-flex items-center gap-1.5 bg-black text-white rounded-md px-4 py-2 text-sm w-full justify-center font-medium hover:bg-black/85 transition-colors duration-300"
                  >
                    <span>Download</span>
                    <Download className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
