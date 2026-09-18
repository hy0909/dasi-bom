import { COVER_COLORS, coverFabricTone, type CoverColorId } from "@/data/album";
import { coverVariant } from "@/lib/variant";
import { cn } from "@/lib/utils";

/**
 * 앨범 커버 색 고르기 — 11가지 원형 스와치. 스와치는 실제 커버 천의 색으로 보인다.
 * 어두운 바탕에 놓을 때는 tone="dark" — 고른 색을 흰 테로 두른다.
 */
export function CoverColorPicker({
  value,
  onChange,
  tone = "light",
  className,
}: {
  value: CoverColorId;
  onChange: (id: CoverColorId) => void;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="앨범 커버 색"
      className={cn("flex flex-wrap gap-2.5", className)}
    >
      {COVER_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          aria-label={c.label}
          onClick={() => onChange(c.id)}
          className={cn(
            // 누르는 자리는 동그라미보다 넓다 — 보이지 않는 테두리로 손끝이 닿을 자리를 넓힌다
            "relative size-[26px] rounded-full shadow-[inset_0_0_0_1px_rgb(32_21_21/0.14)] outline-none transition-transform",
            "before:absolute before:-inset-1.5 before:rounded-full before:content-['']",
            "focus-visible:ring-3 focus-visible:ring-ring/40",
            value === c.id
              ? tone === "dark"
                ? "scale-110 ring-2 ring-canvas ring-offset-2 ring-offset-ink"
                : "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-canvas"
              : "hover:scale-105",
          )}
          style={{ backgroundColor: coverFabricTone(c.hex, coverVariant) }}
        />
      ))}
    </div>
  );
}
