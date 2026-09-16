import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlbumCover } from "@/components/album-cover";
import type { AlbumCardData } from "@/data/albums";

/** 확대에 드는 시간 — 천천히 들어와 부드럽게 멈춘다 */
const GROW_MS = 820;
/** 다 커진 뒤 잠깐 머무는 시간 */
const HOLD_MS = 140;
/** 상세 화면으로 녹아드는 시간 */
const FADE_MS = 460;

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 양끝이 느린 이징 — p 가 클수록 가운데가 빠르다 */
const easeInOutPow = (x: number, p: number) =>
  x < 0.5 ? 0.5 * (2 * x) ** p : 1 - 0.5 * (2 - 2 * x) ** p;

/**
 * 앨범 열림 — 목록·배너의 앨범 한 권이 그 자리에서 그대로 커져 화면 폭을 꽉 채우고,
 * 그 아래에서 상세 화면으로 바뀐 뒤 앨범이 천천히 녹아 사라진다.
 * 비율·질감·사진 창은 그대로 유지된다. 표지를 펼치거나 면을 갈아끼우지 않아 번쩍임이 없다.
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
    // 폰 캔버스 폭에 맞춰 4:5 그대로 커진다. 위쪽에 붙어 상세 hero 자리를 덮는다.
    const cr = document.querySelector<HTMLElement>("[data-screen]")?.getBoundingClientRect();
    const target = { left: cr?.left ?? 0, top: 0, width: cr?.width ?? window.innerWidth };
    const targetHeight = target.width * 1.25;

    let start: number | undefined;
    let revealed = false;
    let finished = false;
    let raf = 0;

    const doReveal = () => {
      if (revealed) return;
      revealed = true;
      reveal.current();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      // 끝 자리를 고정해 두고 녹아든다
      el.style.left = `${target.left}px`;
      el.style.top = `${target.top}px`;
      el.style.width = `${target.width}px`;
      el.style.height = `${targetHeight}px`;
      const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FADE_MS,
        easing: "cubic-bezier(.4,0,.2,1)",
        fill: "forwards",
      });
      fade.onfinish = () => done.current();
    };
    // 탭이 뒤로 가 있어 프레임이 멈춰도 전환은 시계대로 일어난다
    const revealTimer = window.setTimeout(doReveal, GROW_MS);
    const finishTimer = window.setTimeout(finish, GROW_MS + HOLD_MS);

    const frame = (now: number) => {
      if (start === undefined) start = now;
      const t = now - start;
      const g = easeInOutPow(clamp(t / GROW_MS), 2.2);
      el.style.left = `${lerp(from.left, target.left, g)}px`;
      el.style.top = `${lerp(from.top, target.top, g)}px`;
      el.style.width = `${lerp(from.width, target.width, g)}px`;
      el.style.height = `${lerp(from.height, targetHeight, g)}px`;
      if (t >= GROW_MS) doReveal();
      if (t < GROW_MS + HOLD_MS) raf = requestAnimationFrame(frame);
      else finish();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, [from]);

  return createPortal(
    <div
      ref={root}
      className="album-opening"
      style={{ left: from.left, top: from.top, width: from.width, height: from.height }}
      aria-hidden
    >
      <AlbumCover album={album} className="absolute inset-0 aspect-auto h-full" />
    </div>,
    document.body,
  );
}
