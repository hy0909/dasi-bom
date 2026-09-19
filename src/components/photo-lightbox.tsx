import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * 사진 크게 보기 — 화면을 덮는 검은 딤 위에 사진 한 장만 띄운다.
 * 여백 없이 긴 쪽이 화면에 꽉 차고, 짧은 쪽은 비율대로 남는다(contain).
 * 손가락 두 개로 벌리면 커지고, 커진 뒤에는 한 손가락으로 끌어 볼 수 있다.
 * 두 번 두드리면(데스크톱은 두 번 누르거나 휠) 커졌다 작아졌다 한다.
 * 닫기는 오른쪽 위 ✕ 이거나, 사진 바깥의 어두운 자리를 누르는 것. 여닫을 때는 0.2초 동안 스르륵 뜨고 진다.
 *
 * 확대는 직접 다룬다 — 브라우저의 핀치 줌은 화면 전체를 키우지 이 사진만 키우지 못한다.
 * 그래서 사진 자리에는 touch-action: none 을 주고 손짓을 우리가 받는다.
 */
const MIN_SCALE = 1;
const MAX_SCALE = 4;
/** 두 번 두드렸을 때 커지는 배율 */
const TAP_SCALE = 2.5;
/** 두 번 두드림으로 볼 간격(ms) */
const DOUBLE_TAP_MS = 300;
/** 이보다 움직였으면 끌어 본 것 — 손을 떼도 닫히지 않는다(px) */
const DRAG_SLOP = 6;
/** 이만큼 옆으로 밀면 앞뒤 사진으로 넘어간다(px) */
const SWIPE_PX = 48;

type View = { scale: number; x: number; y: number };

