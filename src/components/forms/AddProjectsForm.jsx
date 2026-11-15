"use client";
import { useState, useEffect } from "react";
import { createProjectAction } from "@/app/actions/projects";

import ErrorBanner from "../ui/ErrorBanner";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function AddProjectsForm({
  onCancel,
  onSuccess,
  successMessage,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techstack, setTechstack] = useState([]);
  const [techInput, setTechInput] = useState("");
  const [link, setLink] = useState("");

  const [iconFile, setIconFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  useEffect(() => {
    if (!previewUrl?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleAddTech = (e) => {
    if (e) e.preventDefault();
    const trimmed = techInput.trim();
    if (!trimmed) return;

    const exists = techstack.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!exists) {
      setTechstack((prev) => [...prev, trimmed]);
    }
    setTechInput("");
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  // Remove a technology tag by index
  const handleRemoveTech = (indexToRemove) => {
    setTechstack((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle selecting an icon file
  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Only JPG, PNG, WebP, or SVG files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Icon must be smaller than 2MB.");
      return;
    }

    setIconFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let finalTechstack = [...techstack];
    if (techInput.trim()) {
      finalTechstack.push(techInput.trim());
    }

    if (!title.trim() || !description.trim() || finalTechstack.length === 0) {
      setErrorMsg("Title, Description, and Tech Stack are required.");
      return;
    }

    try {
      const data = new FormData();
      data.append("title", title.trim());
      data.append("description", description.trim());
      data.append("techstack", JSON.stringify(finalTechstack));
      data.append("link", link.trim());

      if (iconFile) {
        data.append("icon", iconFile);
      }

      const result = await createProjectAction(data);

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onSuccess(result.data);
      console.log(result.data);
      successMessage("Project added successfully.");
    } catch (error) {
      setErrorMsg("Something went wrong while saving your project.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">Add Projects.</h1>
        <span className="text-gray-500 text-sm">Add new projects.</span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}
      <div className="flex flex-col gap-3.5">
        {/* Image Container & Upload Input (Matching your EditProfile style) */}
        <div className="flex items-center gap-4">
          <div className="flex size-14 md:size-16 lg:size-18 bg-transparent rounded-lg items-center justify-center text-3xl font-bold text-gray-500 overflow-hidden border border-gray-300 hover:border-black/90 transition-colors duration-300 shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Project icon preview"
                className="size-full object-cover"
              />
            ) : (
              <span>{title?.slice(0, 1).toUpperCase() || "P"}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-icon" className="text-sm text-gray-500">
              Project Icon (Max 2MB)
            </label>
            <input
              id="project-icon"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleIconChange}
              disabled={isLoading}
              className={`text-xs text-gray-600 file:transition-colors file:duration-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-xs file:bg-white file:text-black/90 hover:file:bg-gray-100 cursor-pointer file:cursor pointer disabled:cursor-not-allowed disabled:file:cursor-not-allowed disabled:opacity-80 disabled:file:opacity-80`}
            />
          </div>
        </div>
        <Input
          id="title"
          label="Project Title"
          type="text"
          placeholder="Enter your project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm text-gray-500">
            Project Description
          </label>
          <div className="flex flex-col gap-1">
            <textarea
              id="description"
              name="description"
              type="text"
              rows="10"
              maxLength="3000"
              placeholder="Enter your project description"
              value={description}
              className="border border-gray-300 w-full rounded-lg px-3 py-2 md:text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80 readonly:disabled:opacity-80"
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              required
            ></textarea>
            <span
              className={`${description.length > 3000 ? "text-red-500" : "text-gray-500 text-xs"} transition-colors duration-300`}
            >
              {description.length} / 3000 characters
            </span>
          </div>
        </div>
        <Input
          id="link"
          label="Project Link"
          type="text"
          placeholder="https://project-link-url.com"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          disabled={isLoading}
          required
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="techstack" className="text-sm text-gray-500">
              Projec Tech Stack
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="techstack"
                id="techstack"
                value={techInput || ""}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                disabled={isLoading}
                placeholder="Enter tech stack used for your project"
                className="border w-full border-gray-300 rounded-lg px-3 py-2 md:text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80 readonly:disabled:opacity-80"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading}
                onClick={handleAddTech}
              >
                Add
              </Button>
            </div>
          </div>

          {techstack.length > 0 && (
            <div className="border bg-gray-50 border-gray-300 px-3 py-2.5 rounded-lg flex flex-wrap items-center gap-2 ">
              {techstack.map((tech, index) => (
                <div
                  key={index}
                  onClick={() => handleRemoveTech(index)}
                  className="border border-gray-300 rounded-sm px-2 py-1 bg-white cursor-pointer"
                >
                  <p className="text-[11px]">{tech}</p>
                </div>
              ))}
            </div>
          )}
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
