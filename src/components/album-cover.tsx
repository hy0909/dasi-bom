import { useEffect, useId, useRef, type CSSProperties, type DOMAttributes } from "react";
import { coverColorOf, coverFabricTone, coverFrameOf, coverShapeOf, type Album } from "@/data/album";
import { coverVariant } from "@/lib/variant";
import { cn } from "@/lib/utils";

/**
 * 북클로스 하드커버 앨범 — 만들 때 고른 판형(4:5·1:1·4:3·3:5), 왼쪽 책등, 사진이 앉는 자리.
 * 사진 자리는 다섯 가지다 — 기본 창·고전 액자·정사각 창·타원 창·사진 표지(data-frame).
 * 기본 창의 사진은 원본 비율을 지키고, 커버 폭의 52%·높이의 46% 안에 들어간다.
 * 앞표지 뒤에 책등 옆면이 붙어 있어, 부모에 album-3d-hover 가 있으면 호버 때 살짝 돌아서며 옆면이 보인다.
 * 옆면 두께는 사진 장수를 따른다 — 사진이 많은 앨범이 실제로 더 두껍다.
 */
/** 한 앨범에 담을 수 있는 사진 장수 — 책등 두께도 이 장수에서 가장 두꺼워진다. */
export const MAX_PHOTOS = 20;
/** 책등 두께(커버 폭 대비 %) — 1장이 가장 얇고 MAX_PHOTOS 장이 가장 두껍다. */
const DEPTH_MIN = 6;
const DEPTH_MAX = 25;
export function albumDepth(photoCount: number) {
  // 1장과 MAX_PHOTOS 장 사이를 고르게 나눈다 — 한 장 늘 때마다 같은 폭씩 두꺼워진다.
  const fill = Math.min(1, Math.max(0, photoCount - 1) / (MAX_PHOTOS - 1));
  return Math.round((DEPTH_MIN + (DEPTH_MAX - DEPTH_MIN) * fill) * 10) / 10;
}

/* ── 눌러서 돌려보기 ───────────────────────────────────────────────────────
   목록에서 앨범을 누른 채 손을 움직이면 제자리에서 그 방향으로 돌아선다.
   손을 떼면 원래 각도로 돌아온다.
   손가락은 목록을 넘기는 데도 쓰이니, 잠깐 누르고 있어야 돌리기로 본다 —
   바로 밀면 그건 스크롤이다. 마우스는 헷갈릴 일이 없어 누르는 즉시 돈다. */
/** 좌우로 끝까지 돌아섰을 때의 각도 */
const TILT_MAX_Y = 40;
/** 위아래로 끝까지 젖혔을 때의 각도 */
const TILT_MAX_X = 24;
/** 이만큼 움직이면 끝까지 돌아선다(px) */
const TILT_SPAN = 150;
/** 손가락이 이만큼 머물러야 돌리기로 본다(ms) */
const HOLD_MS = 160;
/** 돌리기 전에 이보다 많이 움직였으면 목록을 넘기려는 손짓이다(px) */
const SLOP = 10;

type TiltHandlers = Pick<
  DOMAttributes<HTMLDivElement>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onClickCapture"
>;

function useAlbumTilt(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  /** 누르기 시작한 지점 — 여기서 얼마나 움직였는지로 각도를 정한다 */
  const from = useRef<{ id: number; x: number; y: number } | null>(null);
  const turning = useRef(false);
  /** 돌려본 손짓인가 — 그랬다면 손을 뗄 때 앨범이 열리지 않아야 한다 */
  const turned = useRef(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopHold = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  };

  const turnTo = (dx: number, dy: number) => {
    const el = ref.current;
    if (!el) return;
    const y = Math.max(-1, Math.min(1, dx / TILT_SPAN)) * TILT_MAX_Y;
    const x = Math.max(-1, Math.min(1, -dy / TILT_SPAN)) * TILT_MAX_X;
    el.style.setProperty("--tilt-y", `${y.toFixed(1)}deg`);
    el.style.setProperty("--tilt-x", `${x.toFixed(1)}deg`);
  };

  const begin = () => {
    const el = ref.current;
    if (!el || !from.current) return;
    turning.current = true;
    el.dataset.tilting = "on";
    // 손끝이 앨범 밖으로 나가도 계속 따라 돈다
    try {
      el.setPointerCapture(from.current.id);
    } catch {
      // 이미 놓친 포인터 — 그대로 둔다
    }
  };

  const end = () => {
    stopHold();
    from.current = null;
    if (!turning.current) return;
    turning.current = false;
    const el = ref.current;
    if (!el) return;
    // 각도를 지우면 전환이 다시 살아나 제자리로 돌아간다
    delete el.dataset.tilting;
    el.style.removeProperty("--tilt-x");
    el.style.removeProperty("--tilt-y");
  };

  // 돌리는 동안에는 화면이 같이 밀리지 않게 막는다 — 리액트의 touchmove 는 막을 수 없어 직접 단다.
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const block = (e: TouchEvent) => {
      if (turning.current) e.preventDefault();
    };
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("touchmove", block);
      stopHold();
    };
  }, [enabled]);

  if (!enabled) return { ref, handlers: {} as TiltHandlers };

  const handlers: TiltHandlers = {
    onPointerDown: (e) => {
      if (e.button !== 0) return;
      from.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      turned.current = false;
      if (e.pointerType === "mouse") begin();
      else hold.current = setTimeout(begin, HOLD_MS);
    },
    onPointerMove: (e) => {
      const at = from.current;
      if (!at) return;
      const dx = e.clientX - at.x;
      const dy = e.clientY - at.y;
      if (!turning.current) {
        if (Math.hypot(dx, dy) > SLOP) end();
        return;
      }
      if (Math.hypot(dx, dy) > 6) turned.current = true;
      turnTo(dx, dy);
    },
    onPointerUp: end,
    onPointerCancel: end,
    onClickCapture: (e) => {
      // 돌려보기만 한 것이면 앨범을 열지 않는다
      if (!turned.current) return;
      turned.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };

  return { ref, handlers };
}

