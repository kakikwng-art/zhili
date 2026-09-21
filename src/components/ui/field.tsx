import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: string }) {
  return <label className="text-xs font-medium text-muted">{children}</label>;
}

export function TextField({ className, ref, ...props }: ComponentPropsWithRef<"input">) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg bg-paper px-3 text-base text-ink shadow-hairline",
        "placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ref, ...props }: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-20 w-full resize-none rounded-lg bg-paper px-3 py-2 text-base leading-normal text-ink shadow-hairline",
        "placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion",
        className,
      )}
      {...props}
    />
  );
}
