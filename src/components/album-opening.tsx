import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AlbumCover } from "@/components/album-cover";
import { coverColorOf, coverFabricTone } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { coverVariant } from "@/lib/variant";

/** 1) 앨범이 그 자리에서 화면 폭까지 커지는 시간 */
const GROW_MS = 900;
/** 아래 화면을 완전히 가리는 스크림이 차오르는 시간 */
const SCRIM_MS = 520;
/** 2) 표지가 넘어가기 시작하는 시점(= 확대가 끝난 뒤)과 넘어가는 데 드는 시간 — 무게 있게 천천히 */
const FLIP_START_MS = GROW_MS;
const FLIP_MS = 1300;
/** 3) 표지가 다 넘어간 뒤 오버레이가 상세 화면으로 녹아드는 시간 */
const FADE_MS = 520;

/**
 * 앨범 열림 — 순서가 곧 의미다.
 * 1) 눌린 앨범 한 권이 4:5 그대로 화면 폭까지 커진다. 그동안 나머지 화면은 불투명한 스크림에 완전히 가려진다.
 * 2) 확대와 스크림이 모두 끝난 뒤, 가려진 채로 아래 화면이 상세로 바뀐다. 표지는 아직 닫혀 있어 사진은 보이지 않는다.
 * 3) 표지가 왼쪽 책등을 축으로 천천히 넘어가고, 그 아래 사진(= 상세 hero 와 같은 사진·같은 자리)이 드러난다.
 * 4) 표지가 다 넘어간 뒤 오버레이가 녹아 사라지면 상세 화면만 남는다.
 * 앞·뒷면을 처음부터 함께 두고 backface-visibility 로만 가르므로 중간에 면을 갈아끼우는 번쩍임이 없다.
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
    const book = el.querySelector<HTMLElement>(".album-opening-book");
    const scrim = el.querySelector<HTMLElement>(".album-opening-scrim");
    const front = el.querySelector<HTMLElement>(".album-opening-front");
    if (!book || !scrim || !front) return;

    // 상세 hero 는 폰 캔버스 폭의 4:5 이고 페이지 맨 위에 붙는다 — 앨범이 거기까지 커진다.
    const cr = document.querySelector<HTMLElement>("[data-screen]")?.getBoundingClientRect();
    const width = cr?.width ?? window.innerWidth;
    const target = { left: cr?.left ?? 0, top: 0, width, height: width * 1.25 };
    const fill = "forwards" as const;
    const px = (v: number) => `${v}px`;

    const grow = book.animate(
      [
        { left: px(from.left), top: px(from.top), width: px(from.width), height: px(from.height) },
        { left: px(target.left), top: px(target.top), width: px(target.width), height: px(target.height) },
      ],
      { duration: GROW_MS, easing: "cubic-bezier(.45,0,.2,1)", fill },
    );
    const veil = scrim.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: SCRIM_MS,
      easing: "ease-out",
      fill,
    });
    const flip = front.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }], {
      duration: FLIP_MS,
      delay: FLIP_START_MS,
      easing: "cubic-bezier(.5,.05,.2,1)",
      fill,
    });
    const animations = [grow, veil, flip];

    let revealed = false;
    let finished = false;
    let fade: Animation | undefined;
    const doReveal = () => {
      if (revealed) return;
      revealed = true;
      reveal.current();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      doReveal();
      fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FADE_MS,
        easing: "cubic-bezier(.4,0,.2,1)",
        fill,
      });
      fade.onfinish = () => done.current();
    };
    // 전환 시점은 애니메이션 자체에 묶는다 — 확대와 스크림이 다 끝난 뒤에만 상세로 바꾸고, 표지가 다 넘어간 뒤에만 녹아든다
    const quiet = () => undefined;
    Promise.all([grow.finished, veil.finished]).then(doReveal, quiet);
    flip.finished.then(finish, quiet);
    // 탭이 뒤로 가 있어 애니메이션이 멈춰도 오버레이가 영영 남지는 않게 — 시계 기준 마지막 안전장치
    const safety = window.setTimeout(finish, FLIP_START_MS + FLIP_MS + 1500);
    return () => {
      window.clearTimeout(safety);
      animations.forEach((a) => a.cancel());
      fade?.cancel();
    };
  }, [from]);

  const tone = coverFabricTone(coverColorOf(album).hex, coverVariant);

  return createPortal(
    <div ref={root} className="album-opening" aria-hidden>
      {/* 나머지 화면을 가리는 스크림 — 이 뒤에서 상세로 바뀐다 */}
      <div className="album-opening-scrim" />
      <div
        className="album-opening-book"
        style={
          {
            left: from.left,
            top: from.top,
            width: from.width,
            height: from.height,
            "--cover": tone,
          } as CSSProperties
        }
      >
        {/* 표지 아래 — 상세 hero 와 같은 사진, 같은 자리 */}
        <div className="album-opening-page">
          <img className="album-opening-photo" src={album.cover} alt="" draggable={false} />
        </div>
        {/* 앞표지 — 바깥은 리넨 커버, 안쪽은 같은 천의 어두운 면. 왼쪽 책등을 축으로 넘어간다 */}
        <div className="album-opening-front">
          <AlbumCover album={album} className="album-opening-face absolute inset-0 aspect-auto h-full" />
          <span className="album-opening-face album-opening-inside" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
