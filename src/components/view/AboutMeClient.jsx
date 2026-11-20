"use client";

import { useState, useEffect } from "react";

import DOMPurify from "isomorphic-dompurify";
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

  const hasContent = about.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="lg:relative min-h-svh md:min-h-screen flex flex-col lg:flex-row">
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
            <h1 className="text-lg md:text-xl font-bold">About Me</h1>
            <span className="text-gray-500 text-sm">
              Manage your about me information
            </span>
          </div>

          {successMsg && <SuccessBanner message={successMsg} />}

          {!hasContent ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12 px-6">
              <div className="flex flex-col items-center justify-center gap-1">
                <h1 className="text-lg md:text-xl font-bold">No About Me</h1>

                <span className="text-gray-500 text-sm text-center">
                  There are no current about me content
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    Add About Me
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  Edit Content
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-gray-500 text-sm">About Me</span>
                <div
                  className="p-5 text-sm rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 prose prose-sm max-w-none min-h-60"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(about),
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
