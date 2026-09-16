import type { CSSProperties } from "react";
import { coverColorOf, coverFabricTone, type Album } from "@/data/album";
import { coverVariant } from "@/lib/variant";
import { cn } from "@/lib/utils";

/**
 * 북클로스 하드커버 앨범 — 4:5 비율, 왼쪽 책등, 가운데 파인 사진 창.
 * 창 안의 사진은 원본 비율을 지키고, 커버 폭의 52%·높이의 46% 안에 들어간다.
 * 앞표지 뒤에 책등 옆면이 붙어 있어, 부모에 album-3d-hover 가 있으면 호버 때 살짝 돌아서며 옆면이 보인다.
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
      className={cn("album-book relative aspect-[4/5] w-full select-none", className)}
      style={{ ...style, "--cover": tone } as CSSProperties}
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
