import type { ReactNode } from "react";
import { Eyebrow } from "@/components/eyebrow";
import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-6 flex flex-col gap-3", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="font-heading text-display-lg font-bold">{title}</h1>
      {description && (
        <p className="text-base leading-relaxed text-body">{description}</p>
      )}
    </div>
  );
}
