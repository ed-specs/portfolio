import Link from "next/link";
import MenuOptions from "@/lib/menu";
import { DoorOpen } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-6 max-h-dvh sticky top-0 left-0 w-60 px-5 xl:px-0 py-3 xl:py-5 border-e border-gray-300">
      {/* logo */}
      <div className="flex flex-1">
        <h1 className="font-bold text-xl">Portfolio.</h1>
      </div>

      <MenuOptions />

      {/* sign out */}
      <Link
        href="/admin"
        className="text-red-500 py-2 hover:px-2 cursor-pointer transition-all duration-300  flex items-center gap-4"
      >
        <DoorOpen className="size-5" />
        Sign out
      </Link>
    </aside>
  );
}
