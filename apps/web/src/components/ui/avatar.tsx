"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, alt, fallback, size = "md", className, ...props }: AvatarProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

  return (
    <div
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full", sizes[size], className)}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || fallback} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600">
          {fallback}
        </div>
      )}
    </div>
  );
}
