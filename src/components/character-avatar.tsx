import { cn } from "@/lib/utils";

/**
 * 프로필 캐릭터 — '다시, 봄'의 봄 모티프 5종.
 * 계정의 tone 값(0~4)이 곧 캐릭터 인덱스다. 사진 업로드 대신 이 중 하나를 고른다.
 * 색은 브랜드 팔레트(크림·커피·오렌지) 안에서만 쓴다.
 */
export type Character = {
  id: string;
  label: string;
  /** 원형 배경 */
  bg: string;
  art: React.ReactNode;
};

const INK = "#201515";
const CREAM = "#fffefb";
const ORANGE = "#ff4f00";

export const CHARACTERS: Character[] = [
  {
    id: "sprout",
    label: "새싹",
    bg: "#e8efe2",
    art: (
      <>
        <path d="M32 46V28" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path
          d="M32 30c-7 0-12-4-12-10 6 0 12 3 12 10Z"
          fill={INK}
        />
        <path d="M32 34c7 0 12-5 12-11-6 0-12 4-12 11Z" fill={ORANGE} />
        <circle cx="27" cy="40" r="1.8" fill={INK} />
        <circle cx="37" cy="40" r="1.8" fill={INK} />
      </>
    ),
  },
  {
    id: "bird",
    label: "봄새",
    bg: "#f6e3d8",
    art: (
      <>
        <path
          d="M20 36c0-7 6-13 13-13s13 6 13 13-6 12-13 12h-8a5 5 0 0 1-5-5v-7Z"
          fill={INK}
        />
        <path d="M46 34l7-4-3 7-4-3Z" fill={ORANGE} />
        <circle cx="38" cy="33" r="2.2" fill={CREAM} />
        <path d="M24 44c4 2 9 2 13 0" stroke={ORANGE} strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "flower",
    label: "꽃",
    bg: "#f8e9c9",
    art: (
      <>
        <circle cx="32" cy="24" r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
        <circle cx="22" cy="33" r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
        <circle cx="42" cy="33" r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
        <circle cx="32" cy="34" r="6.5" fill={ORANGE} />
        <path d="M32 40v10" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "sun",
    label: "볕",
    bg: "#fbe0d2",
    art: (
      <>
        <circle cx="32" cy="32" r="11" fill={ORANGE} />
        <circle cx="28" cy="31" r="1.8" fill={CREAM} />
        <circle cx="36" cy="31" r="1.8" fill={CREAM} />
        <path d="M29 36c2 1.6 4 1.6 6 0" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <path
            key={deg}
            d="M32 16v-5"
            stroke={INK}
            strokeWidth="2.6"
            strokeLinecap="round"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </>
    ),
  },
  {
    id: "cat",
    label: "고양이",
    bg: "#ece7dd",
    art: (
      <>
        <path d="M20 28l1-9 8 5M44 28l-1-9-8 5" fill={INK} />
        <circle cx="32" cy="34" r="13" fill={INK} />
        <circle cx="27" cy="32" r="2.2" fill={CREAM} />
        <circle cx="37" cy="32" r="2.2" fill={CREAM} />
        <path d="M32 37l-2 2h4l-2-2Z" fill={ORANGE} />
        <path d="M18 34h6M40 34h6" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
];

export function characterAt(index?: number | null) {
  return CHARACTERS[(index ?? 0) % CHARACTERS.length];
}

const sizes = {
  sm: "size-7",
  default: "size-9",
  lg: "size-12",
  xl: "size-20",
} as const;

export function CharacterAvatar({
  index,
  size = "default",
  className,
}: {
  index?: number | null;
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
      style={{ backgroundColor: character.bg }}
      role="img"
      aria-label={`프로필 캐릭터 ${character.label}`}
    >
      <svg viewBox="0 0 64 64" className="size-full" aria-hidden>
        {character.art}
      </svg>
    </span>
  );
}
