"use client";

import { useState, useEffect } from "react";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import SuccessBanner from "../ui/SuccessBanner";
import AboutMeForm from "../forms/AboutMeForm";

export default function AboutMeClient({ initialAbout }) {
  const [about, setAbout] = useState(initialAbout);
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
    setAbout(newData);
    setIsEditing(false);
  };
  return (
    <div className="lg:relative min-h-screen md:min-h-dvh flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />
      {isEditing ? (
        <AboutMeForm
          initialAbout={about}
          onCancel={() => setIsEditing(false)}
          onSuccess={handleUpdateSuccess}
          successMessage={setSuccessMsg}
        />
      ) : (
        <div className="flex flex-1 flex-col gap-6 p-5">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">About Me.</h1>
            <span className="text-gray-500 text-sm">
              Manage your about me information.
            </span>
          </div>

          {successMsg && <SuccessBanner message={successMsg} />}

          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300">
              <p className="text-sm">{about}</p>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                Edit Content
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
