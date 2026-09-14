export type Photo = {
  src: string;
  title: string;
  date: string;
  place: string;
  status: string;
};

export const photos: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
    title: "파리에 도착한 첫날",
    date: "2023. 07. 10",
    place: "Paris, France",
    status: "이야기 완성",
  },
  {
    src: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85",
    title: "다 함께한 저녁 식사",
    date: "2023. 07. 11",
    place: "Paris, France",
    status: "답변 기다리는 중",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
    title: "여행의 마지막 날",
    date: "2023. 07. 17",
    place: "Rome, Italy",
    status: "AI 정리 중",
  },
];
