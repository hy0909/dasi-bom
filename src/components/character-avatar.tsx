import { cn } from "@/lib/utils";

/**
 * 프로필 캐릭터 — 가족 구성원 4종.
 * 계정의 tone 이 캐릭터 인덱스, color 가 배경색 인덱스다. 사진 업로드 대신 이 조합을 고른다.
 */
export type Character = {
  id: string;
  label: string;
  art: React.ReactNode;
};

const INK = "#201515";
const LINE = "#2f2a26";

/** 네 캐릭터가 공유하는 얼굴 — 머리 모양과 크기로 구분한다. */
function Face({ r = 13, cy = 34, blush = false }: { r?: number; cy?: number; blush?: boolean }) {
  return (
    <>
      <circle cx="32" cy={cy} r={r} fill="#f7ede4" stroke={LINE} strokeWidth="2" />
      <circle cx={32 - r * 0.38} cy={cy - 1} r="1.9" fill={INK} />
      <circle cx={32 + r * 0.38} cy={cy - 1} r="1.9" fill={INK} />
      <path
        d={`M${32 - r * 0.27} ${cy + r * 0.38}c${r * 0.16} ${r * 0.14} ${r * 0.38} ${r * 0.14} ${r * 0.54} 0`}
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {blush && (
        <>
          <circle cx={32 - r * 0.72} cy={cy + r * 0.24} r="1.9" fill="#ff4f00" opacity="0.3" />
          <circle cx={32 + r * 0.72} cy={cy + r * 0.24} r="1.9" fill="#ff4f00" opacity="0.3" />
        </>
      )}
    </>
  );
}

export const CHARACTERS: Character[] = [
  {
    id: "mom",
    label: "엄마",
    art: (
      <>
        {/* 어깨까지 오는 긴 머리 */}
        <path d="M17 40c0-9 6-18 15-18s15 9 15 18v8h-6V33H23v15h-6v-8Z" fill={INK} />
        <Face />
        <path d="M20 24c4-5 20-5 24 0-4-3-20-3-24 0Z" fill={INK} />
      </>
    ),
  },
  {
    id: "dad",
    label: "아빠",
    art: (
      <>
        {/* 이마가 보이는 짧은 머리 + 턱선 수염 */}
        <path
          d="M21.5 28.5c0-7 4.8-11.5 10.5-11.5s10.5 4.5 10.5 11.5c-2.8-3.6-6.3-5.2-10.5-5.2s-7.7 1.6-10.5 5.2Z"
          fill={INK}
        />
        <Face />
        <path d="M23 38a9 9 0 0 0 18 0" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </>
    ),
  },
  {
    id: "son",
    label: "아들",
    art: (
      <>
        {/* 짧은 머리 + 앞머리 한 가닥 */}
        <path d="M21 34c0-6.5 5-11.5 11-11.5S43 27.5 43 34v1c-3.5-3.5-7-4.5-11-4.5s-7.5 1-11 4.5v-1Z" fill={INK} />
        <path d="M38 24c2-4 5.5-4.5 7 -2-2.5 0-4.5 1-6 3l-1-1Z" fill={INK} />
        <Face r={11.5} cy={36} blush />
      </>
    ),
  },
  {
    id: "daughter",
    label: "딸",
    art: (
      <>
        {/* 양갈래 머리 */}
        <path d="M19 36c-3 2-4 6-3 9 3 1 6-1 7-4l-4-5ZM45 36c3 2 4 6 3 9-3 1-6-1-7-4l4-5Z" fill={INK} />
        <path d="M20 40c0-9 5-17.5 12-17.5S44 31 44 40v1c-2-3-3-6-3-9-3.5 3-14.5 3-18 0 0 3-1 6-3 9v-1Z" fill={INK} />
        <Face r={11.5} cy={36} blush />
      </>
    ),
  },
];

/** 배경색 8종 — 채도·명도를 비슷하게 맞춘 파스텔. 어떤 색을 골라도 잉크 선이 읽힌다. */
export const AVATAR_COLORS = [
  { id: "peach", label: "살구", value: "#f7e2d4" },
  { id: "butter", label: "버터", value: "#f7e9c8" },
  { id: "sage", label: "세이지", value: "#e4ecdd" },
  { id: "sky", label: "하늘", value: "#dbe8f0" },
  { id: "lilac", label: "라일락", value: "#e8e1f0" },
  { id: "rose", label: "로즈", value: "#f6dee0" },
  { id: "mint", label: "민트", value: "#daece6" },
  { id: "sand", label: "모래", value: "#ebe5da" },
];

export function characterAt(index?: number | null) {
  return CHARACTERS[(index ?? 0) % CHARACTERS.length];
}

export function colorAt(index?: number | null) {
  return AVATAR_COLORS[(index ?? 0) % AVATAR_COLORS.length];
}

const sizes = {
  sm: "size-7",
  default: "size-9",
  lg: "size-12",
  xl: "size-20",
} as const;

export function CharacterAvatar({
  index,
  color,
  size = "default",
  className,
}: {
  index?: number | null;
  color?: number | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const character = characterAt(index);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: colorAt(color).value }}
      role="img"
      aria-label={`프로필 캐릭터 ${character.label}`}
    >
      <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
        {character.art}
      </svg>
    </span>
  );
}