export function PhotoLightbox({
  photo,
  onClose,
  onPrev,
  onNext,
}: {
  /** 열려 있는 사진 — 없으면 닫힌 상태 */
  photo: { src: string; alt?: string } | null;
  onClose: () => void;
  /** 앞뒤 사진으로 — 없는 쪽은 화살표도 손짓도 받지 않는다 */
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const view = useRef<View>({ scale: 1, x: 0, y: 0 });
  /** 끌거나 벌리는 중의 시작값 */
  const grab = useRef({
    mode: "none" as "none" | "pinch" | "pan",
    dist: 0,
    scale: 1,
    px: 0,
    py: 0,
    x: 0,
    y: 0,
  });
  /** 방금 끌어 본 손짓인가 — 그 끝에서는 닫지 않는다 */
  const dragged = useRef(false);
  /** 옆으로 미는 손짓의 시작점 — 사진이 커져 있지 않을 때만 앞뒤로 넘긴다 */
  const swipe = useRef<{ x: number; y: number; ok: boolean } | null>(null);
  const lastTap = useRef(0);

  const apply = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const { scale, x, y } = view.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  /** 사진이 화면 밖으로 달아나지 않게 — 커진 만큼만 움직인다 */
  const hold = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const overX = Math.max(0, (width - el.clientWidth) / 2);
    const overY = Math.max(0, (height - el.clientHeight) / 2);
    view.current.x = Math.max(-overX, Math.min(overX, view.current.x));
    view.current.y = Math.max(-overY, Math.min(overY, view.current.y));
  }, []);

  const settle = useCallback(
    (next: View) => {
      const el = imgRef.current;
      if (!el) return;
      el.style.transition = "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)";
      view.current = next;
      hold();
      apply();
      window.setTimeout(() => {
        if (imgRef.current) imgRef.current.style.transition = "";
      }, 260);
    },
    [apply, hold],
  );

  /** 화면에 그려 두는 사진 — 닫는 동안에도 사라지지 않게 따로 잡아 둔다 */
  const [shown, setShown] = useState<{ src: string; alt?: string } | null>(photo);
  /** 열리는 중인가 닫히는 중인가 — 여닫는 모션을 이 값으로 가른다 */
  const [state, setState] = useState<"open" | "closed">(photo ? "open" : "closed");

  useEffect(() => {
    if (photo) {
      setShown(photo);
      setState("open");
      return;
    }
    if (!shown) return;
    setState("closed");
    // 사라지는 모션이 끝난 뒤에 지운다
    const t = window.setTimeout(() => setShown(null), 200);
    return () => window.clearTimeout(t);
  }, [photo, shown]);

  // 새 사진을 열 때마다 처음 크기로 돌아간다
  useEffect(() => {
    if (!shown) return;
    view.current = { scale: 1, x: 0, y: 0 };
    apply();
  }, [shown, apply]);

  // 열려 있는 동안에는 뒤 화면이 따라 움직이지 않게 하고, Esc 로도 닫는다
  useEffect(() => {
    if (!photo) return;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = scroll;
      window.removeEventListener("keydown", onKey);
    };
  }, [photo, onClose, onPrev, onNext]);

  if (!shown) return null;

  const zoomAt = (clientX: number, clientY: number) => {
    const el = imgRef.current;
    if (!el) return;
    if (view.current.scale > 1.02) return settle({ scale: 1, x: 0, y: 0 });
    // 두드린 자리가 가운데로 오도록 옮기면서 키운다
    const box = el.getBoundingClientRect();
    const dx = (box.left + box.width / 2 - clientX) * (TAP_SCALE - 1);
    const dy = (box.top + box.height / 2 - clientY) * (TAP_SCALE - 1);
    settle({ scale: TAP_SCALE, x: dx, y: dy });
  };

  type Point = { clientX: number; clientY: number };
  const dist = (a: Point, b: Point) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    dragged.current = false;
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      grab.current = {
        mode: "pinch",
        dist: dist(a, b),
        scale: view.current.scale,
        px: (a.clientX + b.clientX) / 2,
        py: (a.clientY + b.clientY) / 2,
        x: view.current.x,
        y: view.current.y,
      };
      return;
    }
    if (e.touches.length === 1) {
      const t = e.touches[0];
      // 커져 있지 않을 때의 한 손가락은 앞뒤로 넘기는 손짓일 수 있다
      swipe.current = { x: t.clientX, y: t.clientY, ok: view.current.scale <= 1.02 };
      grab.current = {
        mode: view.current.scale > 1.02 ? "pan" : "none",
        dist: 0,
        scale: view.current.scale,
        px: t.clientX,
        py: t.clientY,
        x: view.current.x,
        y: view.current.y,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const g = grab.current;
    if (g.mode === "pinch" && e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, (g.scale * dist(a, b)) / g.dist));
      // 두 손가락 가운데가 사진의 같은 자리를 붙들고 있게 한다
      const mx = (a.clientX + b.clientX) / 2;
      const my = (a.clientY + b.clientY) / 2;
      view.current.scale = scale;
      view.current.x = g.x + (mx - g.px) + (g.x * (scale - g.scale)) / g.scale;
      view.current.y = g.y + (my - g.py) + (g.y * (scale - g.scale)) / g.scale;
      dragged.current = true;
      hold();
      apply();
      return;
    }
    if (g.mode === "pan" && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - g.px;
      const dy = t.clientY - g.py;
      if (Math.hypot(dx, dy) > DRAG_SLOP) dragged.current = true;
      view.current.x = g.x + dx;
      view.current.y = g.y + dy;
      hold();
      apply();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const g = grab.current;
    g.mode = "none";
    // 옆으로 민 손짓이면 앞뒤 사진으로 — 위아래로 더 많이 움직였으면 넘기지 않는다
    const from = swipe.current;
    swipe.current = null;
    const end = e.changedTouches[0];
    if (from?.ok && end && view.current.scale <= 1.02) {
      const dx = end.clientX - from.x;
      const dy = end.clientY - from.y;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragged.current = true; // 이 손짓으로는 닫지도, 키우지도 않는다
        lastTap.current = 0;
        if (dx < 0) onNext?.();
        else onPrev?.();
        return;
      }
    }
    // 원래 크기보다 작아졌으면 제자리로 돌려놓는다
    if (view.current.scale <= 1.02 && (view.current.x !== 0 || view.current.y !== 0 || view.current.scale !== 1))
      settle({ scale: 1, x: 0, y: 0 });
    if (dragged.current) return;
    // 두 번 두드리면 커졌다 작아졌다
    const now = Date.now();
    const t = e.changedTouches[0];
    if (t && now - lastTap.current < DOUBLE_TAP_MS) {
      zoomAt(t.clientX, t.clientY);
      lastTap.current = 0;
      dragged.current = true; // 이 손짓으로는 닫지 않는다
      return;
    }
    lastTap.current = now;
  };

  // ── 데스크톱 — 휠로 키우고, 커진 뒤에는 끌어서 본다 ──
  const onWheel = (e: React.WheelEvent) => {
    const next = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, view.current.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12)),
    );
    if (next === view.current.scale) return;
    view.current.scale = next;
    if (next === 1) {
      view.current.x = 0;
      view.current.y = 0;
    }
    hold();
    apply();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (view.current.scale <= 1.02) return;
    e.preventDefault();
    const start = { px: e.clientX, py: e.clientY, x: view.current.x, y: view.current.y };
    const move = (m: MouseEvent) => {
      const dx = m.clientX - start.px;
      const dy = m.clientY - start.py;
      if (Math.hypot(dx, dy) > DRAG_SLOP) dragged.current = true;
      view.current.x = start.x + dx;
      view.current.y = start.y + dy;
      hold();
      apply();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      // 어두운 자리를 누르면 닫힌다 — 사진을 끌어 본 끝이라면 닫지 않는다
      onClick={() => {
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onClose();
      }}
      data-state={state}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-md duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-[max(16px,env(safe-area-inset-top))] right-4 z-10 flex size-10 items-center justify-center rounded-full text-canvas drop-shadow-[0_2px_8px_rgb(0_0_0/0.65)] transition-colors outline-none hover:bg-canvas/15 focus-visible:ring-3 focus-visible:ring-canvas/50"
      >
        <X className="size-6" strokeWidth={2.2} />
      </button>

      {/* 앞뒤 사진 — 흰 화살표에 까만 그림자를 깔아 어떤 사진 위에서도 보인다 */}
      {onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="이전 사진"
          className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-canvas drop-shadow-[0_2px_10px_rgb(0_0_0/0.8)] transition-colors outline-none hover:bg-canvas/15 focus-visible:ring-3 focus-visible:ring-canvas/50"
        >
          <ChevronLeft className="size-7" strokeWidth={2.2} />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="다음 사진"
          className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-canvas drop-shadow-[0_2px_10px_rgb(0_0_0/0.8)] transition-colors outline-none hover:bg-canvas/15 focus-visible:ring-3 focus-visible:ring-canvas/50"
        >
          <ChevronRight className="size-7" strokeWidth={2.2} />
        </button>
      )}

      <img
        ref={imgRef}
        src={shown.src}
        alt={shown.alt ?? ""}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onDoubleClick={(e) => {
          e.stopPropagation();
          zoomAt(e.clientX, e.clientY);
        }}
        className="max-h-full max-w-full touch-none object-contain select-none"
      />
    </div>,
    document.body,
  );
}
