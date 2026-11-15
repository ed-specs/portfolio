"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Button from "../ui/Button";
import SuccessBanner from "../ui/SuccessBanner";
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

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  return (
    <div className="flex flex-1 flex-col gap-6">
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

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-1 gap-6 items-center ">
            {/* icon */}
            <div className="flex">
              <div className="size-12 md:size-14 lg:size-16 ">
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
            <div className="flexflex-1 flex-col gap-">
              <h1 className="text-lg font-bold">{project.title}</h1>
              <Link
                href={project.link}
                target="_blank"
                className="text-gray-500 text-xs hover:text-black/90 transition-colors duration-300"
              >
                {project.link}
              </Link>
            </div>
          </div>

          <div className="flex sm:items-center sm:justify-center">
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Edit Project
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-gray-500">Project Description</span>
          <div className="rounded-lg border border-gray-300 p-5">
            <p className="text-sm">{project.description}</p>
          </div>
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
          <Button type="button" variant="critical">
            Delete Project
          </Button>

          <span className="text-xs text-center md:text-start text-gray-500">
            Warning: Deleting project is irreversible and will result to
            permanent loss of project. Delete at your own risk.
          </span>
        </div>
      </div>
    </div>
  );
}
