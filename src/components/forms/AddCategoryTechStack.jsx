"use client";

import { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import {
  createCategoryAction,
  createTechStacksAction,
} from "@/app/actions/techStack";

const PRESET_CATEGORIES = ["Frontend", "Backend", "Database", "Tools & DevOps"];

export default function AddCategoryTechStack({
  onSuccess,
  onCancel,
  successMessage,
}) {
  const [category, setCategory] = useState("");
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

    const exists = items.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!exists) {
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

    if (!category.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create the parent category
      const catResult = await createCategoryAction({
        name: category.trim(),
      });

      if (!catResult.success) {
        setErrorMsg(catResult.error);
        return;
      }

      let createdTechStacks = [];

      // Step 2: If the user also added tech chips, bulk-insert them under the new category
      if (finalItems.length > 0) {
        const techResult = await createTechStacksAction({
          category_id: catResult.data.id,
          items: finalItems,
        });

        if (!techResult.success) {
          // Category was created, attach empty tech_stacks and notify
          onSuccess({ ...catResult.data, tech_stacks: [] });
          setErrorMsg(techResult.error);
          return;
        }

        createdTechStacks = techResult.data;
      }

      // Pass full category object (including nested tech_stacks) up to TechStackClient
      onSuccess({
        ...catResult.data,
        tech_stacks: createdTechStacks,
      });
      successMessage("Category added successfully.");
    } catch {
      setErrorMsg("Something went wrong while saving your category.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold">
          Add Tech Stack Category
        </h1>
        <span className="text-gray-500 text-sm">
          Create a category and optionally add initial technologies
        </span>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Input
            id="category"
            list="category-presets"
            label="Category"
            type="text"
            placeholder="Select or type a category (e.g., Frontend)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            required
          />
          <datalist id="category-presets">
            {PRESET_CATEGORIES.map((preset) => (
              <option key={preset} value={preset} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="items" className="text-sm text-gray-500">
              Tech Stack (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="items"
                id="items"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                disabled={isLoading}
                placeholder="e.g. Next.js"
                className="border w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80"
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
        <Button disabled={isLoading} type="submit" variant="primary">
          Save Category
        </Button>
      </div>
    </form>
  );
}
