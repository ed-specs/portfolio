import { CircleX } from "lucide-react";

export default function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 md:py-2 text-sm rounded-lg border-l-4 border-red-500 bg-red-200 text-red-500">
      <CircleX className="size-5 no-wrap" />
      {message}
    </div>
  );
}
