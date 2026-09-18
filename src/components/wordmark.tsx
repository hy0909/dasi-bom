import { cn } from "@/lib/utils";

/** 브랜드 워드마크 — 로고 전용 서체(카페24 프로슬림)로 쓴 서비스 이름. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-logo text-[23px] leading-none font-bold tracking-[-0.01em] text-ink",
        className,
      )}
    >
      그날을 담다
    </span>
  );
}
