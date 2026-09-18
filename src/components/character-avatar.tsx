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

/**
 * 그림체 — 납작한 벡터 일러스트로 그린 동양인 가족 넷.
 * 검은 머리와 따뜻한 살구빛 피부, 발그레한 볼, 점에 가까운 눈과 짧은 미소.
 * 선을 두르지 않고 면으로만 그린다. 그늘과 그러데이션도 쓰지 않는다.
 * 나이와 사람은 머리 모양과 상의 색으로 가른다 —
 * 엄마·아빠는 30대 중반, 딸·아들은 10~20대로 같은 또래다.
 */
const SKIN = "#f7d3b6";
const SKIN_SHADE = "#e9bb99";
const HAIR = "#2b2931";
const BLUSH = "#f0a099";
const EYE = "#332e2e";
const BROW = "#4a4048";
const MOUTH = "#c26a5c";

/** 얼굴 — 넷이 같은 턱선을 쓰고, 눈 크기와 입만 나이를 따라 조금 달라진다. */
const FACE =
  "M60 20c-16 0-27 10-27 25 0 11 3 20 9 26 5 5 11 8 18 8s13-3 18-8c6-6 9-15 9-26 0-15-11-25-27-25z";
/** 목 — 턱 아래 그늘진 살 */
const NECK = "M52 68h16v15c0 4-4 7-8 7s-8-3-8-7z";
/** 어깨 — 상의 색만 갈아 끼운다 */
const SHOULDERS = "M9 122v-9c0-15 13-25 29-27l22-3 22 3c16 2 29 12 29 27v9z";

