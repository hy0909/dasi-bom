import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <Badge variant="outline" className="h-5 px-1.5 text-[11px] font-semibold">
            필수
          </Badge>
        )}
      </Label>
      {children}
      {hint && <p className="text-xs text-body-mid">{hint}</p>}
    </div>
  );
}
