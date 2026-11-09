export default function Input({
  children,
  label = "",
  isLoading = false,
  isDisabled = false,
  placeholder = "",
  className = "",
  type = "text",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={label} className="text-sm text-gray-500">
        {label}
      </label>
      <input
        type={type}
        disabled={isDisabled || isLoading}
        placeholder={placeholder}
        {...props}
        className={`border border-gray-300 w-full rounded-lg px-3 py-2 md:text-sm focus:outline-none focus:border-black/90 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
      />
    </div>
  );
}
