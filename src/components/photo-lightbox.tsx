import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * 사진 크게 보기 — 화면을 덮는 검은 딤 위에 사진 한 장만 띄운다.
 * 손가락 두 개로 벌리면 커지고, 커진 뒤에는 한 손가락으로 끌어 볼 수 있다.
 * 두 번 두드리면(데스크톱은 두 번 누르거나 휠) 커졌다 작아졌다 한다.
 * 닫기는 오른쪽 위 ✕ 이거나, 사진 바깥의 어두운 자리를 누르는 것.
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

type View = { scale: number; x: number; y: number };

export function PhotoLightbox({
  photo,
  onClose,
}: {
  /** 열려 있는 사진 — 없으면 닫힌 상태 */
  photo: { src: string; alt?: string } | null;
  onClose: () => void;
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

  // 새 사진을 열 때마다 처음 크기로 돌아간다
  useEffect(() => {
    if (!photo) return;
    view.current = { scale: 1, x: 0, y: 0 };
    apply();
  }, [photo, apply]);

  // 열려 있는 동안에는 뒤 화면이 따라 움직이지 않게 하고, Esc 로도 닫는다
  useEffect(() => {
    if (!photo) return;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = scroll;
      window.removeEventListener("keydown", onKey);
    };
  }, [photo, onClose]);

  if (!photo) return null;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-[max(16px,env(safe-area-inset-top))] right-4 z-10 flex size-10 items-center justify-center rounded-full text-canvas drop-shadow-[0_2px_8px_rgb(0_0_0/0.65)] transition-colors outline-none hover:bg-canvas/15 focus-visible:ring-3 focus-visible:ring-canvas/50"
      >
        <X className="size-6" strokeWidth={2.2} />
      </button>

      <img
        ref={imgRef}
        src={photo.src}
        alt={photo.alt ?? ""}
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
