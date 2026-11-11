"use client";

import { useState } from "react";
import MenuOptions from "@/lib/menu";

import Link from "next/link";
import { X, DoorOpen, Menu } from "lucide-react";

export default function HeaderSection() {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 left-0 flex items-center justify-between px-5 py-2 md:py-3 border-b border-gray-300 bg-white">
      {/* logo */}
      <div className="flex flex-1">
        <h1 className="font-bold text-lg md:text-xl">Portfolio.</h1>
      </div>
      {/* menu button */}
      <div className="flex items-center justify-center"></div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setToggleSidebar((prev) => !prev)}
          className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-300"
        >
          <Menu className="size-5" />
        </button>

        {/* toggler sidebar */}
        <div
          onClick={() => setToggleSidebar((prev) => !prev)}
          className={`fixed inset-0 bg-black/10 transition-opacity duration-300 ${
            toggleSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`h-screen w-80 bg-white flex flex-col gap-6 relative p-5 transition-transform ease-in-out ${
              toggleSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              type="button"
              onClick={() => setToggleSidebar((prev) => !prev)}
              className="absolute top-2.5 right-2.5 p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-300"
            >
              <X className="size-5" />
            </button>

            {/* menu options */}
            <MenuOptions />

            {/* sign out */}
            <Link
              href="/admin"
              className="text-red-500 py-2 hover:px-2 cursor-pointer transition-all duration-300  flex items-center gap-4"
            >
              <DoorOpen className="size-5" />
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
