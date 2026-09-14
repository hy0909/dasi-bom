export type Photo = {
  src: string;
  title: string;
  date: string;
  place: string;
  status: string;
};

export const photos: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1638290046742-b5030c6b56b4?auto=format&fit=crop&w=1200&q=85",
    title: "파리에 도착한 첫날",
    date: "2023. 07. 10",
    place: "Paris, France",
    status: "이야기 완성",
  },
  {
    src: "https://images.unsplash.com/photo-1747409729637-646f000b9bf9?auto=format&fit=crop&w=1200&q=85",
    title: "다 함께한 저녁 식사",
    date: "2023. 07. 11",
    place: "Paris, France",
    status: "답변 기다리는 중",
  },
  {
    src: "https://images.unsplash.com/photo-1777466966234-ed84dd087a94?auto=format&fit=crop&w=1200&q=85",
    title: "여행의 마지막 날",
    date: "2023. 07. 17",
    place: "Rome, Italy",
    status: "AI 정리 중",
  },
];
