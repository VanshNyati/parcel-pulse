export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm transition shadow-sm";
  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 focus:ring-2 focus:ring-brand-300",
    outline: "border border-gray-300 text-gray-800 bg-white hover:bg-gray-50",
    ghost: "text-brand-700 hover:bg-brand-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300",
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
