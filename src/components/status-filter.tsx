import { useState } from "react";
import { photoStatus, type Photo, type PhotoStatus } from "@/data/photos";
import { cn } from "@/lib/utils";

export type RecordFilter = "전체" | PhotoStatus;
const FILTERS: RecordFilter[] = ["전체", "기록 전", "기록 완료"];

/** 기록 전 / 기록 완료로 나눠 보는 칩 — 상세의 사진·글 목록과 기록할 사진 화면이 같은 것을 쓴다. */
export function StatusFilter({
  value,
  onChange,
  counts,
}: {
  value: RecordFilter;
  onChange: (next: RecordFilter) => void;
  counts: Record<RecordFilter, number>;
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="상태로 보기">
      {FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          role="radio"
          aria-checked={item === value}
          onClick={() => onChange(item)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            item === value
              ? "border-ink bg-ink text-canvas"
              : "border-border text-body hover:bg-muted",
          )}
        >
          {item} {counts[item]}
        </button>
      ))}
    </div>
  );
}

/** 칩이 고른 상태로 사진을 걸러 준다. 상태는 사진에 남은 기록에서 끌어낸다. */
export function useStatusFilter(photos: Photo[], initial: RecordFilter = "전체") {
  const [status, setStatus] = useState<RecordFilter>(initial);
  const counts = {
    전체: photos.length,
    "기록 전": photos.filter((p) => photoStatus(p) === "기록 전").length,
    "기록 완료": photos.filter((p) => photoStatus(p) === "기록 완료").length,
  };
  const list = status === "전체" ? photos : photos.filter((p) => photoStatus(p) === status);
  return { status, setStatus, counts, list };
}
