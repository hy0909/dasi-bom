import { cn } from "@/lib/utils";
import momSrc from "@/assets/avatars/mom.png";
import dadSrc from "@/assets/avatars/dad.png";
import sonSrc from "@/assets/avatars/son.png";
import daughterSrc from "@/assets/avatars/daughter.png";

/**
 * 프로필 캐릭터 — 가족 구성원 4종.
 * 계정의 tone 이 캐릭터 인덱스, color 가 배경색 인덱스다. 사진 업로드 대신 이 조합을 고른다.
 */
export type Character = {
  id: string;
  label: string;
  src: string;
};

/**
 * 그림체 — 마커로 그린 손그림 초상. 배경을 지운 PNG 를 배경색 원 위에 얹는다.
 * 넷 다 눈높이와 눈–입 거리를 맞춰 잘라 두었다 — 원 안에서 얼굴 크기와 자리가 같아 보이도록.
 * 눈·입을 기준으로 삼은 건 머리 모양에 흔들리지 않아서다. 턱선이나 얼굴 폭은
 * 머리카락이 볼을 덮는 만큼 좁게 읽혀 넷이 제각각으로 커지고 작아진다.
 * 어른 둘은 검은 선, 아이 둘은 주황 선으로 그려져 나이가 선 색으로도 갈린다.
 */

/** 저장된 인덱스에 맞춰 엄마 → 아빠 → 아들 → 딸 순서를 유지한다. */
export const CHARACTERS: Character[] = [
  { id: "mom", label: "엄마", src: momSrc },
  { id: "dad", label: "아빠", src: dadSrc },
  { id: "son", label: "아들", src: sonSrc },
  { id: "daughter", label: "딸", src: daughterSrc },
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
      <img src={character.src} alt="" draggable={false} className="size-full object-cover" />
    </span>
  );
}
