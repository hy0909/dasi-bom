import { useEffect, useState, type ReactNode } from "react";
import { Info, X } from "lucide-react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * 설명이 필요한 자리에 두는 작은 ⓘ — 누르면 한 줄 말풍선이 뜨고, 닫기나 바깥을 누르면 닫힌다.
 * 말풍선은 폰 캔버스 안에 머문다 — 넓은 화면 미리보기에서는 100vw 가 폰 폭을 넘기 때문이다.
 */
export function InfoHint({
  label,
  children,
  side = "bottom",
  align = "start",
  className,
}: {
  /** 스크린리더가 읽을 이름 — "기간 안내"처럼 무엇에 대한 설명인지 */
  label: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const [canvas, setCanvas] = useState<Element | null>(null);
  useEffect(() => setCanvas(document.querySelector("[data-screen]")), []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-body-mid outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40",
            className,
          )}
        >
          <Info className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        collisionBoundary={canvas}
        collisionPadding={16}
        className="w-auto max-w-[calc(100vw-40px)] flex-row items-start gap-1 py-1.5 pr-1 pl-3"
        style={canvas ? { maxWidth: canvas.clientWidth - 32 } : undefined}
      >
        <span className="text-xs leading-snug">{children}</span>
        <PopoverClose asChild>
          <button
            type="button"
            aria-label="닫기"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-body-mid outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <X className="size-3.5" />
          </button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
