import { useEffect, useState, type CSSProperties } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 2024년 7월 10일 수 */
export function formatPickedDate(value: string) {
  if (!value) return "";
  const d = parseValue(value);
  if (!d) return "";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}`;
}

/** yyyy-mm-dd → Date. 시간대에 밀리지 않도록 로컬 자정으로 만든다. */
function parseValue(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Date → yyyy-mm-dd */
function toValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * 날짜 입력.
 * 누르면 달력 모달이 열린다. 달력은 기기 너비에 맞춰 칸이 커지고,
 * 좁은 화면에서도 한 줄에 7칸이 그대로 들어간다.
 */
export function DateField({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string;
  /** 모달 제목에 쓰는 이름 — ‘시작일’처럼 */
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  // 모달을 다시 열면 고른 달부터 보여준다.
  const [month, setMonth] = useState(selected ?? new Date());
  useEffect(() => {
    if (open) setMonth(selected ?? new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  return (
    <div className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm text-foreground transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <span className={cn("min-w-0 flex-1 truncate", !value && "text-body-mid")}>
          {formatPickedDate(value) || "날짜 선택"}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-body-mid" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 기기 너비를 꽉 채우되 양옆 여백만 남긴다 */}
        <DialogContent className="w-[calc(100vw-32px)] max-w-[420px] gap-4 rounded-xl bg-canvas p-5">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="font-heading text-display-sm font-bold">{label}</DialogTitle>
            <DialogDescription className="text-sm text-body">
              {formatPickedDate(value) || "날짜를 골라주세요."}
            </DialogDescription>
          </DialogHeader>

          <Calendar
            mode="single"
            locale={ko}
            captionLayout="dropdown"
            startMonth={new Date(1950, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(next) => {
              if (!next) return;
              onChange(toValue(next));
              setOpen(false);
            }}
            // 칸 크기를 화면 너비에서 끌어온다 — 좁은 기기에서 줄이 접히지 않는다.
            style={
              { "--cell-size": "min(3rem, calc((100vw - 5.5rem) / 7))" } as CSSProperties
            }
            classNames={{ root: "w-full" }}
            className="w-full bg-transparent p-0"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const today = new Date();
                onChange(toValue(today));
                setOpen(false);
              }}
            >
              오늘
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
