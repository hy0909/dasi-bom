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

// 레퍼런스의 면 중심 일러스트: 부드러운 머리 실루엣, 살구빛 피부, 작은 타원형 눈.
const HAIR = "#4b484d";
const BROWS = "#998983";
const SKIN = "#f8c9be";
const SKIN_SHADE = "#efafa5";
const EYES = "#36383b";

/** 얼굴의 비율·표정을 공유하고 머리와 상의로 가족 구성원을 구분한다. */
function Face({ child = false }: { child?: boolean }) {
  return (
    <>
      <ellipse cx="35" cy="57" rx="7" ry="9" fill={SKIN} />
      <ellipse cx="85" cy="57" rx="7" ry="9" fill={SKIN} />
      <path d="M36 42C36 27 84 27 84 42v18c0 16-10 25-24 25S36 76 36 60Z" fill={SKIN} />
      <path d="M32 56c3-2 5 0 5 3m46 0c0-3 2-5 5-3" fill="none" stroke={SKIN_SHADE} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M44 47q4-3 8 0m16 0q4-3 8 0" fill="none" stroke={BROWS} strokeWidth={child ? "2.2" : "2.6"} strokeLinecap="round" />
      <ellipse cx="49" cy="56" rx="2.7" ry="3.8" fill={EYES} />
      <ellipse cx="71" cy="56" rx="2.7" ry="3.8" fill={EYES} />
      <ellipse cx="43" cy="65" rx="5.5" ry="3.2" fill="#efaaa7" opacity="0.55" />
      <ellipse cx="77" cy="65" rx="5.5" ry="3.2" fill="#efaaa7" opacity="0.55" />
      <path
        d="m60 58 2 5h-3"
        stroke={SKIN_SHADE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M52 70c4.5 4.5 11.5 4.5 16 0"
        fill="none"
        stroke="#ee8c8c"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </>
  );
}

/** 저장된 인덱스에 맞춰 엄마 → 아빠 → 아들 → 딸 순서를 유지한다. */
export const CHARACTERS: Character[] = [
  {
    id: "mom",
    label: "엄마",
    art: (
      <>
        {/* 7:3 가르마의 긴 머리와 로즈색 상의 */}
        <path d="M29 40c0-18 13-28 31-28 21 0 33 13 33 33 0 20 4 29 9 42 5 15-3 25-19 24H34c-18 1-25-11-17-25 8-13 12-28 12-46Z" fill={HAIR} />
        <path d="M17 123v-13c0-17 17-25 32-26h22c16 1 32 9 32 26v13Z" fill="#edbed9" />
        <path d="M49 77h22v10c0 7-5 11-11 11s-11-4-11-11Z" fill={SKIN} />
        <path d="M49 79c6 5 15 5 22 0v7c-6 5-16 4-22-1Z" fill={SKIN_SHADE} opacity="0.65" />
        <path d="M45 88c2 9 8 14 15 14s13-5 15-14" fill="none" stroke="#dfa5c6" strokeWidth="3" strokeLinecap="round" />
        <Face />
        <path d="M31 52C25 31 38 15 60 15s33 17 27 38c-9-3-13-12-15-24-7 11-21 15-36 17l-1 8Z" fill={HAIR} />
        <path d="M32 110v13m56-13v13" stroke="#dfa5c6" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "dad",
    label: "아빠",
    art: (
      <>
        {/* 이마를 드러낸 사이드파트와 짧게 정리한 옆머리 */}
        <path d="M12 123v-12c0-18 18-28 37-28h22c19 0 37 10 37 28v12Z" fill="#cbd0ce" />
        <path d="M49 76h22v13c0 7-5 11-11 11s-11-4-11-11Z" fill={SKIN} />
        <path d="M49 78c6 5 15 5 22 0v8c-6 4-15 4-22-1Z" fill={SKIN_SHADE} opacity="0.65" />
        <path d="m47 85 13 13-11 7-9-17Zm26 0L60 98l11 7 9-17Z" fill="#e3e5e2" />
        <path d="M60 99v24" stroke="#b8c0bd" strokeWidth="2" />
        <circle cx="65" cy="110" r="1.5" fill="#a4b0aa" />
        <path d="M32 52V34c0-14 13-22 28-22s28 10 28 24v16l-8 7H40Z" fill={HAIR} />
        <Face />
        <path d="M32 51c-2-5-3-12-1-17-5-3-7-8-6-14 7 2 12-4 19-6 12-5 25-4 34 2 9 5 13 16 10 25l-4 12-3-18c-4-1-8-5-10-9-9 10-23 15-34 11l-1 15Z" fill={HAIR} />
        <path d="M70 19c-6 7-18 12-28 12 9-3 18-9 23-15Z" fill="#69636a" opacity="0.7" />
        <path d="M76 23c5 5 7 11 7 18" fill="none" stroke="#69636a" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </>
    ),
  },
  {
    id: "son",
    label: "아들",
    art: (
      <>
        {/* 부드럽게 옆으로 흐르는 앞머리와 민트색 티셔츠 */}
        <path d="M21 123v-12c0-16 16-23 30-23h18c14 0 30 7 30 23v12Z" fill="#b6cfc5" />
        <path d="M51 81h18v11c0 6-4 9-9 9s-9-3-9-9Z" fill={SKIN} />
        <path d="M51 84c5 4 12 4 18 0v7c-5 3-12 3-18-1Z" fill={SKIN_SHADE} opacity="0.65" />
        <path d="M47 92c1 8 6 13 13 13s12-5 13-13" fill="none" stroke="#98bbaf" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(6 10) scale(.9)">
          <path d="M31 53V36c0-14 13-22 29-22 18 0 30 11 30 25v14l-10 6H40Z" fill={HAIR} />
          <Face child />
          <path d="M32 53C27 44 28 31 35 23c8-10 24-11 34-6 13-1 24 11 22 24l-3 13c-6-3-9-10-9-17-5 5-14 8-22 7l4-6c-6 7-16 10-25 10l-1 6Z" fill={HAIR} />
          <path d="M42 28c7-7 16-8 24-6-8 1-14 4-19 9Z" fill="#69636a" opacity="0.55" />
        </g>
        <path d="M34 112v11m52-11v11" stroke="#98bbaf" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "daughter",
    label: "딸",
    art: (
      <>
        {/* 7:3 가르마의 양갈래 머리와 라일락색 상의 */}
        <path d="M21 123v-12c0-16 16-23 30-23h18c14 0 30 7 30 23v12Z" fill="#c9bee1" />
        <path d="M51 81h18v11c0 6-4 9-9 9s-9-3-9-9Z" fill={SKIN} />
        <path d="M51 84c5 4 12 4 18 0v7c-5 3-12 3-18-1Z" fill={SKIN_SHADE} opacity="0.65" />
        <path d="M47 92c1 8 6 13 13 13s12-5 13-13" fill="none" stroke="#b2a5cf" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(6 10) scale(.9)">
          <path d="M31 48c-11-4-20 4-20 16 0 10-4 15-7 18 14 5 26-2 29-15Zm58 0c11-4 20 4 20 16 0 10 4 15 7 18-14 5-26-2-29-15Z" fill={HAIR} />
          <path d="M30 55c-7-14-2-31 10-38 13-8 32-5 41 3 10 9 13 22 8 36Z" fill={HAIR} />
          <path d="m26 52 7 3m54 0 7-3" stroke="#e3a1b4" strokeWidth="5" strokeLinecap="round" />
          <Face child />
          <path d="M31 54c-6-12-1-28 10-34 17-9 36-2 43 12 3 6 4 13 2 22l-4-2-2-8c-15-1-26-6-32-13-2 10-6 18-13 23Z" fill={HAIR} />
        </g>
        <path d="M34 112v11m52-11v11" stroke="#b2a5cf" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
];

/**
 * 배경색 8종 — 살구빛 피부와 부드러운 상의를 받쳐 주는 밝은 파스텔.
 * 저장된 배경색 인덱스를 유지하도록 순서는 바꾸지 않는다.
 */
export const AVATAR_COLORS = [
  { id: "peach", label: "살구", value: "#f7ded8" },
  { id: "butter", label: "버터", value: "#f6ebc9" },
  { id: "sage", label: "세이지", value: "#dde8d5" },
  { id: "sky", label: "하늘", value: "#dceaf4" },
  { id: "lilac", label: "라일락", value: "#e9e0f5" },
  { id: "rose", label: "로즈", value: "#f6dce7" },
  { id: "mint", label: "민트", value: "#d9ebe4" },
  { id: "sand", label: "모래", value: "#ede4d9" },
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
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
        {character.art}
      </svg>
    </span>
  );
}
