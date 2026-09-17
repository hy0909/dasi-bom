import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AlbumCover } from "@/components/album-cover";
import { coverColorOf, coverFabricTone, coverShapeOf } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { coverVariant } from "@/lib/variant";

/** 1) 눌린 그 자리에서 커지며 화면 정중앙으로 옮겨 앉는 시간 — 천천히 풀리는 ease */
const GROW_MS = 900;
/** 아래 화면을 완전히 가리는 스크림이 차오르는 시간 */
const SCRIM_MS = 520;
/** 2) 표지가 넘어가기 시작하는 시점(= 확대가 끝난 뒤)과 넘어가는 데 드는 시간 — 무게 있게 천천히 */
const FLIP_START_MS = GROW_MS;
const FLIP_MS = 1300;
/** 3) 사진이 다 드러난 채로 잠깐 머무는 시간 */
const HOLD_MS = 160;
/** 4) 펼친 그대로 — 크기는 손대지 않고 사진이 제자리(상세 hero)로 올라가는 시간 */
const RISE_START_MS = FLIP_START_MS + FLIP_MS + HOLD_MS;
const RISE_MS = 700;
/** 5) 제자리에 닿은 뒤 오버레이가 통째로 녹아 사라지는 시간 */
const FADE_START_MS = RISE_START_MS + RISE_MS;
const FADE_MS = 500;

type Box = { left: number; top: number; width: number; height: number };

/**
 * 앨범 열림 — 순서가 곧 의미다.
 * 1) 눌린 앨범 한 권이 그 자리에서 4:5 그대로 커지며 화면 정중앙으로 옮겨 앉는다.
 *    커지는 크기는 상세 hero 와 같다 — 이 뒤로는 크기를 다시 건드리지 않는다.
 *    그동안 나머지 화면은 불투명한 스크림에 완전히 가려진다.
 * 2) 확대와 스크림이 모두 끝난 뒤, 가려진 채로 아래 화면이 상세로 바뀐다. 표지는 아직 닫혀 있어 사진은 보이지 않는다.
 * 3) 표지가 왼쪽 책등을 축으로 천천히 넘어가고, 그 아래 사진이 드러난다.
 * 4) 드러난 사진이 그 크기 그대로 위로 올라가, 상세 hero 사진이 있어야 할 화면 맨 위에 가 닿는다.
 * 5) 거기서 오버레이가 통째로 녹아 사라지면, 같은 자리·같은 크기의 상세 hero 만 남는다.
 * 앞·뒷면을 처음부터 함께 두고 backface-visibility 로만 가르므로 중간에 면을 갈아끼우는 번쩍임이 없다.
 */
export function AlbumOpening({
  album,
  from,
  onReveal,
  onDone,
}: {
  album: AlbumCardData;
  /** 눌린 앨범 커버가 화면에서 차지하던 자리 — 돌아갈 곳이기도 하다 */
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

    // 상세 hero 는 폰 캔버스 폭에 앨범 판형 그대로이고 페이지 맨 위에 붙는다 — 펼친 사진이 가 닿을 제자리다.
    const cr = document.querySelector<HTMLElement>("[data-screen]")?.getBoundingClientRect();
    const width = cr?.width ?? window.innerWidth;
    const height = width * coverShapeOf(album).aspect;
    const hero: Box = { left: cr?.left ?? 0, top: 0, width, height };
    // 앨범은 그 크기 그대로 화면 정중앙에서 펼쳐진다 — 자리만 다르고 크기는 hero 와 같다.
    const target: Box = { ...hero, top: (window.innerHeight - height) / 2 };

    const fill = "forwards" as const;
    const px = (v: number) => `${v}px`;
    const box = (r: Box) => ({
      left: px(r.left),
      top: px(r.top),
      width: px(r.width),
      height: px(r.height),
    });

    // 1) 그 자리에서 커지며 정중앙으로 — 끝에서 천천히 풀린다
    const grow = book.animate([box(from), box(target)], {
      duration: GROW_MS,
      easing: "cubic-bezier(.22,.66,.12,1)",
      fill,
    });
    const veil = scrim.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: SCRIM_MS,
      easing: "ease-out",
      fill,
    });
    // 3) 표지가 넘어간다
    const flip = front.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }], {
      duration: FLIP_MS,
      delay: FLIP_START_MS,
      easing: "cubic-bezier(.5,.05,.2,1)",
      fill,
    });
    // 4) 펼친 사진이 그대로 위로 — top 만 건드린다. 크기는 확대가 남겨 둔 값(hero 와 같은 크기) 그대로다.
    const rise = book.animate([{ top: px(target.top) }, { top: px(hero.top) }], {
      duration: RISE_MS,
      delay: RISE_START_MS,
      easing: "cubic-bezier(.25,.6,.15,1)",
      fill,
    });
    // 5) 제자리에 닿으면 스크림째 녹아 사라진다 — 같은 사진이 같은 자리에 있어 갈아타는 티가 나지 않는다
    const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: FADE_MS,
      delay: FADE_START_MS,
      easing: "cubic-bezier(.4,0,.2,1)",
      fill,
    });
    const animations = [grow, veil, flip, rise, fade];

    let revealed = false;
    let finished = false;
    const doReveal = () => {
      if (revealed) return;
      revealed = true;
      reveal.current();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      doReveal();
      done.current();
    };
    // 전환 시점은 애니메이션 자체에 묶는다 — 확대와 스크림이 다 끝난 뒤에만 상세로 바꾼다
    const quiet = () => undefined;
    Promise.all([grow.finished, veil.finished]).then(doReveal, quiet);
    // 녹기 시작하면 아래 상세 화면이 보인다 — 사라지는 오버레이가 탭을 막고 있지 않게
    rise.finished.then(() => el.classList.add("album-opening-releasing"), quiet);
    fade.finished.then(finish, quiet);
    // 탭이 뒤로 가 있어 애니메이션이 멈춰도 오버레이가 영영 남지는 않게 — 시계 기준 마지막 안전장치
    const safety = window.setTimeout(finish, FADE_START_MS + FADE_MS + 1500);
    return () => {
      window.clearTimeout(safety);
      animations.forEach((a) => a.cancel());
    };
  }, [from, album]);

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
        {/* 표지 아래 — 앨범의 대표 사진 */}
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
