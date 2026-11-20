"use client";

import { useEffect, useState } from "react";

import Sidebar from "../ui/Sidebar";
import HeaderSection from "../ui/Header";
import SuccessBanner from "../ui/SuccessBanner";
import Button from "../ui/Button";
import AddExperienceForm from "../forms/AddExperienceForm";
import ExperienceDetailsClient from "./ExperienceDetailsClient";

export default function ExperienceClientView({ initialExperience }) {
  const [experience, setExperience] = useState(initialExperience);
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const handleAddExperience = (newExperience) => {
    setExperience((prev) => [newExperience, ...prev]);
    setShowAddExperience(false);
  };

  const handleEditSuccess = (updateExperience) => {
    setExperience((prev) =>
      prev.map((item) =>
        item.id === updateExperience.id ? updateExperience : item,
      ),
    );
    setSelectedExperience(null);
  };

  const handleDeleteSuccess = (deletedExperienceId) => {
    setExperience((prev) =>
      prev.filter((item) => item.id !== deletedExperienceId),
    );
    setSelectedExperience(null);
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
    <div className="lg:relative min-h-screen md:min-h-dvh w-full flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />
      <div className="flex flex-1 flex-col gap-6 p-5">
        {showAddExperience ? (
          <AddExperienceForm
            onSuccess={handleAddExperience}
            onCancel={() => setShowAddExperience(false)}
            successMessage={setSuccessMsg}
          />
        ) : selectedExperience ? (
          <ExperienceDetailsClient
            experience={selectedExperience}
            onBack={() => setSelectedExperience(null)}
            onEditSuccess={handleEditSuccess}
            onDeleteSuccess={handleDeleteSuccess}
            deleteSuccessMessage={setSuccessMsg}
          />
        ) : (
          <>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold">Experience</h1>
              <span className="text-gray-500 text-sm">
                Manage your experiences information
              </span>
            </div>

            {successMsg && <SuccessBanner message={successMsg} />}

            {experience.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12 px-6">
                <div className="flex flex-col items-center justify-center gap-1">
                  <h1 className="text-lg md:text-xl font-bold">
                    No Experiences Available
                  </h1>

                  <span className="text-gray-500 text-sm text-center">
                    There are no current available experience
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setShowAddExperience(true)}
                    >
                      Add Experience
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowAddExperience(true)}
                  >
                    Add Experience
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {experience.map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() => setSelectedExperience(exp)}
                      className="flex flex-col gap-4 flex-1  p-5 rounded-lg border border-gray-300 hover:border-black/90 transition-colors duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <h1 className="text-lg md:text-xl font-bold">
                          {exp.company}
                        </h1>
                        <span className="text-sm text-gray-500">
                          {exp.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {formatDateRange(
                          exp.start_date,
                          exp.end_date,
                          exp.is_current,
                        )}
                      </div>

                      <p className=" text-sm line-clamp-3">{exp.description}</p>
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
