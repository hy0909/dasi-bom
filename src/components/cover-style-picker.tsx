import { AlbumCover } from "@/components/album-cover";
import {
  COVER_FRAMES,
  COVER_SHAPES,
  type CoverColorId,
  type CoverFrameId,
  type CoverShapeId,
} from "@/data/album";
import { cn } from "@/lib/utils";

const option =
  "flex flex-col items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40";
const picked = "border-ink bg-muted font-semibold text-ink";
const idle = "border-border text-body hover:bg-muted";
/** 사진 자리 미리보기가 들어갈 칸 — 판형이 어떻든 이 안에 딱 맞게 줄인다 */
const PREVIEW_W = 76;
const PREVIEW_H = 80;

/** 앨범 비율 고르기 — 고른 비율 그대로 생긴 작은 표지들. */
export function CoverShapePicker({
  value,
  onChange,
}: {
  value: CoverShapeId;
  onChange: (id: CoverShapeId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="앨범 비율" className="flex flex-wrap gap-2">
      {COVER_SHAPES.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={value === s.id}
          onClick={() => onChange(s.id)}
          className={cn(option, "w-[76px]", value === s.id ? picked : idle)}
        >
          {/* 비율을 말로 적지 않고 모양으로 보여준다 */}
          <span className="flex h-11 items-center justify-center">
            <span
              className={cn(
                "block w-7 rounded-[2px]",
                s.cls,
                value === s.id ? "bg-ink" : "bg-mute/60",
              )}
            />
          </span>
          <span>{s.label}</span>
          <span className="text-[10px] tabular-nums opacity-60">{s.ratio}</span>
        </button>
      ))}
    </div>
  );
}

/** 사진이 앉는 자리 고르기 — 고를 값 그대로 만든 작은 표지를 보여준다. */
export function CoverFramePicker({
  value,
  onChange,
  shape,
  color,
  cover,
}: {
  value: CoverFrameId;
  onChange: (id: CoverFrameId) => void;
  /** 미리보기를 지금 고른 판형으로 보여주기 위해 */
  shape: CoverShapeId;
  color: CoverColorId;
  cover: string;
}) {
  const aspect = COVER_SHAPES.find((s) => s.id === shape)?.aspect ?? 1.25;
  const width = Math.min(PREVIEW_W, PREVIEW_H / aspect);
  return (
    <div role="radiogroup" aria-label="앨범 디자인" className="flex flex-wrap gap-2">
      {COVER_FRAMES.map((f) => (
        <button
          key={f.id}
          type="button"
          role="radio"
          aria-checked={value === f.id}
          title={f.hint}
          onClick={() => onChange(f.id)}
          className={cn(option, "w-[96px] px-2", value === f.id ? picked : idle)}
        >
          <span className="flex h-20 w-full items-center justify-center">
            {/* 가로·세로를 직접 준다 — 가로로 늘어선 칸 안에서는 비율만으로 폭이 정해지지 않는다 */}
            <AlbumCover
              album={{ id: "preview", coverColor: color, coverShape: shape, coverFrame: f.id, cover }}
              className="shrink-0"
              style={{ width, height: width * aspect }}
            />
          </span>
          <span className="text-center leading-tight">{f.label}</span>
        </button>
      ))}
    </div>
  );
}
