import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** ex-app-shell-row 계열 — 설정/알림 리스트 행. */
export function ListRow({
  leading,
  title,
  description,
  trailing,
  chevron,
  className,
  ...props
}: Omit<ComponentProps<"button">, "title"> & {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-1 py-3 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
      {...props}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[15px] font-semibold">{title}</b>
        {description && (
          <small className="block truncate text-[13px] text-body-mid">{description}</small>
        )}
      </span>
      {trailing}
      {chevron && <ChevronRight className="size-4 text-body-mid" />}
    </button>
  );
}
