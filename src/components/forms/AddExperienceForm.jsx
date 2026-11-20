"use client";

import { useState, useEffect } from "react";
import { Minus } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import RichTextEditor from "../ui/RichTextEditor";
import { createExperienceAction } from "@/app/actions/experience";

export default function AddExperienceForm({
  onSuccess,
  onCancel,
  successMessage,
}) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  const plainTextDescription = description.replace(/<[^>]*>/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !role.trim() ||
      !company.trim() ||
      !plainTextDescription.trim() ||
      !startDate
    ) {
      setErrorMsg(
        "Job title, Company, Description, and Start Date are required.",
      );
      return;
    }

    if (!isCurrent && !endDate) {
      setErrorMsg("End Date is required unless you are currently employed.");
      return;
    }

    if (plainTextDescription.length > 3000) {
      setErrorMsg("Description cannot exceed 3000 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        role: role.trim(),
        company: company.trim(),
        description,
        start_date: startDate,
        end_date: isCurrent ? null : endDate,
        is_current: isCurrent,
      };

      const result = await createExperienceAction(payload);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onSuccess(result.data);
      successMessage("Experience added successfully.");
    } catch {
      setErrorMsg("Failed to add experience.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold">Add Experience</h1>
        <span className="text-gray-500 text-sm">Add new experience</span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        <Input
          id="company"
          label="Organization / Company"
          type="text"
          placeholder="e.g. Outlier"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          id="role"
          label="Job Title"
          type="text"
          placeholder="e.g. Web Developer"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isLoading}
          required
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
            <div className="w-full">
              <Input
                id="startDate"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Minus className="size-5 text-gray-500 mt-6 shrink-0" />

            <div className="w-full">
              <Input
                id="endDate"
                label="End Date"
                type="date"
                value={isCurrent ? "" : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading || isCurrent}
                required={!isCurrent}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              disabled={isLoading}
              onChange={(e) => {
                setIsCurrent(e.target.checked);
                if (e.target.checked) setEndDate("");
              }}
              className="cursor-pointer"
            />
            <label
              htmlFor="isCurrent"
              className="text-gray-500 text-xs cursor-pointer"
            >
              Currently employed
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-gray-500">Description</span>
          <div className="flex flex-col gap-1">
            <RichTextEditor
              value={description}
              onChange={(html) => setDescription(html)}
              disabled={isLoading}
              placeholder="e.g. During my internship..."
            />
            <span
              className={`${
                plainTextDescription.length > 3000
                  ? "text-red-500"
                  : "text-gray-500"
              } text-xs transition-colors duration-300`}
            >
              {plainTextDescription.length} / 3000 characters
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          disabled={isLoading}
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Discard
        </Button>
        <Button disabled={isLoading} type="submit" variant="primary">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
