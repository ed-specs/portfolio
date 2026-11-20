// src/components/tech-stacks/TechStackClient.jsx
"use client";

import { useState, useEffect } from "react";

import HeaderSection from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Button from "@/components/ui/Button";
import SuccessBanner from "../ui/SuccessBanner";
import AddCategoryTechStack from "../forms/AddCategoryTechStack";
import AddTechStackForm from "../forms/AddTechStackForm";
import EditCategoryTechStack from "../forms/EditCategoryTechStack";

export default function TechStackClient({ initialTechStack }) {
  // Holds categories array: [{ id, name, tech_stacks: [{ id, name }, ...] }]
  const [techStack, setTechStack] = useState(initialTechStack || []);
  const [successMsg, setSuccessMsg] = useState("");

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTechStack, setShowAddTechStack] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!successMsg) return;

    const timer = setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // 1. After creating a new category
  const handleAddCategory = (newCategory) => {
    setTechStack((prev) => [
      { ...newCategory, tech_stacks: newCategory.tech_stacks || [] },
      ...prev,
    ]);
    setShowAddCategory(false);
  };

  // 2. After bulk-adding tech stack items to a selected category
  const handleAddTechStacks = (categoryId, newItems) => {
    setTechStack((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, tech_stacks: [...(cat.tech_stacks || []), ...newItems] }
          : cat,
      ),
    );
    setShowAddTechStack(false);
  };

  // 3. After renaming a category or editing/deleting its tech chips
  const handleUpdateCategory = (updatedCategory) => {
    setTechStack((prev) =>
      prev.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat,
      ),
    );
    setSelectedCategory(updatedCategory);
  };

  // 4. After deleting an entire category
  const handleDeleteCategory = (deletedCategoryId) => {
    setTechStack((prev) => prev.filter((cat) => cat.id !== deletedCategoryId));
    setSelectedCategory(null);
  };

  return (
    <div className="lg:relative min-h-svh md:min-h-screen w-full flex flex-col lg:flex-row">
      <HeaderSection />
      <Sidebar />

      <div className="flex flex-1 flex-col gap-6 p-5">
        {showAddCategory ? (
          <AddCategoryTechStack
            onSuccess={handleAddCategory}
            onCancel={() => setShowAddCategory(false)}
            successMessage={setSuccessMsg}
          />
        ) : showAddTechStack ? (
          <AddTechStackForm
            categories={techStack}
            onSuccess={handleAddTechStacks}
            onCancel={() => setShowAddTechStack(false)}
            successMessage={setSuccessMsg}
          />
        ) : selectedCategory ? (
          <EditCategoryTechStack
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onUpdateSuccess={handleUpdateCategory}
            onDeleteSuccess={handleDeleteCategory}
            successMessage={setSuccessMsg}
          />
        ) : (
          <>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold">Tech Stacks</h1>
              <span className="text-gray-500 text-sm">
                Manage your tech stacks and categories
              </span>
            </div>

            {successMsg && <SuccessBanner message={successMsg} />}

            {techStack.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-6 py-12 px-6">
                <div className="flex flex-col items-center justify-center gap-1">
                  <h1 className="text-lg md:text-xl font-bold">
                    No Tech Stack Available
                  </h1>
                  <span className="text-gray-500 text-sm text-center">
                    Create a category first before adding your tech stacks
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowAddCategory(true)}
                  >
                    Add Category
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setShowAddTechStack(true)}
                  >
                    Add Tech Stack
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddCategory(true)}
                  >
                    Add Category
                  </Button>
                </div>

                {/* Category Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {techStack.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className="rounded-lg border border-gray-300 p-5 flex flex-col gap-3 hover:border-black/90 transition-colors duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold">{category.name}</h2>
                        <span className="text-xs text-gray-400">
                          {category.tech_stacks?.length || 0}{" "}
                          {category.tech_stacks?.length === 1
                            ? "item"
                            : "items"}
                        </span>
                      </div>

                      {category.tech_stacks?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {category.tech_stacks.map((tech) => (
                            <div
                              key={tech.id}
                              className="border border-gray-300 rounded-md px-2.5 py-1 bg-white"
                            >
                              <p className="text-[11px]">{tech.name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          No technologies added under this category yet
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
