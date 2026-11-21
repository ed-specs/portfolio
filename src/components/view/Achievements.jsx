"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import SuccessBanner from "../ui/SuccessBanner";
import AddAchievementForm from "../forms/AddAchievementsForm";
import AchievementDetailsClient from "./AchievementDetailClient";

export default function AchievementClient({ initialAchievement }) {
  const [achievement, setAchievement] = useState(initialAchievement || []);
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleUpdateSuccess = (newAchievement) => {
    setAchievement((prev) => [newAchievement, ...prev]);
    setShowAddAchievement(false);
  };

  const handleEditSuccess = (updatedAchievement) => {
    setAchievement((prev) =>
      prev.map((item) =>
        item.id === updatedAchievement.id ? updatedAchievement : item,
      ),
    );
    setSelectedAchievement(updatedAchievement);
  };

  const handleDeleteSuccess = (achievementId) => {
    setAchievement((prev) => prev.filter((item) => item.id !== achievementId));
    setSelectedAchievement(null);
  };

  const formatIssueDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="lg:relative min-h-svh md:min-h-screen flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />

      <div className="flex flex-1 flex-col gap-6 p-5">
        {showAddAchievement ? (
          <AddAchievementForm
            onSuccess={handleUpdateSuccess}
            onCancel={() => setShowAddAchievement(false)}
            successMessage={setSuccessMsg}
          />
        ) : selectedAchievement ? (
          <AchievementDetailsClient
            achievement={selectedAchievement}
            onBack={() => setSelectedAchievement(null)}
            onEditSuccess={handleEditSuccess}
            onDeleteSuccess={handleDeleteSuccess}
            deleteSuccessMessage={setSuccessMsg}
          />
        ) : (
          <>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold">Achievements</h1>
              <span className="text-gray-500 text-sm">
                Manage your achievements information
              </span>
            </div>

            {successMsg && <SuccessBanner message={successMsg} />}

            {achievement.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12 px-6">
                <div className="flex flex-col items-center justify-center gap-1">
                  <h1 className="text-lg md:text-xl font-bold">
                    No Achievements Available
                  </h1>
                  <span className="text-gray-500 text-sm text-center">
                    There are no current available achievements
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowAddAchievement(true)}
                  >
                    Add Achievement
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowAddAchievement(true)}
                  >
                    Add Achievement
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {achievement.map((amt) => (
                    <div
                      key={amt.id}
                      onClick={() => setSelectedAchievement(amt)}
                      className="col-span-2 md:col-span-1 flex items-center justify-between gap-4 p-5 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col flex-1 gap-3 min-w-0">
                        <div className="flex flex-col">
                          <h1 className="text-lg font-bold truncate">
                            {amt.title}
                          </h1>
                          {amt.issuer && (
                            <span className="text-sm text-gray-500">
                              {amt.issuer}
                            </span>
                          )}
                        </div>

                        {amt.issue_date && (
                          <div className="w-fit rounded-md border border-gray-300 px-2">
                            <span className="text-[11px]">
                              {formatIssueDate(amt.issue_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center shrink-0">
                        {amt.certificate_url && (
                          <a
                            href={amt.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black/90 transition-colors"
                          >
                            View URL
                            <ChevronRight className="size-4" />
                          </a>
                        )}
                        {amt.file_url && (
                          <a
                            href={amt.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black/90 transition-colors"
                          >
                            View PDF
                            <ChevronRight className="size-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
