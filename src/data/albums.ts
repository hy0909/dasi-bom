import type { Album } from "@/data/album";

export type AlbumCardData = Album & {
  id: string;
  cover: string;
  coverAlt: string;
  photoCount: number;
  /** 함께하는 사람들의 캐릭터·배경색 */
  members: { character: number; color: number }[];
};

/**
 * 목록을 채우는 예시 앨범.
 * 첫 칸은 App 이 들고 있는 편집 가능한 앨범이고, 아래는 보여주기용 고정 데이터다.
 */
export const sampleAlbums: AlbumCardData[] = [
  {
    id: "jeju",
    title: "제주 가족여행",
    startDate: "2024-05-03",
    endDate: "2024-05-06",
    description: "",
    status: "완료",
    cover:
      "https://images.unsplash.com/photo-1621352973597-a53f65a96336?auto=format&fit=crop&w=800&q=80",
    coverAlt: "제주 바닷가 난간에서 바다를 바라보는 뒷모습",
    photoCount: 12,
    members: [
      { character: 0, color: 5 },
      { character: 1, color: 3 },
      { character: 3, color: 1 },
    ],
  },
  {
    id: "summer",
    title: "할머니와 보낸 여름",
    startDate: "2024-08-02",
    endDate: "2024-08-11",
    description: "",
    status: "기록 중",
    cover:
      "https://images.unsplash.com/photo-1539093180677-52c07443275b?auto=format&fit=crop&w=800&q=80",
    coverAlt: "숲에서 아이들과 함께 있는 할머니의 뒷모습",
    photoCount: 8,
    members: [
      { character: 0, color: 2 },
      { character: 2, color: 6 },
    ],
  },
  {
    id: "seaside",
    title: "바닷가 산책",
    startDate: "2024-09-21",
    endDate: "2024-09-21",
    description: "",
    status: "기록 중",
    cover:
      "https://images.unsplash.com/photo-1685326480610-90023e19220d?auto=format&fit=crop&w=800&q=80",
    coverAlt: "바닷가를 나란히 걷는 어른과 아이의 뒷모습",
    photoCount: 5,
    members: [
      { character: 3, color: 4 },
      { character: 0, color: 0 },
      { character: 1, color: 7 },
      { character: 2, color: 6 },
    ],
  },
];
