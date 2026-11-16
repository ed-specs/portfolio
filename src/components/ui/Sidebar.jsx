"use client";

import { useState } from "react";
import Link from "next/link";

import MenuOptions from "@/lib/menu";
import { DoorOpen } from "lucide-react";
import { SignOutAction } from "@/app/actions/auth";

export default function Sidebar() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    const result = await SignOutAction();

    if (!result.success) {
      alert(result.error);
      setIsLoading(false);
      return;
    }

    // Replaces current history entry and forces a clean reload
    window.location.replace("/admin");
  };
  return (
    <aside className="hidden lg:flex flex-col gap-6 max-h-dvh sticky top-0 left-0 w-64  px-5 xl:px-0 py-3 lg:py-5 border-e border-gray-300">
      {/* logo */}
      <div className="flex flex-1">
        <Link href="/admin/dashboard" className="font-bold text-lg md:text-xl">
          Portfolio
        </Link>
      </div>

      <MenuOptions />

      {/* sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoading}
        className="text-red-500 py-2 hover:px-2 cursor-pointer transition-all duration-300  flex items-center gap-4 disabled:bg-opacity/60 disabled:cursor-not-allowed"
      >
        <DoorOpen className="size-5" />
        Sign out
      </button>
    </aside>
  );
}
