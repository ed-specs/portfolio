"use client";

import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createAchievementAction } from "@/app/actions/achievements";
import ErrorBanner from "../ui/ErrorBanner";
import { FileText, Link2 } from "lucide-react";

export default function AddAchievementForm({
  onSuccess,
  onCancel,
  successMessage,
}) {
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [sourceMode, setSourceMode] = useState("url");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setErrorMsg("Only PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File must be smaller or equal to 5mb");
      return;
    }

    setCertificateFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg("Certificate title is required");
      return;
    }

    if (sourceMode === "url" && !certificateUrl.trim()) {
      setErrorMsg("Please enter certificate's verification URL");
      return;
    }

    if (sourceMode === "pdf" && !certificateFile) {
      setErrorMsg("Please select a PDF file to upload");
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("title", title.trim());
      data.append("issuer", issuer.trim());
      data.append("issue_date", issueDate);

      if (sourceMode === "url") {
        data.append("certificate_url", certificateUrl.trim());
      } else if (certificateFile) {
        data.append("certificate_file", certificateFile);
      }

      const result = await createAchievementAction(data);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onSuccess(result.data);
      successMessage("Certificate uploaded successfully");
    } catch (err) {
      setErrorMsg("Something went wrong while saving your achievement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">Add Achievements</h1>
        <span className="text-gray-500 text-sm">Add your achievements</span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        <Input
          id="title"
          label="Certificate Title"
          type="text"
          placeholder="e.g., Programming (Java) NC III"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          id="issuer"
          label="Certificate Issuer (Optional)"
          type="text"
          placeholder="e.g., TESDA"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          disabled={isLoading}
        />
        <Input
          id="issueDate"
          label="Date Issued (Optional)"
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          disabled={isLoading}
        />

        {/* Source Mode Switcher: Link vs. PDF */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-500">Certificate Proof</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setSourceMode("url");
                setCertificateFile(null);
              }}
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
              onClick={() => {
                setSourceMode("pdf");
                setCertificateUrl("");
              }}
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

        {/* Conditional Input Based on Selected Mode */}
        {sourceMode === "url" ? (
          <Input
            id="certificateUrl"
            label="Certificate Verification URL"
            type="url"
            placeholder="https://example.com/verify/certificate"
            value={certificateUrl}
            onChange={(e) => setCertificateUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="certificateFile" className="text-sm text-gray-500">
              Upload Certificate PDF (Max 5MB)
            </label>
            <input
              id="certificateFile"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="text-xs text-gray-600 file:transition-colors file:duration-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-xs file:bg-white file:text-black/90 hover:file:bg-gray-100 cursor-pointer file:cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
            />
            {certificateFile && (
              <span className="text-xs text-gray-500">
                Selected: <strong>{certificateFile.name}</strong>
              </span>
            )}
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
