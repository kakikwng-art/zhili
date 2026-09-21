import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-[transform,background-color,color,opacity] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        solid: "bg-vermilion text-vermilion-fg",
        ghost: "bg-transparent text-ink hover:bg-paper-deep",
        quiet: "bg-paper-deep text-ink",
        outline: "bg-sheet text-ink shadow-hairline",
      },
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3.5 text-sm",
        lg: "h-11 px-4 text-base",
        icon: "size-11",
        dock: "h-11 min-w-16 flex-col gap-0 px-3 text-xs font-medium",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