export function AlbumCover({
  album,
  photoCount = 0,
  className,
  style,
  tiltable = false,
}: {
  album: Pick<Album, "id" | "coverColor" | "coverShape" | "coverFrame"> & { cover: string };
  /** 앨범에 든 사진 장수 — 책등 두께가 이걸 따른다 */
  photoCount?: number;
  className?: string;
  style?: CSSProperties;
  /** 누른 채 움직여 돌려볼 수 있게 한다 — 앨범 목록에서만 쓴다 */
  tiltable?: boolean;
}) {
  const tone = coverFabricTone(coverColorOf(album).hex, coverVariant);
  const shape = coverShapeOf(album);
  const frame = coverFrameOf(album);
  const tilt = useAlbumTilt(tiltable);
  return (
    <div
      ref={tilt.ref}
      {...tilt.handlers}
      className={cn("album-book relative w-full select-none", shape.cls, className)}
      data-frame={frame.id}
      style={
        {
          ...style,
          "--cover": tone,
          // 사진 표지는 책등 옆면까지 이 사진이 감싼다
          "--photo": `url("${album.cover}")`,
          "--depth": `${albumDepth(photoCount)}cqw`,
        } as CSSProperties
      }
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
          {/* 레터링 표지 — 사진 대신 표지 위쪽에 무지개처럼 휜 박 글자 */}
          {frame.id === "lettering" && <CoverLettering />}
        </div>
        <span className="album-book-side" />
      </div>
    </div>
  );
}

/**
 * 레터링 표지의 글자 — 무지개처럼 휜 반원 위에 얹은 'Our Happiest Days'.
 * 휜 글줄은 CSS 로 만들 수 없어 SVG textPath 를 쓴다.
 * 색은 무광 로즈골드 박 — 금속 그라데이션 위에 아주 가는 결을 덮고, 눌린 자국만큼의 그늘을 준다.
 * 글줄 바로 아래에는 같은 박으로 얇고 연한 가로선을 한 줄 긋는다.
 */
function CoverLettering() {
  // 한 화면에 앨범이 여럿이라 id 가 겹치면 안 된다
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const arc = `arc-${uid}`;
  const foil = `foil-${uid}`;
  const grain = `grain-${uid}`;
  return (
    <svg className="album-cover-letter" viewBox="0 0 100 34" aria-hidden>
      <defs>
        {/* 글자가 앉는 반원 */}
        <path id={arc} d="M 5 26 A 75 75 0 0 1 95 26" fill="none" />
        <linearGradient id={foil} x1="0%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#f2d2c6" />
          <stop offset="24%" stopColor="#d79e8c" />
          <stop offset="42%" stopColor="#f6ddd2" />
          <stop offset="60%" stopColor="#c98878" />
          <stop offset="78%" stopColor="#eab9a8" />
          <stop offset="100%" stopColor="#bb7a68" />
        </linearGradient>
        {/* 무광 박의 아주 가는 결 */}
        <pattern id={grain} width="1.2" height="1.2" patternTransform="rotate(115)" patternUnits="userSpaceOnUse">
          <rect width="1.2" height="1.2" fill="#ffffff" opacity="0.16" />
          <rect width="0.5" height="1.2" fill="#000000" opacity="0.2" />
        </pattern>
      </defs>
      <text className="album-cover-letter-text" fill={`url(#${foil})`}>
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          Our Happiest Days
        </textPath>
      </text>
      <text className="album-cover-letter-text" fill={`url(#${grain})`} opacity="0.32">
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          Our Happiest Days
        </textPath>
      </text>
      {/* 글줄 아래 얇고 연한 가로선 */}
      <line x1="38" y1="19" x2="62" y2="19" stroke="#dcb0a0" strokeWidth="0.3" opacity="0.7" />
    </svg>
  );
}
