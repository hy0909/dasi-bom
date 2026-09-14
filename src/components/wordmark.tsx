import { cn } from "@/lib/utils";

/** 브랜드 워드마크 — 쉼표 하나에만 오렌지를 허용한다. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-[22px] leading-none font-semibold tracking-[-0.03em] text-ink",
        className,
      )}
    >
      다시<span className="text-primary">,</span> 봄
    </span>
  );
}
