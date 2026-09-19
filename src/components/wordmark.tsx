import { cn } from "@/lib/utils";

/** 브랜드 워드마크 — 로고 전용 서체(Rock Salt)로 쓴 서비스 이름. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // Rock Salt 는 획이 크게 나오고 글자 사이가 붙는다 — 크기를 줄이고 자간을 조금 벌린다
        "font-logo text-[17px] leading-tight font-normal tracking-[0.01em] text-ink",
        className,
      )}
    >
      Story Album
    </span>
  );
}
