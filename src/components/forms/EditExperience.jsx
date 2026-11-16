"use client";

import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import { updateExperienceAction } from "@/app/actions/experience";
import { Minus } from "lucide-react";

export default function EditExperienceForm({
  exprience,
  onEditSuccess,
  onCancel,
  successMessage,
}) {
  const [formData, setFormData] = useState(exprience);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role.trim() || !company.trim() || !description || !startDate.trim()) {
      setErrorMsg(
        "Job title, Company, Description, and Start Date are required.",
      );
      return;
    }
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("role", formData.role.trim());
      data.append("company", formData.company.trim());
      data.append("description", formData.description.trim());
      data.append("start_date", formData.startDate);
      data.append("end_date", formData.isCurrent ? null : formData.endDate);
      data.append("is_current", formData.isCurrent);

      const result = await updateExperienceAction(payload);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onEditSuccess(result.data);
      successMessage("Experience updated successfully.");
    } catch (err) {
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
          id="role"
          label="Job Title"
          type="text"
          placeholder="e.g. Web Developer"
          value={formData.role}
          onChange={(e) =>
            setFormData.role((prev) => ({ ...prev, role: e.target.value }))
          }
          disabled={isLoading}
          required
        />
        <Input
          id="company"
          label="Organization / Company"
          type="text"
          placeholder="e.g. Outlier"
          value={formData.company}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, company: e.target.value }))
          }
          disabled={isLoading}
          required
        />
        <div className="flex flex-col gap-1.5 ">
          <div className="flex items-center gap-4">
            <div className="w-full">
              <Input
                id="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <Minus className="size-5 text-gray-500 mt-6" />

            <div className="w-full">
              {" "}
              <Input
                id="endDate"
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              value={formData.isCurrent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isCurrent: e.target.checked,
                }))
              }
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
          <label htmlFor="description" className="text-sm text-gray-500">
            Description
          </label>
          <div className="flex flex-col gap-1">
            <textarea
              id="description"
              name="description"
              type="text"
              rows="10"
              maxLength="3000"
              placeholder="e.g. During my internship..."
              value={formData.description}
              className="border border-gray-300 w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80 readonly:disabled:opacity-80"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isLoading}
              required
            ></textarea>
            <span
              className={`${formData.description.length > 3000 ? "text-red-500" : "text-gray-500 "} text-xs transition-colors duration-300`}
            >
              {formData.description.length} / 3000 characters
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
