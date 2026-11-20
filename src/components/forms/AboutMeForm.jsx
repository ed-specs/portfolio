"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { updateAboutAction } from "@/app/actions/about";
import ErrorBanner from "../ui/ErrorBanner";
import RichTextEditor from "../ui/RichTextEditor";

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

  // Count visible characters without HTML tags
  const plainTextLength = content.replace(/<[^>]*>/g, "").length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (plainTextLength > 3000) {
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
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold">Edit About Me</h1>
        <span className="text-gray-500 text-sm">Edit about me content</span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content" className="text-sm text-gray-500">
            About Me
          </label>
          <div className="flex flex-col gap-1">
            <RichTextEditor
              value={content}
              onChange={(html) => setContent(html)}
              disabled={isLoading}
              placeholder="I am Edward Gatbonton and I..."
            />

            <span
              className={`${
                plainTextLength > 3000 ? "text-red-500" : "text-gray-500"
              } text-xs transition-colors duration-300`}
            >
              {plainTextLength} / 3000 characters
            </span>
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
      </div>
    </form>
  );
}
