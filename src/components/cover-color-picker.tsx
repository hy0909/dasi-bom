import { COVER_COLORS, type CoverColorId } from "@/data/album";
import { cn } from "@/lib/utils";

/** 앨범 커버 색 고르기 — 11가지 원형 스와치. */
export function CoverColorPicker({
  value,
  onChange,
}: {
  value: CoverColorId;
  onChange: (id: CoverColorId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="앨범 커버 색" className="flex flex-wrap gap-2.5">
      {COVER_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          aria-label={c.label}
          onClick={() => onChange(c.id)}
          className={cn(
            "size-8 rounded-full outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/40",
            value === c.id ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-canvas" : "hover:scale-105",
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}
