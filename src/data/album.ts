/** 앨범 상태 — 진행률(%) 대신 앨범 생성자가 직접 고르는 두 상태. */
export type AlbumStatus = "기록 중" | "완료";

export type Album = {
  title: string;
  /** yyyy-mm-dd — 입력 필드 값 그대로 */
  startDate: string;
  endDate: string;
  description: string;
  status: AlbumStatus;
};

export const defaultAlbum: Album = {
  title: "2023년 유럽여행",
  startDate: "2023-07-10",
  endDate: "2023-07-17",
  description: "가족들과 처음 떠난 유럽여행의 사진과 기록을 모았어요.",
  status: "기록 중",
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
