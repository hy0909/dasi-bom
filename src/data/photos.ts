export type Photo = {
  src: string;
  title: string;
  /** 촬영 시각 (로컬 기준 ISO) — 화면에 보이는 날짜·시간은 모두 이 값에서 만든다. */
  takenAt: string;
  place: string;
  /** 사진 위에 짧게 붙일 장소 이름 */
  shortPlace: string;
  status: string;
};

export const photos: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1638290046742-b5030c6b56b4?auto=format&fit=crop&w=1200&q=85",
    title: "파리에 도착한 첫날",
    takenAt: "2023-07-10T20:12:00",
    place: "Paris, France",
    shortPlace: "파리",
    status: "기록 완성",
  },
  {
    src: "https://images.unsplash.com/photo-1747409729637-646f000b9bf9?auto=format&fit=crop&w=1200&q=85",
    title: "다 함께한 저녁 식사",
    takenAt: "2023-07-11T19:40:00",
    place: "Paris, France",
    shortPlace: "파리",
    status: "답변 기다리는 중",
  },
  {
    src: "https://images.unsplash.com/photo-1777466966234-ed84dd087a94?auto=format&fit=crop&w=1200&q=85",
    title: "여행의 마지막 날",
    takenAt: "2023-07-17T09:23:00",
    place: "Rome, Italy",
    shortPlace: "로마",
    status: "AI 정리 중",
  },
];

/** 2023년 7월 11일 */
export function formatDate(takenAt: string) {
  const d = new Date(takenAt);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 오전 9시 23분 */
export function formatTime(takenAt: string) {
  const d = new Date(takenAt);
  const hour = d.getHours();
  const meridiem = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${meridiem} ${hour12}시 ${d.getMinutes()}분`;
}

/** 7. 11 — 연대표처럼 좁은 자리용 */
export function formatShortDate(takenAt: string) {
  const d = new Date(takenAt);
  return `${d.getMonth() + 1}. ${d.getDate()}`;
}
