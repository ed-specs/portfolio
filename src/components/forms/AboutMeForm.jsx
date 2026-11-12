"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { updateAboutAction } from "@/app/actions/about";
import ErrorBanner from "../ui/ErrorBanner";

export default function AboutMeForm({
  initialAbout,
  onCancel,
  onSuccess,
  successMessage,
}) {
  const [content, setContent] = useState(initialAbout);
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
    setIsLoading(true);

    if (content.length > 3000) {
      setErrorMsg("About me content cannot exceed 3000 characters.");
      return;
    }

    try {
      const result = await updateAboutAction({ content });

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onSuccess(result.data);
      successMessage("About me content changed successfully.");
    } catch (err) {
      console.error("Could not about me content:", err);
      setErrorMsg("Could not save about me content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-5">
      {errorMsg && <ErrorBanner message={errorMsg} />}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <textarea
            type="text"
            rows="10"
            maxLength="3000"
            value={content}
            className="border border-gray-300 w-full rounded-lg px-3 py-2 md:text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80 readonly:disabled:opacity-80"
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />

          <span
            className={`${content.length > 3000 ? "text-red-500" : "text-gray-500 text-xs"} transition-colors duration-300`}
          >
            {content.length} / 3000 characters
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button disabled={isLoading} type="submit" variant="primary">
            Save Changes
          </Button>
          <Button
            disabled={isLoading}
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Discard
          </Button>
        </div>
      </div>
    </form>
  );
}