/** 눈·볼·입 — 어른은 가는 눈웃음, 아이는 조금 큰 눈과 활짝 웃는 입 */
function FaceParts({ young = false }: { young?: boolean }) {
  return (
    <>
      <ellipse cx="48" cy="50" rx={young ? 3.8 : 3.2} ry={young ? 4.6 : 4} fill={EYE} />
      <ellipse cx="72" cy="50" rx={young ? 3.8 : 3.2} ry={young ? 4.6 : 4} fill={EYE} />
      <ellipse cx="38" cy="60" rx={young ? 7 : 6} ry={young ? 4.2 : 3.4} fill={BLUSH} opacity={young ? 0.55 : 0.42} />
      <ellipse cx="82" cy="60" rx={young ? 7 : 6} ry={young ? 4.2 : 3.4} fill={BLUSH} opacity={young ? 0.55 : 0.42} />
      <path d="M59 55q2 3 3 1" fill="none" stroke={SKIN_SHADE} strokeWidth="2" strokeLinecap="round" />
      {young ? (
        <path d="M53 62h14c0 5-3 8-7 8s-7-3-7-8z" fill={MOUTH} />
      ) : (
        <path d="M54 63q6 5 12 0" fill="none" stroke={MOUTH} strokeWidth="2.6" strokeLinecap="round" />
      )}
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
        {/* 30대 중반 — 어깨를 덮는 긴 머리, 라일락 니트 */}
        <path
          d="M60 11c-21 0-33 15-33 35 0 17 1 33 4 46h13c-4-16-5-32-4-45 8 6 14 8 20 8s12-2 20-8c1 13 0 29-4 45h13c3-13 4-29 4-46 0-20-12-35-33-35z"
          fill={HAIR}
        />
        <path d={NECK} fill={SKIN_SHADE} />
        <path d={SHOULDERS} fill="#b3a2dc" />
        <path d="M45 87q15 12 30 0" fill="none" stroke="#a08fd0" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="33" cy="52" rx="5" ry="7" fill={SKIN} />
        <ellipse cx="87" cy="52" rx="5" ry="7" fill={SKIN} />
        <path d={FACE} fill={SKIN} />
        {/* 한쪽으로 넘긴 앞머리 */}
        <path d="M60 15c-16 0-27 11-27 27 0 4 0 7 1 10 1-9 4-15 8-19 7 5 14 7 22 7 6 0 12-1 16-4 3 4 5 9 6 16 1-3 1-6 1-10 0-16-11-27-27-27z" fill={HAIR} />
        <path d="M41 41q6-4 12-1m14 0q6-3 12 1" fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round" />
        <FaceParts />
      </>
    ),
  },
  {
    id: "dad",
    label: "아빠",
    art: (
      <>
        {/* 30대 중반 — 짧게 친 머리, 하늘색 셔츠 */}
        <path d={NECK} fill={SKIN_SHADE} />
        <path d={SHOULDERS} fill="#8fb6e4" />
        {/* 셔츠 깃 */}
        <path d="M49 84 60 97l11-13" fill="none" stroke="#7aa3d4" strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="33" cy="52" rx="5" ry="7" fill={SKIN} />
        <ellipse cx="87" cy="52" rx="5" ry="7" fill={SKIN} />
        <path d={FACE} fill={SKIN} />
        <path d="M60 13c-17 0-28 11-28 28 0 5 1 9 2 12 1-9 3-15 7-19 6 4 13 6 19 6 7 0 14-2 20-7 4 4 6 11 7 20 1-3 2-7 2-12 0-17-11-28-29-28z" fill={HAIR} />
        <path d="M41 40q6-4 12-1m14 0q6-3 12 1" fill="none" stroke={BROW} strokeWidth="2.4" strokeLinecap="round" />
        <FaceParts />
      </>
    ),
  },
  {
    id: "son",
    label: "아들",
    art: (
      <>
        {/* 10~20대 — 이마를 덮는 짧은 머리, 초록 티셔츠 */}
        <path d={NECK} fill={SKIN_SHADE} />
        <path d={SHOULDERS} fill="#8ecb9b" />
        <path d="M46 86q14 11 28 0" fill="none" stroke="#77b585" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="33" cy="52" rx="5" ry="7" fill={SKIN} />
        <ellipse cx="87" cy="52" rx="5" ry="7" fill={SKIN} />
        <path d={FACE} fill={SKIN} />
        <path d="M60 14c-16 0-27 10-27 26 0 4 0 7 1 10 2-7 4-12 7-15 5 4 12 6 19 6s14-2 19-6c3 3 5 8 7 15 1-3 1-6 1-10 0-16-11-26-27-26z" fill={HAIR} />
        <path d="M42 41q6-3 11-1m14 0q5-2 11 1" fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round" />
        <FaceParts young />
      </>
    ),
  },
  {
    id: "daughter",
    label: "딸",
    art: (
      <>
        {/* 10~20대 — 앞머리를 내리고 양갈래로 묶은 머리, 코랄 티셔츠 */}
        <path
          d="M60 12c-19 0-31 14-31 33 0 14 1 27 3 37h12c-3-13-4-26-3-36 7 5 13 7 19 7s12-2 19-7c1 10 0 23-3 36h12c2-10 3-23 3-37 0-19-12-33-31-33z"
          fill={HAIR}
        />
        <path d={NECK} fill={SKIN_SHADE} />
        <path d={SHOULDERS} fill="#f09274" />
        <path d="M46 86q14 11 28 0" fill="none" stroke="#dc7c5f" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="33" cy="52" rx="5" ry="7" fill={SKIN} />
        <ellipse cx="87" cy="52" rx="5" ry="7" fill={SKIN} />
        <path d={FACE} fill={SKIN} />
        {/* 눈썹까지 내린 앞머리 */}
        <path d="M60 15c-16 0-27 11-27 27 0 4 0 7 1 10 1-8 3-13 6-17 6 4 13 6 20 6s14-2 20-6c3 4 5 9 6 17 1-3 1-6 1-10 0-16-11-27-27-27z" fill={HAIR} />
        {/* 양갈래 */}
        <ellipse cx="26" cy="74" rx="8" ry="11" fill={HAIR} />
        <ellipse cx="94" cy="74" rx="8" ry="11" fill={HAIR} />
        <path d="M42 41q6-3 11-1m14 0q5-2 11 1" fill="none" stroke={BROW} strokeWidth="2" strokeLinecap="round" />
        <FaceParts young />
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
