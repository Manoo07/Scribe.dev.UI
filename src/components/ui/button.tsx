import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils"; // Ensure this utility exists

// Variant system using cva with professional color palette
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Primary - Professional blue for main actions
        primary:
          "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-600 shadow-sm hover:shadow-md",

        // Secondary - Muted slate for secondary actions
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 border border-slate-200",

        // Success - Professional green for positive actions
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow-md",

        // Warning - Professional amber for caution actions
        warning:
          "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm hover:shadow-md",

        // Danger - Professional red for destructive actions
        danger:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",

        // Outline - Clean bordered style
        outline:
          "border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 bg-white",

        // Ghost - Subtle hover effect
        ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",

        // Link - Text button style
        link: "text-slate-600 hover:text-slate-800 underline-offset-4 hover:underline focus:ring-slate-500",

        // Subtle - Very light background
        subtle:
          "bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-slate-500 border border-slate-200",
      },
      size: {
        xs: "text-xs px-2 py-1",
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
        xl: "text-xl px-8 py-4",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

// Button props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: React.ReactNode;
}

// Component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export default Button;

export { buttonVariants };
