import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  FolderOpenDot,
  BriefcaseBusiness,
  Target,
  BookUser,
  LayoutDashboard,
} from "lucide-react";

const MENU_OPTIONS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "About Me", href: "/admin/about-me", icon: BookUser },
  { name: "Projects", href: "/admin/projects", icon: FolderOpenDot },
  { name: "Experience", href: "/admin/experience", icon: BriefcaseBusiness },
  { name: "Skills", href: "/admin/skills", icon: Target },
];

export default function MenuOptions() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4  h-full">
      {/* main menu */}
      <div className="flex flex-col">
        <span className="px- text-gray-500 uppercase text-xs mb-1 font-semibold">
          main menu
        </span>
        {MENU_OPTIONS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4  py-2 cursor-pointer transition-all duration-300  ${isActive ? "text-black/90 hover:text-black/85 font-bold hover:px-2" : "bg-white text-gray-500 hover:px-2 hover:text-black/90"}`}
            >
              <Icon className="size-5" />
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
