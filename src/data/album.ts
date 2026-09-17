export type Album = {
  id: string;
  /** 앨범마다 다른 초대 코드 — 참여 링크가 이 값에 묶인다. */
  inviteCode: string;
  /** 지금 쓰는 초대 코드를 발급한 시각(ISO) — 여기서 일주일이 유효 기간이다. */
  inviteIssuedAt: string;
  title: string;
  /** yyyy-mm-dd — 입력 필드 값 그대로 */
  startDate: string;
  endDate: string;
  description: string;
  /** 커버 색 — 만들 때 고른다. 없으면 id 로 정해지는 기본색. */
  coverColor?: CoverColorId;
  /** 표지 판형 — 만들 때 고른다. 없으면 세로형(4:5). */
  coverShape?: CoverShapeId;
  /** 표지에서 사진이 앉는 자리 — 만들 때 고른다. 없으면 기본 창. */
  coverFrame?: CoverFrameId;
};

/**
 * 앨범 판형 — 만들 때 고르는 세 가지 표지 비율.
 * aspect 는 세로/가로 — 열림 모션과 상세 hero 가 이 값으로 앨범의 자리를 잡는다.
 */
export const COVER_SHAPES = [
  { id: "portrait", label: "세로형", ratio: "4:5", aspect: 5 / 4, cls: "aspect-[4/5]" },
  { id: "square", label: "정사각형", ratio: "1:1", aspect: 1, cls: "aspect-square" },
  { id: "landscape", label: "가로형", ratio: "4:3", aspect: 3 / 4, cls: "aspect-[4/3]" },
] as const;
export type CoverShapeId = (typeof COVER_SHAPES)[number]["id"];

/** 고르지 않았으면 세로형 — 지금까지의 앨범은 모두 이 판형이다. */
export function coverShapeOf(album: Pick<Album, "coverShape">) {
  return COVER_SHAPES.find((s) => s.id === album.coverShape) ?? COVER_SHAPES[0];
}

/** 표지에서 사진이 보이는 자리 — 만들 때 고르는 다섯 가지. */
export const COVER_FRAMES = [
  { id: "window", label: "기본 창", hint: "사진 비율 그대로 파인 창" },
  { id: "lettering", label: "레터링 표지", hint: "사진 없이 로즈골드 박 레터링만" },
  { id: "square", label: "정사각 창", hint: "정사각 안에 사진 전체" },
  { id: "oval", label: "타원 창", hint: "가로로 긴 타원" },
  { id: "photo", label: "사진 표지", hint: "표지를 사진으로 가득" },
] as const;
export type CoverFrameId = (typeof COVER_FRAMES)[number]["id"];

/** 고르지 않았으면 기본 창 — 지금까지의 앨범은 모두 이 창이다. */
export function coverFrameOf(album: Pick<Album, "coverFrame">) {
  return COVER_FRAMES.find((f) => f.id === album.coverFrame) ?? COVER_FRAMES[0];
}

/** 앨범 커버 색 — 만들 때 고르는 11가지. */
export const COVER_COLORS = [
  { id: "blue", label: "파랑", hex: "#3C9FFF" },
  { id: "skyblue", label: "하늘", hex: "#30C2F1" },
  { id: "red", label: "빨강", hex: "#FF6769" },
  { id: "violet", label: "보라", hex: "#AE8AFF" },
  { id: "gray", label: "회색", hex: "#9DA1AA" },
  { id: "yellow", label: "노랑", hex: "#F3BE00" },
  { id: "pink", label: "핑크", hex: "#F791DE" },
  { id: "orange", label: "오렌지", hex: "#F98E2A" },
  { id: "turquoise", label: "청록", hex: "#26C8A2" },
  { id: "brown", label: "갈색", hex: "#CBAD70" },
  { id: "green", label: "초록", hex: "#36D72E" },
] as const;
export type CoverColorId = (typeof COVER_COLORS)[number]["id"];

