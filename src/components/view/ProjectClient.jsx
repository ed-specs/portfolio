"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import SuccessBanner from "../ui/SuccessBanner";
import AddProjectsForm from "../forms/AddProjectsForm";

export default function ProjectsClientView({ initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [showAddProject, setShowAddProject] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleUpdateSuccess = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setShowAddProject(false);
  };

  return (
    <div className="lg:relative min-h-screen md:min-h-dvh w-full flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />

      <div className="flex flex-1 flex-col gap-6 p-5">
        {showAddProject ? (
          <AddProjectsForm
            onCancel={() => setShowAddProject(false)}
            onSuccess={handleUpdateSuccess}
            successMessage={setSuccessMsg}
          />
        ) : (
          <>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold">Projects.</h1>
              <span className="text-gray-500 text-sm">
                Manage your projects information.
              </span>
            </div>

            {successMsg && <SuccessBanner message={successMsg} />}

            {/* <div className="flex items-center">
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowAddProject(true)}
              >
                Add Projects
              </Button>
            </div> */}

            {projects.length === 0 ? (
              <div className="rounded-lg border border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <h1 className="text-lg font-bold">No Projects Available.</h1>

                  <span className="text-gray-500 text-sm text-center">
                    There are no current available projects.
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setShowAddProject(true)}
                    >
                      Add Projects
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-6">
                  <div className="flex">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setShowAddProject(true)}
                    >
                      Add Projects
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="col-span-2 md:col-span-1 rounded-lg border border-gray-300  flex flex-col  hover:border-black/90 transition-colors duration-300"
                      >
                        <div className="flex gap-4 p-5">
                          {/* icon */}
                          <div className="flex items-baseline flex-nowrap">
                            <div className="size-12 md:size-14 lg:size-16 ">
                              {p.iconurl ? (
                                <img
                                  src={p.iconurl}
                                  alt={p.title}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-gray-500">
                                  {p.title?.slice(0, 1).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* descriptions */}

                          <div className="flex flex-col flex-1 gap-2">
                            <div className="flex">
                              <h1 className="text-lg font-bold">{p.title}</h1>
                            </div>
                            <div className="flex ">
                              <p className="text-gray-500 text-xs md:text-sm line-clamp-3 ">
                                {p.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {p.techstack.map((pt, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-300 rounded-md px-2 py-1"
                                >
                                  <p className="text-[11px]">{pt}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-gray-300 px-5 py-3 flex items-center justify-end gap-2">
                          <Link
                            href={p.link}
                            target="_blank"
                            className="text-sm "
                          >
                            Go to {p.title}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
