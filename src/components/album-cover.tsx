import type { CSSProperties } from "react";
import { coverColorOf, coverFabricTone, type Album } from "@/data/album";
import { coverVariant } from "@/lib/variant";
import { cn } from "@/lib/utils";

/**
 * 패브릭 하드커버 앨범 — 4:6 비율, 왼쪽 책등, 가운데 파인 사진 창.
 * 창 안의 사진은 원본 비율을 지키고, 커버 폭의 절반·높이의 44% 안에 들어간다.
 */
export function AlbumCover({
  album,
  className,
  style,
}: {
  album: Pick<Album, "id" | "coverColor"> & { cover: string };
  className?: string;
  style?: CSSProperties;
}) {
  const tone = coverFabricTone(coverColorOf(album).hex, coverVariant);
  return (
    <div
      className={cn("album-cover relative aspect-[2/3] w-full select-none", className)}
      style={{ ...style, "--cover": tone } as CSSProperties}
      aria-hidden
    >
      <span className="album-cover-spine" />
      <span className="album-cover-well">
        <span className="album-cover-window">
          <img src={album.cover} alt="" draggable={false} />
        </span>
      </span>
    </div>
  );
}
