import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none";

    const variants = {
      primary:
        "bg-gradient-to-r from-brand-600 via-brand-violet to-brand-accent text-white shadow-glow hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:brightness-110",
      secondary:
        "bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 backdrop-blur-sm",
      outline:
        "border border-white/20 hover:border-brand-500 text-slate-200 hover:text-white bg-transparent hover:bg-brand-500/10",
      ghost:
        "text-slate-300 hover:text-white hover:bg-white/5",
      danger:
        "bg-red-600/90 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]",
      glass:
        "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 backdrop-blur-md shadow-glass",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-7 text-base gap-2.5",
      icon: "h-11 w-11 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
