"use client";

import DOMPurify from "isomorphic-dompurify";
import { useState, useEffect } from "react";
import { ChevronLeft, GitFork, Globe } from "lucide-react";
import Link from "next/link";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import SuccessBanner from "../ui/SuccessBanner";
import EditProjectsForm from "../forms/EditProjectsForm";
import { deleteProjectAction } from "@/app/actions/projects";

export default function ProjectDetailsClient({
  project,
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
    if (!errorMsg || !successMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
      setSuccessMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg, successMsg]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // Targets ONLY this specific project using project.id
      const result = await deleteProjectAction(project.id);

      if (!result.success) {
        setErrorMsg(result.error);
        setIsDeleting(false);
        return;
      }

      deleteSuccessMessage("Project deleted successfully.");
      onDeleteSuccess(project.id);
    } catch {
      setErrorMsg("An unexpected error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  return (
    <div className=" relative flex flex-1 flex-col gap-6">
      {isEditing ? (
        <EditProjectsForm
          projects={project}
          onCancel={() => setIsEditing(false)}
          onEditSuccess={(updatedData) => {
            setIsEditing(false);
            onEditSuccess(updatedData);
          }}
          successMessage={setSuccessMsg}
        />
      ) : (
        <>
          {" "}
          <div className="flex">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-black/90 transition-colors duration-300 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
              <span className="text-sm">Back to Projects</span>
            </button>
          </div>
          {successMsg && <SuccessBanner message={successMsg} />}
          {errorMsg && <ErrorBanner message={errorMsg} />}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-1 gap-4 items-center ">
                {/* icon */}
                <div className="flex">
                  <div className="size-12 md:size-14 ">
                    {project.iconurl ? (
                      <img
                        src={project.iconurl}
                        alt={project.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-gray-500">
                        {project.title?.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {/* title and link */}
                <div className="flex flex-1 flex-col gap-1">
                  <h1 className="text-lg md:text-xl font-bold">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    {project.github_link && (
                      <Link
                        href={project.github_link}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-500 hover:text-black/90 transition-colors duration-300 flex items-center gap-1.5"
                      >
                        Visit Github
                        <GitFork className="size-3" />
                      </Link>
                    )}
                    {project.link && (
                      <Link
                        href={project.link}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-500 hover:text-black/90 transition-colors duration-300 flex items-center gap-1.5"
                      >
                        Visit Site
                        <Globe className="size-3" />
                      </Link>
                    )}
                  </div>
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

            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-500">Project Description</span>

              <div
                className="p-5 text-sm rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 "
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(project.description || ""),
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Tech Stack</span>
              <div className="flex flex-wrap gap-2">
                {project.techstack.map((ts, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 rounded-md px-2 py-1"
                  >
                    <p className="text-[11px]">{ts}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 md:gap-4 items-center md:items-baseline justify-center mt-4">
              <Button
                onClick={handleDelete}
                type="button"
                variant="critical"
                disabled={isDeleting}
              >
                Delete Project
              </Button>

              <span className="text-xs text-center md:text-start text-gray-500">
                Warning: Deleting project is irreversible and will result to
                permanent loss of project. Delete at your own risk.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
