import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** 앱 바깥 그라운드 — canvas-soft. 폰 캔버스가 canvas 로 떠 보이도록 표면 대비만 사용 (Level 2). */
export function AppShell({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      className={cn("flex min-h-dvh justify-center bg-canvas-soft", className)}
      {...props}
    />
  );
}

export function PhoneCanvas({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative w-full max-w-[430px] min-h-dvh bg-canvas px-5 pt-[max(16px,env(safe-area-inset-top))] shadow-[0_0_0_1px_rgb(32_21_21/0.05),0_0_80px_rgb(32_21_21/0.07)]",
        className,
      )}
      {...props}
    />
  );
}
