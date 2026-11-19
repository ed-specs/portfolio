"use client";

import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import SuccessBanner from "../ui/SuccessBanner";
import { deleteExperienceAction } from "@/app/actions/experience";
import { ChevronLeft } from "lucide-react";
import EditExperienceForm from "../forms/EditExperience";

export default function ExperienceDetailsClient({
  experience,
  onBack,
  onEditSuccess,
  onDeleteSuccess,
  deleteSuccessMessage,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
      setSuccessMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg, successMsg]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${experience.role}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteExperienceAction(experience.id);

      if (!result.success) {
        setErrorMsg(result.error);
        setIsDeleting(false);
        return;
      }

      onDeleteSuccess(experience.id);
      deleteSuccessMessage("Experience deleted successfully.");
    } catch (err) {
      setErrorMsg("An unexpected error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  const formatDateRange = (startDate, endDate, isCurrent) => {
    const options = { month: "short", year: "numeric" };
    const start = new Date(startDate).toLocaleDateString("en-US", options);

    if (isCurrent) {
      return <span>{start} – Present</span>;
    }

    if (!endDate) {
      return <span>{start}</span>;
    }

    const end = new Date(endDate).toLocaleDateString("en-US", options);

    return (
      <>
        <div className="border border-gray-300 rounded-md px-2 py-1">
          <p className="text-[11px]">{start}</p>
        </div>
        <span className="text-gray-500 text-xs">-</span>
        <div className="border border-gray-300 rounded-md px-2 py-1">
          <p className="text-[11px]">{end}</p>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {isEditing ? (
        <EditExperienceForm
          exprience={experience}
          onEditSuccess={(updatedExperience) => {
            setIsEditing(false);
            onEditSuccess(updatedExperience);
          }}
          onCancel={() => setIsEditing(false)}
          successMessage={setSuccessMsg}
        />
      ) : (
        <>
          <div className="flex">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-black/90 transition-colors duration-300 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
              <span className="text-sm">Back to Experience</span>
            </button>
          </div>

          {successMsg && <SuccessBanner message={successMsg} />}
          {errorMsg && <ErrorBanner message={errorMsg} />}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 flex-1  p-5 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-4 md:flex-1">
                  <div className="flex flex-col">
                    <h1 className="text-lg md:text-xl font-bold">
                      {experience.role}
                    </h1>
                    <span className="text-sm text-gray-500">
                      {experience.company}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {formatDateRange(
                      experience.start_date,
                      experience.end_date,
                      experience.is_current,
                    )}
                  </div>
                </div>

                <div className="flex sm:items-center sm:justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    Edit Project
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-300 px-4 py-4 mt-2">
                <p className="text-gray-500 text-sm">
                  {experience.description}
                </p>
              </div>

              <div className="flex flex-col gap-1 md:gap-4 items-center md:items-baseline justify-center mt-4">
                <Button
                  onClick={handleDelete}
                  type="button"
                  variant="critical"
                  disabled={isDeleting}
                >
                  Delete Experience
                </Button>

                <span className="text-xs text-center md:text-start text-gray-500">
                  Warning: Deleting experience is irreversible and will result
                  to permanent loss of experience. Delete at your own risk.
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
