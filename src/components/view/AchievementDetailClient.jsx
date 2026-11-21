"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ExternalLink, FileText } from "lucide-react";
import Button from "../ui/Button";
import SuccessBanner from "../ui/SuccessBanner";
import ErrorBanner from "../ui/ErrorBanner";
import EditAchievementForm from "../forms/EditAchievements";
import { deleteAchievementAction } from "@/app/actions/achievements";

export default function AchievementDetailsClient({
  achievement,
  onBack,
  onEditSuccess,
  onDeleteSuccess,
  deleteSuccessMessage,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!errorMsg && !successMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
      setSuccessMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg, successMsg]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${achievement.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteAchievementAction(achievement.id);

      if (!result.success) {
        setErrorMsg(result.error);
        setIsDeleting(false);
        return;
      }

      deleteSuccessMessage("Achievement deleted successfully.");
      onDeleteSuccess(achievement.id);
    } catch {
      setErrorMsg("An unexpected error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  const formattedDate = achievement.issue_date
    ? new Date(`${achievement.issue_date}T00:00:00`).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      )
    : null;

  const proofUrl = achievement.file_url || achievement.certificate_url;

  return (
    <div className="flex flex-col gap-6">
      {isEditing ? (
        <EditAchievementForm
          achievement={achievement}
          onEditSuccess={(updatedAchievement) => {
            setIsEditing(false);
            onEditSuccess(updatedAchievement);
          }}
          onCancel={() => setIsEditing(false)}
          successMessage={setSuccessMsg}
        />
      ) : (
        <>
          <div className="flex">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-black/90 transition-colors duration-300 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
              <span className="text-sm">Back to Achievements</span>
            </button>
          </div>

          {successMsg && <SuccessBanner message={successMsg} />}
          {errorMsg && <ErrorBanner message={errorMsg} />}

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <h1 className="md:text-lg font-bold">{achievement.title}</h1>
                  {achievement.issuer && (
                    <span className="text-sm text-gray-500">
                      Issued by {achievement.issuer}
                    </span>
                  )}
                </div>

                {formattedDate && (
                  <span className="text-[11px]  text-gray-500">
                    Date Issued: {formattedDate}
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                Edit Achievement
              </Button>
            </div>

            {proofUrl && (
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-500 text-sm">Certificate Proof</span>
                <div className="rounded-lg border border-gray-300 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="size-5 text-gray-600 shrink-0" />
                    <span className="text-sm truncate">
                      {achievement.file_url
                        ? "Uploaded PDF Certificate"
                        : achievement.certificate_url}
                    </span>
                  </div>

                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium hover:border-black/90 transition-colors shrink-0"
                  >
                    <span>
                      {achievement.file_url ? "Open PDF" : "Verify Link"}
                    </span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 md:gap-4 items-center md:items-baseline justify-center mt-4  border-gray-200">
              <Button
                onClick={handleDelete}
                type="button"
                variant="critical"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Achievement"}
              </Button>

              <span className="text-xs text-center md:text-start text-gray-500">
                Warning: Deleting an achievement is irreversible and will
                permanently remove this credential.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
