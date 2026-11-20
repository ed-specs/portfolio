"use client";

import { useState, useEffect } from "react";
import { Minus } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import RichTextEditor from "../ui/RichTextEditor";
import { updateExperienceAction } from "@/app/actions/experience";

export default function EditExperienceForm({
  experience,
  onEditSuccess,
  onCancel,
  successMessage,
}) {
  const [formData, setFormData] = useState(experience);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  const plainTextDescription = (formData.description || "").replace(
    /<[^>]*>/g,
    "",
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.role?.trim() ||
      !formData.company?.trim() ||
      !plainTextDescription.trim() ||
      !formData.start_date
    ) {
      setErrorMsg(
        "Job title, Company, Description, and Start Date are required.",
      );
      return;
    }

    if (!formData.is_current && !formData.end_date) {
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
        role: formData.role.trim(),
        company: formData.company.trim(),
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.is_current ? null : formData.end_date,
        is_current: Boolean(formData.is_current),
      };

      const result = await updateExperienceAction(experience.id, payload);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onEditSuccess(result.data);
      successMessage("Experience updated successfully.");
    } catch {
      setErrorMsg("Failed to update experience.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold">Edit Experience</h1>
        <span className="text-gray-500 text-sm">Edit your experience</span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        <Input
          id="company"
          label="Organization / Company"
          type="text"
          placeholder="e.g. Outlier"
          value={formData.company || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, company: e.target.value }))
          }
          disabled={isLoading}
          required
        />
        <Input
          id="role"
          label="Job Title"
          type="text"
          placeholder="e.g. Web Developer"
          value={formData.role || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, role: e.target.value }))
          }
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
                value={formData.start_date || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
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
                value={formData.is_current ? "" : formData.end_date || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }))
                }
                disabled={isLoading || Boolean(formData.is_current)}
                required={!formData.is_current}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="isCurrent"
              checked={Boolean(formData.is_current)}
              disabled={isLoading}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  is_current: checked,
                  end_date: checked ? "" : prev.end_date,
                }));
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
              value={formData.description || ""}
              onChange={(html) =>
                setFormData((prev) => ({
                  ...prev,
                  description: html,
                }))
              }
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
