import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 우측 하단 원형 플로팅 버튼.
 * 하단 네비가 있는 화면에서는 네비 높이(68px)만큼 띄운다.
 */
export function Fab({
  className,
  aboveNav = false,
  ...props
}: ComponentProps<"button"> & { aboveNav?: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-5",
        aboveNav
          ? "bottom-[calc(84px+env(safe-area-inset-bottom))]"
          : "bottom-[calc(20px+env(safe-area-inset-bottom))]",
      )}
    >
      <div className="flex justify-end">
        <Button
          size="icon-lg"
          className={cn("pointer-events-auto size-14 rounded-full shadow-float", className)}
          {...props}
        />
      </div>
    </div>
  );
}
