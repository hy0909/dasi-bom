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
};

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
