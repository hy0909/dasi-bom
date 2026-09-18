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
 * 그림체 — 굵은 펠트펜과 불투명 마커로 한 번에 그린 순진한 낙서.
 * 몸은 크게 부풀리고 머리와 손은 눌러 줄인다. 눈은 점, 코는 삐뚠 한 획, 입은 짧은 획.
 * 선은 한 번에 긋고 다시 덧그리지 않는다 — 굵기가 고르지 않고 이음매가 어긋나도 그대로 둔다.
 * 큰 윤곽은 안쪽 획보다 두 배 굵고(7 : 3.5), 색은 인물마다 한 가지 진한 색과 작은 강조색 하나뿐이다.
 * 색은 넓은 마커 자국으로 쓸어 칠해 띠와 틈이 보이게 하고, 나머지 면은 종이 그대로 둔다.
 * 그늘·번짐·그러데이션은 쓰지 않는다.
 */
/** 종이 — 면을 채우지 않은 자리는 전부 이 색이다 */
const PAPER = "#fffdf6";
/** 눈처럼 아주 작은 자리에만 쓰는 진한 색 */
const MARK = "#3b322c";

/** 얼굴 — 점 두 개, 삐뚠 코 한 획, 짧은 입. 인물마다 이것만 공유한다. */
function FaceMarks({ ink, tight = false }: { ink: string; tight?: boolean }) {
  const gap = tight ? 7 : 9;
  return (
    <>
      <circle cx={60 - gap} cy="44" r="3.4" fill={MARK} />
      <circle cx={61 + gap} cy="45" r="3.2" fill={MARK} />
      <path d="M61 50l-2 6h3" stroke={ink} strokeWidth="3" />
      <path d="M54 62q6 5 12 0" stroke={ink} strokeWidth="3.5" />
    </>
  );
}

/** 저장된 인덱스에 맞춰 엄마 → 아빠 → 아들 → 딸 순서를 유지한다. */
/** 어깨 — 넷이 같은 덩어리를 쓴다. 둥근 틀에 잘려 넓은 띠로 보인다 */
const BODY = "M8 122v-6c0-21 23-32 52-32s52 11 52 32v6z";
/** 머리 — 몸보다 작게 눌러 그린 덩어리 */
const HEAD = "M60 20c-16 0-26 10-26 25 0 16 11 27 26 27s26-11 26-27c0-15-10-25-26-25z";

export const CHARACTERS: Character[] = [
  {
    id: "mom",
    label: "엄마",
    art: (
      <>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={BODY} fill={PAPER} stroke="#e04f8e" strokeWidth="7" />
          {/* 옷깃 — 강조색 한 획 */}
          <path d="M49 93q11 8 22 0" stroke="#f2b705" strokeWidth="5" />
          <path d={HEAD} fill={PAPER} stroke="#e04f8e" strokeWidth="7" />
          {/* 긴 머리 — 위를 덮는 한 획, 옆으로 내려오는 두 획. 사이는 종이로 남는다 */}
          <path d="M36 37q24-17 48 0" stroke="#e04f8e" strokeWidth="17" />
          <path d="M33 45q-4 21 1 36" stroke="#e04f8e" strokeWidth="13" />
          <path d="M87 45q4 21-1 36" stroke="#e04f8e" strokeWidth="13" />
          <FaceMarks ink="#e04f8e" />
        </g>
      </>
    ),
  },
  {
    id: "dad",
    label: "아빠",
    art: (
      <>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={BODY} fill={PAPER} stroke="#2e86c8" strokeWidth="7" />
          {/* 상의 — 넓은 마커 자국 두 줄. 끝이 어긋나고 사이에 종이가 보인다 */}
          <path d="M23 105h73" stroke="#2e86c8" strokeWidth="9" />
          <path d="M14 118h94" stroke="#2e86c8" strokeWidth="9" opacity="0.92" />
          <path d="M51 91l10 10 10-10" stroke={PAPER} strokeWidth="6" />
          <path d={HEAD} fill={PAPER} stroke="#2e86c8" strokeWidth="7" />
          {/* 짧은 머리 한 획과 구레나룻 */}
          <path d="M37 34q23-15 46 0" stroke="#2e86c8" strokeWidth="15" />
          <path d="M35 45v8m50-8v8" stroke="#2e86c8" strokeWidth="6" />
          <FaceMarks ink="#2e86c8" />
        </g>
      </>
    ),
  },
  {
    id: "son",
    label: "아들",
    art: (
      <>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={BODY} fill={PAPER} stroke="#35a35f" strokeWidth="7" />
          <path d="M26 106h68" stroke="#35a35f" strokeWidth="9" />
          <path d="M16 118h90" stroke="#35a35f" strokeWidth="9" opacity="0.92" />
          <path d="M49 92q12 8 23 0" stroke="#f2760c" strokeWidth="5" />
          <path d={HEAD} fill={PAPER} stroke="#35a35f" strokeWidth="7" />
          {/* 옆으로 흐르는 앞머리 — 한 번에 긋고 끝만 꺾는다 */}
          <path d="M37 36q20-17 45-3" stroke="#35a35f" strokeWidth="15" />
          <path d="M80 30q7 6 7 15" stroke="#35a35f" strokeWidth="9" />
          <FaceMarks ink="#35a35f" tight />
        </g>
      </>
    ),
  },
  {
    id: "daughter",
    label: "딸",
    art: (
      <>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={BODY} fill={PAPER} stroke="#8b5cd6" strokeWidth="7" />
          <path d="M49 93q11 8 22 0" stroke="#f2b705" strokeWidth="5" />
          {/* 양갈래 — 옆으로 툭 튀어나온 두 덩어리 */}
          <circle cx="27" cy="55" r="12" fill="#8b5cd6" />
          <circle cx="93" cy="55" r="12" fill="#8b5cd6" />
          <path d={HEAD} fill={PAPER} stroke="#8b5cd6" strokeWidth="7" />
          <path d="M36 36q24-16 48 1" stroke="#8b5cd6" strokeWidth="16" />
          {/* 가르마 한 획과 머리끈 */}
          <path d="M57 25l-4 9" stroke={PAPER} strokeWidth="3.5" />
          <path d="M36 55h5m38 0h5" stroke="#f2760c" strokeWidth="5" />
          <FaceMarks ink="#8b5cd6" tight />
        </g>
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
