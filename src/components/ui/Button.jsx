import { LoaderCircle } from "lucide-react";

const VARIANT = {
  primary:
    "bg-black/90 hover:bg-black/85 text-white border border-black/90 hover:border-black/85",
  secondary: "bg-white border border-gray-300 hover:bg-gray-100",
};

export default function Button({
  children,
  variant = "primary",
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
      className={`${VARIANT[variant]} transition-colors duration-300 px-3 py-2 md:text-sm rounded-lg flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
    >
      {isLoading ? <LoaderCircle className="animate-spin size-5" /> : children}
    </button>
  );
}
