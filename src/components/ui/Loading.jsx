import { LoaderCircle } from "lucide-react";

export default function Loading() {
  <div className="min-h-screen md:min-h-dvh w-full flex items-center justify-center bg-white">
    <div className="flex flex-col text-center gap-4">
      {/* logo */}
      <div className="flex flex-1">
        <h1 className="font-bold text-lg md:text-xl">Portfolio.</h1>
      </div>

      <span className="text-gray-500">
        <LoaderCircle className="animate-spin size-5" />
      </span>
    </div>
  </div>;
}
