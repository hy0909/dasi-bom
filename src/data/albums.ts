import { type Album, defaultAlbum } from "@/data/album";
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
    cover: photosOf(defaultAlbum.id)[0].src,
    coverAlt: "해질 녘 에펠탑을 함께 바라보는 가족",
  },
  {
    id: "jeju",
    inviteCode: "JEJU",
    title: "제주 가족여행",
    startDate: "2024-05-03",
    endDate: "2024-05-06",
    description: "사촌들까지 다 모인 3박 4일. 바다와 오름을 돌아다닌 기록이에요.",
    status: "완료",
    cover: photosOf("jeju")[0].src,
    coverAlt: "제주 바닷가 난간에서 바다를 바라보는 뒷모습",
  },
  {
    id: "summer",
    inviteCode: "SUMMER",
    title: "할머니와 보낸 여름",
    startDate: "2024-08-02",
    endDate: "2024-08-11",
    description: "방학 내내 할머니 댁에서 지낸 여름의 기록이에요.",
    status: "기록 중",
    cover: photosOf("summer")[0].src,
    coverAlt: "숲에서 아이들과 함께 있는 할머니의 뒷모습",
  },
  {
    id: "seaside",
    inviteCode: "SEA",
    title: "바닷가 산책",
    startDate: "2024-09-21",
    endDate: "2024-09-21",
    description: "특별할 것 없던 하루가 제일 오래 남았어요.",
    status: "기록 중",
    cover: photosOf("seaside")[0].src,
    coverAlt: "바닷가를 나란히 걷는 어른과 아이의 뒷모습",
  },
];
