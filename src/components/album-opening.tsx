import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AlbumCover } from "@/components/album-cover";
import { coverColorOf, coverFabricTone } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { coverVariant } from "@/lib/variant";

/** 앞표지를 세로 띠 몇 장으로 나눠 이어 붙인다 — 두꺼운 표지라 휨은 아주 적지만, 띠가 있어야 딱딱하지 않다. */
const STRIPS = 8;
/** 표지 두께 — 폭 대비 */
const THICKNESS = 0.035;
/** 자리 이동·확대 — 천천히, 부드럽게 들어오고 나간다 */
const GROW_MS = 900;
/** 표지가 넘어가기 시작하는 시점과 넘어가는 데 드는 시간 — 무게가 느껴지게 천천히 */
const FLIP_START_MS = 640;
const FLIP_MS = 1500;
const END_MS = FLIP_START_MS + FLIP_MS + 120;

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (x: number) => 1 - (1 - x) ** 3;
/** 들어올 때도 나갈 때도 느린 이징 — p 가 클수록 가운데가 빠르고 양끝이 느리다 */
const easeInOutPow = (x: number, p: number) =>
  x < 0.5 ? 0.5 * (2 * x) ** p : 1 - 0.5 * (2 - 2 * x) ** p;

/**
 * 앨범 열림 — 목록·배너의 앨범 한 권이 화면 위쪽 정사각(상세 hero 자리)까지 천천히 커지고,
 * 두꺼운 앞표지가 왼쪽 책등을 축으로 무게 있게 넘어간다. 넘어가는 동안 표지의 앞모서리 두께가 보인다.
 * 속지 위의 대표 사진이 그대로 상세 hero 로 이어진다.
 * 겹쳐 그리는 오버레이라 실제 화면 전환은 표지가 절반 넘게 넘어간 시점(onReveal)에 아래에서 일어난다.
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
    const strips = Array.from(el.querySelectorAll<HTMLElement>(".album-opening-strip"));
    const edge = el.querySelector<HTMLElement>(".album-opening-edge");
    const shade = el.querySelector<HTMLElement>(".album-opening-shade");
    const photo = el.querySelector<HTMLElement>(".album-opening-photo");
    // 상세 hero 는 폰 캔버스 폭의 정사각이고 페이지 맨 위에 붙는다.
    const cr = document.querySelector<HTMLElement>("[data-screen]")?.getBoundingClientRect();
    const target = { left: cr?.left ?? 0, width: cr?.width ?? window.innerWidth };

    let start: number | undefined;
    let revealed = false;
    let raf = 0;

    const frame = (now: number) => {
      if (start === undefined) start = now;
      const t = now - start;

      // 1) 자리 이동·확대 — 4:5 에서 1:1 로, 천천히 들어와 부드럽게 멈춘다
      const g = easeInOutPow(clamp(t / GROW_MS), 2.2);
      const w = lerp(from.width, target.width, g);
      el.style.left = `${lerp(from.left, target.left, g)}px`;
      el.style.top = `${lerp(from.top, 0, g)}px`;
      el.style.width = `${w}px`;
      el.style.height = `${lerp(from.height, target.width, g)}px`;

      // 2) 넘김 — 밑동(책등 쪽) 각도는 무게 있게 0 → -176도. 두꺼운 표지라 휨은 아주 조금만
      const f = clamp((t - FLIP_START_MS) / FLIP_MS);
      const base = -176 * easeInOutPow(f, 2.6);
      const bend = 5 * Math.sin(Math.PI * f);
      const sw = w / STRIPS;
      let px = 0;
      let pz = 0;
      let last = 0;
      for (let i = 0; i < STRIPS; i++) {
        const u = i / (STRIPS - 1);
        const ang = base - bend * u ** 1.5;
        last = ang;
        const rad = (ang * Math.PI) / 180;
        strips[i].style.transform = `translate3d(${px}px, 0, ${pz}px) rotateY(${ang}deg)`;
        // 90도를 넘어가면 표지 안쪽(면지)이 보인다
        strips[i].classList.toggle("is-back", ang < -90);
        // rotateY(θ) 에서 x 축은 (cosθ, 0, -sinθ) 로 간다 — 다음 띠는 이 띠의 끝에서 이어진다
        px += sw * Math.cos(rad);
        pz += -sw * Math.sin(rad);
      }
      // 표지 앞모서리 — 마지막 띠 끝에서 뒤(속지 쪽)로 두께만큼 꺾인 면. 넘어가는 동안 이 두께가 보인다
      if (edge) {
        edge.style.width = `${w * THICKNESS}px`;
        edge.style.transform = `translate3d(${px}px, 0, ${pz}px) rotateY(${last + 90}deg)`;
        edge.style.opacity = f > 0.02 && f < 0.98 ? "1" : "0";
      }

      // 3) 표지가 속지에 드리우던 그늘이 걷히고 사진이 또렷해진다
      if (shade) shade.style.opacity = String(1 - easeOut(f));
      if (photo) photo.style.opacity = String(lerp(0.35, 1, easeOut(clamp((t - 600) / 900))));

      // 4) 절반 넘게 넘어갔을 때 아래 화면을 상세로 바꾼다
      if (!revealed && base < -100) {
        revealed = true;
        reveal.current();
      }

      if (t < END_MS) {
        raf = requestAnimationFrame(frame);
      } else {
        const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 260,
          easing: "ease-out",
          fill: "forwards",
        });
        fade.onfinish = () => done.current();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [from]);

  const tone = coverFabricTone(coverColorOf(album).hex, coverVariant);

  return createPortal(
    <div
      ref={root}
      className="album-opening"
      style={
        {
          left: from.left,
          top: from.top,
          width: from.width,
          height: from.height,
          "--cover": tone,
        } as CSSProperties
      }
      aria-hidden
    >
      <div className="album-opening-book">
        {/* 속지 — 종이 위에 대표 사진, 책등 쪽 접힘 그늘 */}
        <div className="album-opening-page">
          <img className="album-opening-photo" src={album.cover} alt="" draggable={false} />
          <span className="album-opening-crease" />
          <span className="album-opening-shade" />
        </div>
        {/* 앞표지 — 세로 띠로 나뉘어 곡면으로 넘어간다. 바깥은 리넨 커버, 안쪽은 크림색 면지 */}
        {Array.from({ length: STRIPS }, (_, i) => (
          <div
            key={i}
            className="album-opening-strip"
            style={{ width: `calc(${100 / STRIPS}% + 0.7px)` }}
          >
            <div
              className="album-opening-strip-front"
              style={{ width: `${STRIPS * 100}%`, left: `-${i * 100}%` }}
            >
              <AlbumCover album={album} className="absolute inset-0 aspect-auto h-full" />
            </div>
            <span className="album-opening-strip-back" />
          </div>
        ))}
        {/* 표지 두께 — 리넨으로 감싼 앞모서리 */}
        <span className="album-opening-edge" />
      </div>
    </div>,
    document.body,
  );
}
