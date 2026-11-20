"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorBanner from "../ui/ErrorBanner";
import SuccessBanner from "../ui/SuccessBanner";
import {
  updateCategoryAction,
  deleteCategoryAction,
  createTechStacksAction,
  deleteTechStackAction,
} from "@/app/actions/techStack";

export default function EditCategoryTechStack({
  category,
  onBack,
  onUpdateSuccess,
  onDeleteSuccess,
  successMessage,
}) {
  const [categoryName, setCategoryName] = useState(category?.name || "");
  const [existingItems, setExistingItems] = useState(
    category?.tech_stacks || [],
  );
  const [newItems, setNewItems] = useState([]);
  const [techInput, setTechInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [deletingTechId, setDeletingTechId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(""), 4000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  useEffect(() => {
    if (!localSuccess) return;
    const timer = setTimeout(() => setLocalSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [localSuccess]);

  // Queue a new chip to be added when Save Changes is clicked
  const handleAddTech = (e) => {
    if (e) e.preventDefault();
    const trimmed = techInput.trim();
    if (!trimmed) return;

    const existsInExisting = existingItems.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    const existsInNew = newItems.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existsInExisting || existsInNew) {
      setErrorMsg(`"${trimmed}" is already in this category.`);
      return;
    }

    setNewItems((prev) => [...prev, trimmed]);
    setTechInput("");
  };

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  // Remove a newly queued chip (not yet saved to DB)
  const handleRemoveNewChip = (indexToRemove) => {
    setNewItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Delete an existing chip directly from DB
  const handleDeleteExistingChip = async (tech) => {
    setDeletingTechId(tech.id);
    setErrorMsg("");

    try {
      const result = await deleteTechStackAction(tech.id);
      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      const updatedList = existingItems.filter((item) => item.id !== tech.id);
      setExistingItems(updatedList);
      onUpdateSuccess({
        ...category,
        name: categoryName.trim() || category.name,
        tech_stacks: updatedList,
      });
      setLocalSuccess(`Removed ${tech.name}.`);
    } catch {
      setErrorMsg("Failed to remove technology.");
    } finally {
      setDeletingTechId(null);
    }
  };

  // Save Category Rename + Any Newly Queued Tech Chips
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!categoryName.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    const finalNewItems = [...newItems];
    const remaining = techInput.trim();
    if (remaining) {
      const existsInExisting = existingItems.some(
        (item) => item.name.toLowerCase() === remaining.toLowerCase(),
      );
      const existsInNew = finalNewItems.some(
        (item) => item.toLowerCase() === remaining.toLowerCase(),
      );
      if (!existsInExisting && !existsInNew) {
        finalNewItems.push(remaining);
      }
    }

    setIsLoading(true);

    try {
      let updatedCategory = {
        ...category,
        name: categoryName.trim(),
        tech_stacks: existingItems,
      };

      // 1. Update category name if changed
      if (categoryName.trim() !== category.name) {
        const catRes = await updateCategoryAction(category.id, {
          name: categoryName.trim(),
        });

        if (!catRes.success) {
          setErrorMsg(catRes.error);
          return;
        }
        updatedCategory = {
          ...catRes.data,
          tech_stacks: existingItems,
        };
      }

      // 2. Bulk-insert any newly added tech chips
      if (finalNewItems.length > 0) {
        const techRes = await createTechStacksAction({
          category_id: category.id,
          items: finalNewItems,
        });

        if (!techRes.success) {
          setErrorMsg(techRes.error);
          return;
        }

        const mergedStacks = [...existingItems, ...techRes.data];
        setExistingItems(mergedStacks);
        updatedCategory = {
          ...updatedCategory,
          tech_stacks: mergedStacks,
        };
      }

      setNewItems([]);
      setTechInput("");
      onUpdateSuccess(updatedCategory);
      successMessage("Category updated successfully.");
      onBack();
    } catch {
      setErrorMsg("Something went wrong while updating the category.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Entire Category
  const handleDeleteCategory = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}" and all technologies inside it? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeletingCategory(true);
    setErrorMsg("");

    try {
      const result = await deleteCategoryAction(category.id);
      if (!result.success) {
        setErrorMsg(result.error);
        setIsDeletingCategory(false);
        return;
      }

      successMessage("Category deleted successfully.");
      onDeleteSuccess(category.id);
    } catch {
      setErrorMsg("Failed to delete category.");
      setIsDeletingCategory(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading || isDeletingCategory}
          className="flex items-center gap-2 text-gray-500 hover:text-black/90 transition-colors duration-300 cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft className="size-5" />
          <span className="text-sm">Back to Tech Stacks</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold">
            Edit Tech Stack Category
          </h1>
          <span className="text-gray-500 text-sm">
            Rename category, add new technologies, or remove existing ones
          </span>
        </div>

        {errorMsg && <ErrorBanner message={errorMsg} />}
        {localSuccess && <SuccessBanner message={localSuccess} />}

        <div className="flex flex-col gap-4">
          <Input
            id="categoryName"
            label="Category Name"
            type="text"
            placeholder="e.g., Frontend"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            disabled={isLoading || isDeletingCategory}
            required
          />

          {/* Existing Saved Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-500">
              Saved Technologies ({existingItems.length})
            </span>
            {existingItems.length > 0 ? (
              <div className="border bg-gray-50 border-gray-300 px-3 py-2.5 rounded-lg flex flex-wrap items-center gap-2">
                {existingItems.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    disabled={deletingTechId === tech.id || isLoading}
                    onClick={() => handleDeleteExistingChip(tech)}
                    title={`Remove ${tech.name}`}
                    className="inline-flex items-center gap-1.5 border border-gray-300 rounded-sm px-2 py-1 bg-white hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="text-[11px]">{tech.name}</span>
                    <span className="text-[11px] font-bold leading-none">
                      ×
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No saved technologies in this category yet.
              </p>
            )}
          </div>

          {/* Add More Technologies to This Category */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="addMoreItems" className="text-sm text-gray-500">
                Add More Technologies
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="addMoreItems"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  disabled={isLoading || isDeletingCategory}
                  placeholder="e.g. Tailwind CSS"
                  className="border w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoading || isDeletingCategory}
                  onClick={handleAddTech}
                >
                  Add
                </Button>
              </div>
            </div>

            {newItems.length > 0 && (
              <div className="border bg-blue-50/40 border-blue-200 px-3 py-2.5 rounded-lg flex flex-wrap items-center gap-2">
                {newItems.map((tech, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRemoveNewChip(index)}
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
            disabled={isLoading || isDeletingCategory}
            type="button"
            variant="secondary"
            onClick={onBack}
          >
            Discard
          </Button>
          <Button
            disabled={isLoading || isDeletingCategory}
            type="submit"
            variant="primary"
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Delete Category Zone (Matching ProjectDetailsClient) */}
      <div className="flex flex-col gap-1 md:gap-4 items-center md:items-baseline justify-center mt-4 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="critical"
          onClick={handleDeleteCategory}
          disabled={isLoading || isDeletingCategory}
        >
          Delete Category
        </Button>

        <span className="text-xs text-center md:text-start text-gray-500">
          Warning: Deleting this category is irreversible and will permanently
          remove all technologies inside it.
        </span>
      </div>
    </div>
  );
}
