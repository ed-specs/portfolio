"use client";

import { useState, useEffect } from "react";
import { Link2, FileText } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import { updateAchievementAction } from "@/app/actions/achievements";

export default function EditAchievementForm({
  achievement,
  onEditSuccess,
  onCancel,
  successMessage,
}) {
  const [formData, setFormData] = useState(achievement);
  const [sourceMode, setSourceMode] = useState(
    achievement?.file_url ? "pdf" : "url",
  );
  const [newFile, setNewFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Certificate PDF must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    setNewFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title?.trim()) {
      setErrorMsg("Certificate title is required.");
      return;
    }

    if (sourceMode === "url" && !formData.certificate_url?.trim()) {
      setErrorMsg("Please enter a valid Certificate URL.");
      return;
    }

    if (sourceMode === "pdf" && !newFile && !achievement.file_url) {
      setErrorMsg("Please upload a Certificate PDF.");
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("issuer", (formData.issuer || "").trim());
      data.append("issue_date", formData.issue_date || "");
      data.append("source_mode", sourceMode);

      if (sourceMode === "url") {
        data.append("certificate_url", (formData.certificate_url || "").trim());
      } else if (newFile) {
        data.append("certificate_file", newFile);
      }

      const result = await updateAchievementAction(achievement.id, data);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onEditSuccess(result.data);
      successMessage("Achievement updated successfully.");
    } catch {
      setErrorMsg("Something went wrong while updating your achievement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 ">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">Edit Achievement</h1>
        <span className="text-gray-500 text-sm">
          Update certificate details or replace file
        </span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        <Input
          id="title"
          label="Certificate Title"
          type="text"
          placeholder="Enter certificate title"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={isLoading}
          required
        />
        <Input
          id="issuer"
          label="Certificate Issuer (Optional)"
          type="text"
          placeholder="Enter certificate issuer"
          value={formData.issuer || ""}
          onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
          disabled={isLoading}
        />
        <Input
          id="issueDate"
          label="Date Issued (Optional)"
          type="date"
          value={formData.issue_date || ""}
          onChange={(e) =>
            setFormData({ ...formData, issue_date: e.target.value })
          }
          disabled={isLoading}
        />

        {/* Source Mode Switcher */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-500">Certificate Proof</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setSourceMode("url")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                sourceMode === "url"
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-black/90"
              }`}
            >
              <Link2 className="size-4" />
              <span>Certificate URL</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => setSourceMode("pdf")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                sourceMode === "pdf"
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-black/90"
              }`}
            >
              <FileText className="size-4" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>

        {sourceMode === "url" ? (
          <Input
            id="certificateUrl"
            label="Certificate Verification URL"
            type="url"
            placeholder="https://example.com/verify/certificate"
            value={formData.certificate_url || ""}
            onChange={(e) =>
              setFormData({ ...formData, certificate_url: e.target.value })
            }
            disabled={isLoading}
            required
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="certificateFile" className="text-sm text-gray-500">
              {achievement.file_url
                ? "Replace Certificate PDF (Optional, Max 5MB)"
                : "Upload Certificate PDF (Max 5MB)"}
            </label>
            <input
              id="certificateFile"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="text-xs text-gray-600 file:transition-colors file:duration-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-xs file:bg-white file:text-black/90 hover:file:bg-gray-100 cursor-pointer file:cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
            />
            {newFile ? (
              <span className="text-xs text-gray-500">
                New file selected: <strong>{newFile.name}</strong>
              </span>
            ) : achievement.file_url ? (
              <span className="text-xs text-gray-500">
                Current PDF is attached. Leave blank to keep it.
              </span>
            ) : null}
          </div>
        )}
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
