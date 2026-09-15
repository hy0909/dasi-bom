import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 2024년 7월 10일 수 */
export function formatPickedDate(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}`;
}

/**
 * 날짜 입력.
 * 네이티브 date 입력은 표시 형식을 바꿀 수 없어서, 투명한 입력을 위에 덮고
 * 그 아래에 한글 형식을 직접 그린다. 달력은 네이티브 그대로 열린다.
 */
export function DateField({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div
        aria-hidden
        className="flex h-12 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/30"
      >
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-body-mid")}>
          {formatPickedDate(value) || "날짜 선택"}
        </span>
        <Calendar className="size-4 shrink-0 text-body-mid" />
      </div>
    </div>
  );
}
