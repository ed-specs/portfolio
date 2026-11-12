import { CircleCheck } from "lucide-react";

export default function SuccessBanner({ message }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg border-l-4 border-green-500 bg-green-100 text-green-500">
      <CircleCheck className="size-5 no-wrap" />
      {message}
    </div>
  );
}
