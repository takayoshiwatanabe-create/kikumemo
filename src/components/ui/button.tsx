"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // When `asChild` is true, we render `React.Fragment` and expect `children` to be a single React element.
    // This element will then receive the merged class names and ref.
    // If `asChild` is false, we render a `button` element.
    const Comp = asChild ? React.Fragment : "button";
    return (
      <Comp
        className={asChild ? cn(buttonVariants({ variant, size, className })) : undefined} // Apply className to children if asChild, else to button
        ref={ref}
        {...props}
      >
        {asChild ? React.Children.only(props.children) : props.children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

// Helper utility for class merging (cn) - assuming it exists in '@/lib/utils'
// If not, you'd need to create it, e.g.:
// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }
// And install 'clsx' and 'tailwind-merge'
