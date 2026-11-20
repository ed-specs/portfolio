"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import { createTechStacksAction } from "@/app/actions/techStack";

export default function AddTechStackForm({
  categories,
  onSuccess,
  onCancel,
  successMessage,
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories?.[0]?.id || "",
  );
  const [techInput, setTechInput] = useState("");
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => {
      setErrorMsg("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleAddTech = (e) => {
    if (e) e.preventDefault();
    const trimmed = techInput.trim();
    if (!trimmed) return;

    // Prevent duplicates in the current chip queue
    const existsInQueue = items.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );

    // Also warn if it already exists in the selected category
    const currentCat = categories.find((c) => c.id === selectedCategoryId);
    const existsInDb = currentCat?.tech_stacks?.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existsInDb) {
      setErrorMsg(`"${trimmed}" already exists in ${currentCat.name}.`);
      return;
    }

    if (!existsInQueue) {
      setItems((prev) => [...prev, trimmed]);
    }
    setTechInput("");
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleRemoveTech = (indexToRemove) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const finalItems = [...items];
    const remaining = techInput.trim();
    if (remaining) {
      const exists = finalItems.some(
        (item) => item.toLowerCase() === remaining.toLowerCase(),
      );
      if (!exists) finalItems.push(remaining);
    }

    if (!selectedCategoryId || finalItems.length === 0) {
      setErrorMsg("Please select a category and add at least one technology.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createTechStacksAction({
        category_id: selectedCategoryId,
        items: finalItems,
      });

      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      onSuccess(selectedCategoryId, result.data);
      successMessage("Tech stack added successfully.");
    } catch {
      setErrorMsg("Something went wrong while saving your tech stack.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold">Add Tech Stack</h1>
        <span className="text-gray-500 text-sm">
          Select a category and add technologies to it
        </span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        {/* Saved Category Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categorySelect" className="text-sm text-gray-500">
            Select Category
          </label>
          <select
            id="categorySelect"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={isLoading}
            required
            className="border w-full border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <option value="" disabled>
              Choose a category...
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-Chip Tech Stack Input */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="items" className="text-sm text-gray-500">
              Tech Stack
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="items"
                id="items"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                disabled={isLoading || !selectedCategoryId}
                placeholder="e.g. Next.js"
                className="border w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={isLoading || !selectedCategoryId}
                onClick={handleAddTech}
              >
                Add
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border bg-gray-50 border-gray-300 px-3 py-2.5 rounded-lg flex flex-wrap items-center gap-2">
              {items.map((tech, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleRemoveTech(index)}
                  title={`Remove ${tech}`}
                  className="inline-flex items-center gap-1.5 border border-gray-300 rounded-sm px-2 py-1 bg-white hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="text-[11px]">{tech}</span>
                </button>
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
        <Button
          disabled={isLoading || !selectedCategoryId}
          type="submit"
          variant="primary"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
