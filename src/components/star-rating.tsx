"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}) {
  const cls = size === "sm" ? "size-4" : "size-7";
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className="disabled:cursor-default"
        >
          <Star
            className={cn(
              cls,
              n <= value ? "fill-primary text-primary" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
