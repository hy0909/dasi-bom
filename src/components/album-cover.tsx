import type { CSSProperties } from "react";
import { coverColorOf, coverFabricTone, type Album } from "@/data/album";
import { coverVariant } from "@/lib/variant";
import { cn } from "@/lib/utils";

/**
 * 북클로스 하드커버 앨범 — 4:5 비율, 왼쪽 책등, 가운데 파인 사진 창.
 * 창 안의 사진은 원본 비율을 지키고, 커버 폭의 52%·높이의 46% 안에 들어간다.
 * 앞표지 뒤에 책등 옆면이 붙어 있어, 부모에 album-3d-hover 가 있으면 호버 때 살짝 돌아서며 옆면이 보인다.
 * 옆면 두께는 사진 장수를 따른다 — 사진이 많은 앨범이 실제로 더 두껍다.
 */
/** 사진 장수 → 책등 두께(커버 폭 대비 %). 0장은 가장 얇은 빈 껍데기, 100장에서 가장 두껍고 그 위로는 더 두꺼워지지 않는다. */
export const MAX_PHOTOS = 100;
const DEPTH_MIN = 6;
const DEPTH_MAX = 44;
export function albumDepth(photoCount: number) {
  const fill = Math.min(1, Math.max(0, photoCount) / MAX_PHOTOS);
  return Math.round((DEPTH_MIN + (DEPTH_MAX - DEPTH_MIN) * fill) * 10) / 10;
}

export function AlbumCover({
  album,
  photoCount = 0,
  className,
  style,
}: {
  album: Pick<Album, "id" | "coverColor"> & { cover: string };
  /** 앨범에 든 사진 장수 — 책등 두께가 이걸 따른다 */
  photoCount?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const tone = coverFabricTone(coverColorOf(album).hex, coverVariant);
  return (
    <div
      className={cn("album-book relative aspect-[4/5] w-full select-none", className)}
      style={{ ...style, "--cover": tone, "--depth": `${albumDepth(photoCount)}cqw` } as CSSProperties}
      aria-hidden
    >
      <div className="album-book-body">
        <div className="album-cover">
          <span className="album-cover-spine" />
          <span className="album-cover-well">
            <span className="album-cover-window">
              <img src={album.cover} alt="" draggable={false} />
            </span>
          </span>
        </div>
        <span className="album-book-side" />
      </div>
    </div>
  );
}
