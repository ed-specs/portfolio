import { LoaderCircle } from "lucide-react";

export default function Button({
  children,
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      {...props}
      className={`bg-black/90 hover:bg-black/85 transition-colors duration-300 text-white px-3 py-2 md:text-sm rounded-lg flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
    >
      {isLoading ? <LoaderCircle className="animate-spin size-5" /> : children}
    </button>
  );
}
