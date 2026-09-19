import { cn } from "@/lib/utils";

/** 브랜드 워드마크 — 로고 전용 서체(카페24 프로슬림)로 쓴 서비스 이름. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // 획이 가늘고 길쭉한 한글 서체다 — 굵게 세우고 자간은 살짝 좁혀 한 덩어리로 읽히게 한다
        "font-logo text-[22px] leading-none font-bold tracking-[-0.01em] text-ink",
        className,
      )}
    >
      그때우리
    </span>
  );
}
