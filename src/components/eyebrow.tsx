import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** eyebrow-uppercase — 14px / 500 / +1px 트래킹. 섹션 헤드라인 위 작은 라벨. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-eyebrow font-medium uppercase tracking-[0.08em] text-body",
        className,
      )}
      {...props}
    />
  );
}
