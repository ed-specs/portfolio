import { CircleX } from "lucide-react";

export default function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg border-l-4 border-red-500 bg-red-100 text-red-500">
      <CircleX className="size-4 no-wrap" />
      {message}
    </div>
  );
}
