import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlbumCover } from "@/components/album-cover";
import type { AlbumCardData } from "@/data/albums";

/**
 * 앨범 열림 — 목록·배너의 앨범 한 권이 화면 위쪽 정사각(상세 hero 자리)까지 커지면서
 * 앞표지가 왼쪽 책등을 축으로 펼쳐지고, 속지 위의 대표 사진이 그대로 상세 hero 로 이어진다.
 * 겹쳐 그리는 오버레이라 실제 화면 전환은 표지가 반쯤 열린 시점(onReveal)에 아래에서 일어난다.
 */
export function AlbumOpening({
  album,
  from,
  onReveal,
  onDone,
}: {
  album: AlbumCardData;
  /** 눌린 앨범 커버가 화면에서 차지하던 자리 */
  from: DOMRect;
  onReveal: () => void;
  onDone: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reveal = useRef(onReveal);
  const done = useRef(onDone);
  reveal.current = onReveal;
  done.current = onDone;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // 상세 hero 는 폰 캔버스 폭의 정사각이고 페이지 맨 위에 붙는다.
    const canvas = document.querySelector<HTMLElement>("[data-screen]");
    const cr = canvas?.getBoundingClientRect();
    const target = {
      left: cr?.left ?? 0,
      top: 0,
      width: cr?.width ?? window.innerWidth,
    };
    const soft = "cubic-bezier(.2,.8,.2,1)";
    const fill = "forwards" as const;

    // 1) 자리 이동·확대 — 4:5 에서 1:1 로 커진다
    el.animate(
      [
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
        },
        {
          left: `${target.left}px`,
          top: `${target.top}px`,
          width: `${target.width}px`,
          height: `${target.width}px`,
        },
      ],
      { duration: 640, easing: soft, fill },
    );
    // 2) 앞표지가 책등을 축으로 펼쳐진다
    el.querySelector(".album-opening-front")?.animate(
      [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-168deg)" }],
      { duration: 760, delay: 240, easing: "cubic-bezier(.32,.72,.22,1)", fill },
    );
    // 3) 표지가 속지에 드리우던 그늘이 걷힌다
    el.querySelector(".album-opening-shade")?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 760,
      delay: 240,
      easing: soft,
      fill,
    });
    // 4) 속지의 사진이 또렷해진다 — 상세 hero 와 같은 사진
    el.querySelector(".album-opening-photo")?.animate([{ opacity: 0.35 }, { opacity: 1 }], {
      duration: 480,
      delay: 420,
      easing: soft,
      fill,
    });
    // 5) 표지가 반쯤 열렸을 때 아래 화면을 상세로 바꾸고, 다 열리면 오버레이가 사라진다
    const revealAt = window.setTimeout(() => reveal.current(), 560);
    const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 280,
      delay: 1000,
      easing: "ease-out",
      fill,
    });
    fade.onfinish = () => done.current();
    return () => window.clearTimeout(revealAt);
  }, [from]);

  return createPortal(
    <div
      ref={root}
      className="album-opening"
      style={{ left: from.left, top: from.top, width: from.width, height: from.height }}
      aria-hidden
    >
      <div className="album-opening-book">
        {/* 속지 — 종이 위에 대표 사진, 책등 쪽 접힘 그늘 */}
        <div className="album-opening-page">
          <img className="album-opening-photo" src={album.cover} alt="" draggable={false} />
          <span className="album-opening-crease" />
          <span className="album-opening-shade" />
        </div>
        {/* 앞표지 — 바깥은 리넨 커버, 안쪽은 크림색 면지 */}
        <div className="album-opening-front">
          <AlbumCover album={album} className="album-opening-face absolute inset-0 aspect-auto h-full" />
          <span className="album-opening-face album-opening-endpaper" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
