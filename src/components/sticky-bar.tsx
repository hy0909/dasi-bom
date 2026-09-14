import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * 화면 하단에 고정되는 액션 바.
 * 폰 캔버스와 같은 폭·좌우 여백을 쓰고, 위쪽 헤어라인으로 본문과 분리한다.
 * 안에 submit 버튼을 넣어도 DOM 상 form 자손이면 제출은 그대로 동작한다.
 */
export function StickyBar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-canvas/95 px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
