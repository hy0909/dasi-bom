import { type Album, daysAgo, defaultAlbum } from "@/data/album";
import { photosOf } from "@/data/photos";

/** 목록·상세에서 함께 쓰는 앨범 한 벌 — 대표 사진까지 포함한다. */
export type AlbumCardData = Album & {
  cover: string;
  coverAlt: string;
};

/**
 * 앱이 들고 시작하는 앨범 목록.
 * 첫 칸은 기본 앨범이고, 사진·참여자는 앨범 id 와 초대 코드로 각자의 데이터에 묶인다.
 */
export const initialAlbums: AlbumCardData[] = [
  {
    ...defaultAlbum,
    coverColor: "brown",
    cover: photosOf(defaultAlbum.id)[0].src,
    coverAlt: "해질 녘 에펠탑을 함께 바라보는 가족",
  },
  {
    id: "jeju",
    inviteCode: "JEJU",
    // 초대한 지 오래된 앨범 — 링크가 이미 만료돼 새로 만들어야 한다.
    inviteIssuedAt: daysAgo(23),
    title: "제주 가족여행",
    coverColor: "blue",
    // 정사각 판형에 가로로 긴 타원 창 — 만들 때 고를 수 있는 판형·창의 예
    coverShape: "square",
    coverFrame: "oval",
    startDate: "2024-05-03",
    endDate: "2024-05-06",
    description: "사촌들까지 다 모인 3박 4일. 바다와 오름을 돌아다닌 기록이에요.",
    cover: photosOf("jeju")[0].src,
    coverAlt: "제주 바닷가 난간에서 바다를 바라보는 뒷모습",
  },
  {
    id: "summer",
    inviteCode: "SUMMER",
    inviteIssuedAt: daysAgo(1),
    title: "할머니와 보낸 여름",
    coverColor: "green",
    // 금박 몰딩을 두른 고전 액자 창
    coverFrame: "baroque",
    startDate: "2024-08-02",
    endDate: "2024-08-11",
    description: "방학 내내 할머니 댁에서 지낸 여름의 기록이에요.",
    cover: photosOf("summer")[0].src,
    coverAlt: "숲에서 아이들과 함께 있는 할머니의 뒷모습",
  },
  {
    id: "seaside",
    inviteCode: "SEA",
    inviteIssuedAt: daysAgo(6),
    title: "바닷가 산책",
    coverColor: "skyblue",
    startDate: "2024-09-21",
    endDate: "2024-09-21",
    description: "특별할 것 없던 하루가 제일 오래 남았어요.",
    cover: photosOf("seaside")[0].src,
    coverAlt: "바닷가를 나란히 걷는 어른과 아이의 뒷모습",
  },
  {
    // 사진을 많이 넣은 앨범의 예 — 50장. 책등이 두껍게 보인다.
    id: "school1",
    inviteCode: "SCH1",
    inviteIssuedAt: daysAgo(3),
    title: "첫째 초등학교 1학년",
    startDate: "2025-03-03",
    endDate: "2025-12-31",
    description: "입학식부터 종업식까지, 1학년 한 해를 사진 50장으로 모았어요.",
    coverColor: "red",
    // 가로 판형에 표지를 사진으로 가득 채운 예
    coverShape: "landscape",
    coverFrame: "photo",
    cover: photosOf("school1")[0].src,
    coverAlt: "입학식 아침의 아이",
  },
];
