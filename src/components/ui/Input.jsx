import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Input({
  children,
  id,
  label = "",
  isLoading = false,
  isDisabled = false,
  placeholder = "",
  className = "",
  type = "text",
  ...props
}) {
  const pathname = usePathname();
  const isAuth = pathname === "/admin";

  const showForgotPassword = type === "password" && isAuth;

  return (
    <div className="flex flex-col gap-1.5">
      {showForgotPassword ? (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm text-gray-500">
            {label}
          </label>

          <Link
            href={isLoading ? "#" : "/forgot-password"}
            className={` text-sm hover:text-black/85 transition-colors duration-300 ${
              isLoading
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            Forgot password
          </Link>
        </div>
      ) : (
        <label htmlFor={id} className="text-sm text-gray-500">
          {label}
        </label>
      )}

      <input
        type={type}
        disabled={isDisabled || isLoading}
        placeholder={placeholder}
        {...props}
        className={`border border-gray-300 w-full rounded-lg px-3 py-2 md:text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80 readonly:disabled:opacity-80 ${className}`}
      />
    </div>
  );
}