/** 고른 색이 없으면 앨범 id 로 하나를 고정한다 — 같은 앨범은 늘 같은 색. */
export function coverColorOf(album: Pick<Album, "id" | "coverColor">) {
  const picked = COVER_COLORS.find((c) => c.id === album.coverColor);
  if (picked) return picked;
  let h = 0;
  for (let i = 0; i < album.id.length; i++) h = (h * 31 + album.id.charCodeAt(i)) >>> 0;
  return COVER_COLORS[h % COVER_COLORS.length];
}

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number) {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * 커버 천의 색.
 * fabric(A안): 고른 색을 채도 낮추고 어둡게 — 레퍼런스의 갈색 패브릭처럼 차분한 톤.
 * vivid(B안): 고른 색 그대로에 살짝만 어둡게 — 천 질감을 얹어도 색이 쨍하게 남는다.
 */
export function coverFabricTone(hex: string, variant: "fabric" | "vivid") {
  const [h, s, l] = hexToHsl(hex);
  if (variant === "vivid") return hslToHex(h, Math.min(1, s * 0.95), l * 0.88);
  return hslToHex(h, Math.min(s, 0.42), 0.3);
}

/** 배너 배경 — A안은 쨍한 색 그대로, B안은 그 색의 연한 톤. */
export function coverBannerTone(hex: string, variant: "fabric" | "vivid") {
  if (variant === "fabric") return hex;
  const [h, s] = hexToHsl(hex);
  return hslToHex(h, Math.min(s, 0.7), 0.9);
}

/** 배경 위 글자색 — 밝은 배경이면 먹색, 어두우면 흰색. */
export function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum =
    0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return lum > 0.4 ? "#201515" : "#ffffff";
}

/** 초대 링크 유효 기간 — 발급일로부터 일주일. */
export const INVITE_DAYS = 7;

/** 며칠 전 시각 — 예시 데이터가 오늘을 기준으로 늘 말이 되도록 만든다. */
export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** 이 링크가 만료되는 시각 */
export function inviteExpiresAt({ inviteIssuedAt }: Pick<Album, "inviteIssuedAt">) {
  return new Date(new Date(inviteIssuedAt).getTime() + INVITE_DAYS * 86_400_000);
}

export function isInviteExpired(album: Pick<Album, "inviteIssuedAt">, now = new Date()) {
  return inviteExpiresAt(album).getTime() <= now.getTime();
}

/** 만료까지 남은 날 — 0 이면 오늘이 마지막 날이다. */
export function inviteDaysLeft(album: Pick<Album, "inviteIssuedAt">, now = new Date()) {
  const ms = inviteExpiresAt(album).getTime() - now.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** 2026년 9월 22일 */
export function formatKoreanDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 링크를 새로 발급할 때 쓰는 코드 — 앨범마다 겹치지 않게 짧게 만든다. */
export function newInviteCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export const defaultAlbum: Album = {
  id: "eu23",
  inviteCode: "EU23",
  inviteIssuedAt: daysAgo(2),
  title: "2023년 유럽여행",
  startDate: "2023-07-10",
  endDate: "2023-07-17",
  description: "가족들과 처음 떠난 유럽여행의 사진과 기록을 모았어요.",
};

/**
 * 사진의 촬영 시각에서 뽑은 기간 — 가장 이른 사진이 시작일, 가장 늦은 사진이 종료일이다.
 * 사진이 없으면 기간도 없다.
 */
export function photoPeriod(photos: { takenAt: string }[]) {
  if (photos.length === 0) return { startDate: "", endDate: "" };
  let first = photos[0].takenAt;
  let last = photos[0].takenAt;
  for (const { takenAt } of photos) {
    if (takenAt < first) first = takenAt;
    if (takenAt > last) last = takenAt;
  }
  return { startDate: first.slice(0, 10), endDate: last.slice(0, 10) };
}

/**
 * 화면에 보이는 앨범 기간.
 * 날짜를 적어 둔 앨범은 적은 대로 쓰고, 비워 둔 앨범은 사진의 촬영 날짜로 채운다.
 * 한쪽만 적어 두면 나머지 한쪽만 사진에서 채운다.
 */
export function albumPeriod(
  album: Pick<Album, "startDate" | "endDate">,
  photos: { takenAt: string }[],
) {
  const fromPhotos = photoPeriod(photos);
  return {
    startDate: album.startDate || fromPhotos.startDate,
    endDate: album.endDate || fromPhotos.endDate,
    /** 사진에서 채운 날짜인가 — 앨범 정보 화면이 이 사실을 알려준다. */
    auto: {
      start: !album.startDate && !!fromPhotos.startDate,
      end: !album.endDate && !!fromPhotos.endDate,
    },
  };
}

/** 2023년 7월 10일 - 7월 17일 — 같은 해면 뒤쪽 연도는 생략한다. */
export function formatAlbumPeriod({ startDate, endDate }: Pick<Album, "startDate" | "endDate">) {
  if (!startDate) return "";
  const start = new Date(startDate);
  const head = `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일`;
  if (!endDate) return head;

  const end = new Date(endDate);
  const tail =
    end.getFullYear() === start.getFullYear()
      ? `${end.getMonth() + 1}월 ${end.getDate()}일`
      : `${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일`;
  return `${head} - ${tail}`;
}

/** 2023년 7월 10일 — 목록 카드처럼 폭이 좁은 자리에서는 시작일만 보여준다. */
export function formatAlbumStart({ startDate }: Pick<Album, "startDate">) {
  return formatAlbumPeriod({ startDate, endDate: "" });
}
