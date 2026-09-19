import { cn } from "@/lib/utils";

/** 브랜드 워드마크 — 로고 전용 서체(Pathway Gothic One)로 쓴 서비스 이름. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // Pathway Gothic One 은 폭이 좁고 키가 크다 — 크기를 조금 키우고 자간을 넉넉히 벌린다
        "font-logo text-[20px] leading-tight font-normal tracking-[0.06em] text-ink",
        className,
      )}
    >
      Story Album
    </span>
  );
}
