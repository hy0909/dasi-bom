import { useSyncExternalStore } from "react";
import { readPhotoMeta } from "@/lib/exif";
import { NO_PLACE, coordsName, placeOf } from "@/lib/geocode";

export type PhotoStatus = "기록 전" | "기록 완료";

export type Photo = {
  src: string;
  title: string;
  /** 촬영 시각 (로컬 기준 ISO) — 화면에 보이는 날짜·시간은 모두 이 값에서 만든다. */
  takenAt: string;
  place: string;
  /** 사진 위에 짧게 붙일 장소 이름 */
  shortPlace: string;
  /** 사진에 적혀 있던 촬영 좌표(EXIF GPS) — 장소 이름이 여기서 나온다. 없는 사진도 많다. */
  coords?: { lat: number; lon: number };
  /** 촬영 시각을 어디서 읽었는지 — EXIF 가 없으면 파일 시각으로 갈음한 것이다. */
  takenAtFrom?: "exif" | "file";
  /** 사진 한 장의 기록 상태 — 앨범 상태와 같은 두 가지만 쓴다 */
  status: PhotoStatus;
  /** 대체 텍스트 — 비워두면 제목을 읽는다 */
  alt?: string;
  /** 사진에 달린 목소리 — 가족이 남긴 음성 기록 */
  voices?: PhotoVoice[];
  /** AI 가 가족의 기록을 모아 정리한 글. 기록이 끝난 사진에만 있다. */
  story?: string;
};

/**
 * 사진들이 찍힌 곳을 한 줄로 — '파리', 여러 곳이면 '파리 외 +1'.
 * 가장 많이 찍힌 곳을 앞에 두고, 나머지 장소가 몇 군데인지만 뒤에 붙인다.
 * 장소를 모르는 사진('위치 없음')은 세지 않는다.
 */
export function placeSummary(photos: Pick<Photo, "shortPlace">[]) {
  const counts = new Map<string, number>();
  for (const { shortPlace } of photos) {
    const name = shortPlace?.trim();
    if (!name || name === NO_PLACE.shortPlace) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  if (counts.size === 0) return "";
  // 가장 많이 찍힌 곳 — 수가 같으면 먼저 나온 곳이 앞이다
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return counts.size === 1 ? top : `${top} 외 +${counts.size - 1}`;
}

/**
 * 사진 한 장의 기록 상태.
 * 목소리든 글이든 하나라도 남았으면 기록 완료다 — 화면마다 다르게 세지 않도록 여기 한 곳에서 정한다.
 */
export function photoStatus(photo: Pick<Photo, "voices" | "story">): PhotoStatus {
  const recorded = (photo.voices?.length ?? 0) > 0 || Boolean(photo.story?.trim());
  return recorded ? "기록 완료" : "기록 전";
}

export type PhotoVoice = {
  /** 목소리를 남긴 가족 */
  name: string;
  /** 길이(초) — 화면에는 0:37 형태로 보인다 */
  seconds: number;
};

/**
 * 사진은 앨범마다 따로 있다 — 상세 화면의 사진·목소리·기록·연대표가 모두 이 목록에서 나온다.
 * 키는 앨범의 id.
 */
export const photosByAlbum: Record<string, Photo[]> = {
  eu23: [
    {
      src: "https://images.unsplash.com/photo-1638290046742-b5030c6b56b4?auto=format&fit=crop&w=1200&q=85",
      title: "파리에 도착한 첫날",
      takenAt: "2023-07-10T20:12:00",
      place: "Paris, France",
      shortPlace: "파리",
      status: "기록 완료",
      alt: "해질 녘 에펠탑을 함께 바라보는 가족",
      voices: [{ name: "엄마", seconds: 37 }],
      story:
        "긴 이동 끝에 도착한 첫날이었어요. 숙소에 짐만 내려놓고 다 같이 나와, 해가 완전히 질 때까지 탑 앞에 앉아 있었대요. 엄마는 그날 바람이 생각보다 차가웠던 게 제일 먼저 떠오른다고 하셨어요.",
    },
    {
      src: "https://images.unsplash.com/photo-1747409729637-646f000b9bf9?auto=format&fit=crop&w=1200&q=85",
      title: "다 함께한 저녁 식사",
      takenAt: "2023-07-11T19:40:00",
      place: "Paris, France",
      shortPlace: "파리",
      status: "기록 전",
      alt: "조명 아래에서 다 함께한 저녁 식사",
      voices: [{ name: "엄마", seconds: 21 }],
    },
    {
      src: "https://images.unsplash.com/photo-1777466966234-ed84dd087a94?auto=format&fit=crop&w=1200&q=85",
      title: "여행의 마지막 날",
      takenAt: "2023-07-17T09:23:00",
      place: "Rome, Italy",
      shortPlace: "로마",
      status: "기록 전",
      alt: "여행 마지막 날 아침의 거리",
    },
  ],
  jeju: [
    {
      src: "https://images.unsplash.com/photo-1621352973597-a53f65a96336?auto=format&fit=crop&w=1200&q=85",
      title: "바다를 마주한 첫날",
      takenAt: "2024-05-03T15:20:00",
      place: "제주 애월",
      shortPlace: "애월",
      status: "기록 완료",
      alt: "제주 바닷가 난간에서 바다를 바라보는 뒷모습",
      voices: [
        { name: "엄마", seconds: 42 },
        { name: "아버지", seconds: 28 },
      ],
      story:
        "비행기에서 내리자마자 바다부터 보러 갔어요. 난간에 기대 한참을 서 있었는데, 아무도 먼저 가자는 말을 하지 않았다고 해요. 엄마는 그 조용했던 몇 분이 이번 여행에서 제일 좋았다고 하셨어요.",
    },
    {
      src: "https://images.unsplash.com/photo-1628411848698-e3b3249a272a?auto=format&fit=crop&w=1200&q=85",
      title: "성산 가는 길",
      takenAt: "2024-05-04T10:05:00",
      place: "제주 성산",
      shortPlace: "성산",
      status: "기록 완료",
      alt: "바다와 맞닿은 제주 해안 절벽",
      voices: [{ name: "사촌 지우", seconds: 51 }],
      story:
        "아침 일찍 숙소를 나서 해안도로를 따라 달렸어요. 지우는 창문을 내리고 바람을 맞던 순간을 가장 또렷하게 기억한다고 했어요. 중간에 차를 세우고 찍은 사진이 이 한 장이에요.",
    },
    {
      src: "https://images.unsplash.com/photo-1610997999027-681b320cee66?auto=format&fit=crop&w=1200&q=85",
      title: "폭포 앞에서 찍은 사진",
      takenAt: "2024-05-05T13:40:00",
      place: "제주 서귀포",
      shortPlace: "서귀포",
      status: "기록 완료",
      alt: "숲으로 둘러싸인 제주 폭포",
      voices: [
        { name: "아버지", seconds: 33 },
        { name: "사촌 지우", seconds: 19 },
      ],
      story:
        "물소리가 커서 서로 하는 말이 잘 안 들렸대요. 결국 손짓으로만 자리를 맞춰 사진을 찍었고, 그게 더 웃겨서 한참을 웃었다고 해요.",
    },
    {
      src: "https://images.unsplash.com/photo-1612977512598-3b8d6a498bbb?auto=format&fit=crop&w=1200&q=85",
      title: "마지막 날 협재 바다",
      takenAt: "2024-05-06T16:10:00",
      place: "제주 협재",
      shortPlace: "협재",
      status: "기록 완료",
      alt: "에메랄드빛 제주 협재 바다",
      voices: [{ name: "엄마", seconds: 46 }],
      story:
        "돌아가는 비행기 시간까지 두 시간이 남아 바다에 한 번 더 들렀어요. 다들 신발을 벗고 물가까지 걸어 들어갔고, 엄마는 다음에 또 오자는 말을 그때 처음 꺼냈다고 하셨어요.",
    },
  ],
  summer: [
    {
      src: "https://images.unsplash.com/photo-1539093180677-52c07443275b?auto=format&fit=crop&w=1200&q=85",
      title: "할머니 댁 앞 숲길",
      takenAt: "2024-08-02T11:10:00",
      place: "충남 서산",
      shortPlace: "서산",
      status: "기록 완료",
      alt: "숲에서 아이들과 함께 있는 할머니의 뒷모습",
      voices: [{ name: "할머니", seconds: 58 }],
      story:
        "방학 첫날, 할머니가 마중을 나오셨어요. 숲길은 할머니가 어릴 적부터 다니던 길이라고 하셨고, 걸으면서 그 시절 이야기를 들려주셨대요.",
    },
    {
      src: "https://images.unsplash.com/photo-1593100126453-19b562a800c1?auto=format&fit=crop&w=1200&q=85",
      title: "할머니 품에서",
      takenAt: "2024-08-05T18:30:00",
      place: "충남 서산",
      shortPlace: "서산",
      status: "기록 완료",
      alt: "손주를 안고 있는 할머니",
      voices: [{ name: "할머니", seconds: 35 }],
      story:
        "저녁을 먹고 마루에 앉아 있던 참이었어요. 할머니는 이 사진을 보시더니, 그날따라 아이가 유난히 오래 안겨 있었다고 하셨어요.",
    },
    {
      src: "https://images.unsplash.com/photo-1541848756149-e3843fcbbde0?auto=format&fit=crop&w=1200&q=85",
      title: "마당에 핀 꽃",
      takenAt: "2024-08-09T09:15:00",
      place: "충남 서산",
      shortPlace: "서산",
      status: "기록 전",
      alt: "마당에서 꽃을 건네는 할머니",
      voices: [{ name: "할머니", seconds: 17 }],
    },
  ],
  seaside: [
    {
      src: "https://images.unsplash.com/photo-1685326480610-90023e19220d?auto=format&fit=crop&w=1200&q=85",
      title: "나란히 걷던 오후",
      takenAt: "2024-09-21T16:00:00",
      place: "강원 양양",
      shortPlace: "양양",
      status: "기록 완료",
      alt: "바닷가를 나란히 걷는 어른과 아이의 뒷모습",
      voices: [{ name: "딸 서아", seconds: 24 }],
      story:
        "특별한 계획 없이 나선 산책이었어요. 파도 소리 말고는 아무 소리도 없었고, 서아는 그날 모래가 따뜻했던 게 기억난다고 했어요.",
    },
    {
      src: "https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=1200&q=85",
      title: "파도 앞에서",
      takenAt: "2024-09-21T17:05:00",
      place: "강원 양양",
      shortPlace: "양양",
      status: "기록 전",
      alt: "파도 앞에 선 가족의 뒷모습",
    },
    {
      src: "https://images.unsplash.com/photo-1496275068113-fff8c90750d1?auto=format&fit=crop&w=1200&q=85",
      title: "노을이 지던 시간",
      takenAt: "2024-09-21T18:40:00",
      place: "강원 양양",
      shortPlace: "양양",
      status: "기록 전",
      alt: "노을을 배경으로 손을 잡고 선 가족의 실루엣",
    },
  ],
};

/**
 * 사진을 많이 넣은 앨범의 예 — 상한인 20장. 책등 두께·긴 목록·연대표가 어떻게 보이는지 확인하는 목업이다.
 * 이미지는 위 앨범들의 사진을 돌려 쓰고, 날짜는 엿새 여행에 하루 서너 장씩 흩어 둔다.
 */
const POOL = [
  "photo-1638290046742-b5030c6b56b4",
  "photo-1747409729637-646f000b9bf9",
  "photo-1777466966234-ed84dd087a94",
  "photo-1621352973597-a53f65a96336",
  "photo-1610997999027-681b320cee66",
  "photo-1628411848698-e3b3249a272a",
  "photo-1612977512598-3b8d6a498bbb",
  "photo-1539093180677-52c07443275b",
  "photo-1593100126453-19b562a800c1",
  "photo-1541848756149-e3843fcbbde0",
  "photo-1685326480610-90023e19220d",
  "photo-1475503572774-15a45e5d60b9",
  "photo-1496275068113-fff8c90750d1",
];
/** 한 앨범에 담기는 최대 장수(MAX_PHOTOS)만큼 — 가장 두꺼운 앨범이 어떻게 보이는지 보여주는 예시다.
    도쿄에서 교토를 거쳐 오사카로 내려가는 엿새 — 장소가 날짜를 따라 옮겨 간다. */
const JAPAN_TRIP: { title: string; place: string; short: string }[] = [
  { title: "공항 가는 새벽", place: "인천 중구", short: "인천" },
  { title: "첫 비행기", place: "기내", short: "기내" },
  { title: "하네다 도착", place: "일본 도쿄", short: "도쿄" },
  { title: "편의점에서 먹은 첫 끼", place: "일본 도쿄", short: "도쿄" },
  { title: "시부야 건널목", place: "일본 도쿄", short: "도쿄" },
  { title: "골목의 라멘집", place: "일본 도쿄", short: "도쿄" },
  { title: "야경 보러 올라간 밤", place: "일본 도쿄", short: "도쿄" },
  { title: "아사쿠사 절 앞", place: "일본 도쿄", short: "도쿄" },
  { title: "신칸센 창가 자리", place: "기내", short: "이동" },
  { title: "교토 첫 골목", place: "일본 교토", short: "교토" },
  { title: "붉은 문이 끝없이", place: "일본 교토", short: "교토" },
  { title: "기모노 입어 본 날", place: "일본 교토", short: "교토" },
  { title: "말차 아이스크림", place: "일본 교토", short: "교토" },
  { title: "대나무 숲에서", place: "일본 교토", short: "교토" },
  { title: "비 오는 기온 거리", place: "일본 교토", short: "교토" },
  { title: "오사카로 가는 길", place: "일본 오사카", short: "오사카" },
  { title: "도톤보리의 밤", place: "일본 오사카", short: "오사카" },
  { title: "다코야키 줄 서서", place: "일본 오사카", short: "오사카" },
  { title: "오사카성 앞에서", place: "일본 오사카", short: "오사카" },
  { title: "돌아오는 비행기에서", place: "기내", short: "기내" },
];
function japanTripPhotos(): Photo[] {
  return JAPAN_TRIP.map(({ title, place, short }, i) => {
    const day = new Date(2025, 1, 12 + Math.floor(i / 3.5)); // 2월 12일부터 엿새
    const hh = String(8 + (i % 11)).padStart(2, "0");
    const mm = String((i * 17) % 60).padStart(2, "0");
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}T${hh}:${mm}:00`;
    return {
      src: `https://images.unsplash.com/${POOL[i % POOL.length]}?auto=format&fit=crop&w=1200&q=85`,
      title,
      takenAt: iso,
      place,
      shortPlace: short,
      status: i % 3 === 0 ? "기록 완료" : "기록 전",
      voices: i % 4 === 0 ? [{ name: "엄마", seconds: 12 + ((i * 7) % 40) }] : undefined,
      story:
        i % 3 === 0
          ? "그날 있었던 일을 가족이 한 마디씩 남겼어요. 나중에 다시 읽으면 그때 표정이 떠오르는 기록이에요."
          : undefined,
    };
  });
}
photosByAlbum.japan25 = japanTripPhotos();

/**
 * 사진은 업로드로 늘어난다 — 참여자·멤버십과 같은 방식의 작은 스토어를 둔다.
 * 앨범 상세의 사진·기록 탭과 홈의 사진 수가 같은 목록을 본다.
 */
let store: Record<string, Photo[]> = photosByAlbum;
/** 사진이 없는 앨범이 매번 새 배열을 만들지 않도록 하나를 돌려 쓴다. */
const EMPTY: Photo[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 앨범 한 벌의 사진. 새로 만든 앨범처럼 사진이 아직 없으면 빈 목록. */
export function photosOf(albumId: string): Photo[] {
  return store[albumId] ?? EMPTY;
}

/** 한 앨범의 사진을 구독한다 — 사진을 추가하면 이 목록을 쓰는 화면이 다시 그려진다. */
export function useAlbumPhotos(albumId: string): Photo[] {
  const read = () => store[albumId] ?? EMPTY;
  return useSyncExternalStore(subscribe, read, read);
}

/** 여러 앨범의 사진 수를 한 번에 보는 자리(홈·초대 목록)에서 쓴다. */
export function usePhotoStore() {
  return useSyncExternalStore(
    subscribe,
    () => store,
    () => store,
  );
}

/** 촬영 시각이 이른 사진부터 — 앨범 읽기 순서이자 기록을 시작할 순서다. */
export function byTakenAt(list: Photo[]) {
  return [...list].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}

/**
 * 업로드한 사진을 앨범에 넣는다.
 * 넣자마자 촬영 시각순으로 정렬해 두므로, 가장 오래된 사진부터 기록하게 된다.
 * 새 사진은 아직 기록 전이다.
 */
export function addPhotos(albumId: string, added: Photo[]) {
  if (added.length === 0) return;
  store = { ...store, [albumId]: byTakenAt([...(store[albumId] ?? []), ...added]) };
  listeners.forEach((listener) => listener());
}

/**
 * 고른 파일 한 장을 사진으로 바꾼다.
 * 촬영 시각과 촬영 위치는 사진 안에 적혀 있는 EXIF 에서 읽는다.
 * 시각이 없는 사진은 파일 시각으로 갈음하고, 위치가 없으면 '위치 없음'으로 둔다.
 * 좌표를 지명으로 바꾸는 데는 시간이 걸리므로 그 일은 withPlace() 가 맡는다.
 */
export async function photoFromFile(file: File): Promise<Photo> {
  const meta = await readPhotoMeta(file);
  return {
    src: URL.createObjectURL(file),
    title: file.name.replace(/\.[^.]+$/, ""),
    takenAt: meta.takenAt ?? localIso(file.lastModified || Date.now()),
    takenAtFrom: meta.takenAt ? "exif" : "file",
    coords: meta.coords,
    // 지명이 도착하기 전에는 좌표를 그대로 적어 둔다 — 빈칸도, 지어낸 이름도 아니다.
    ...(meta.coords ? coordsName(meta.coords.lat, meta.coords.lon) : NO_PLACE),
    status: "기록 전",
  };
}

/** 좌표를 지명으로 바꿔 채운 사진 — 좌표가 없거나 이름을 못 찾으면 들어온 그대로 돌려준다. */
export async function withPlace(photo: Photo): Promise<Photo> {
  if (!photo.coords) return photo;
  return { ...photo, ...(await placeOf(photo.coords.lat, photo.coords.lon)) };
}

/** 로컬 시계 기준 ISO(초까지) — 촬영 시각은 사진을 찍은 곳의 시계를 그대로 쓴다. */
function localIso(ms: number) {
  const at = new Date(ms);
  return new Date(at.getTime() - at.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

/** 앨범에 도착한 목소리 — 어느 사진에 달렸는지까지 함께 넘긴다. */
export function voicesOf(albumId: string) {
  return photosOf(albumId).flatMap((photo) =>
    (photo.voices ?? []).map((voice) => ({ ...voice, photo })),
  );
}

/** 0:37 — 목소리 길이 표기 */
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** 로그인·게스트 화면처럼 특정 앨범에 매이지 않은 자리에서 쓰는 예시 사진 */
export const photos = photosByAlbum.eu23;

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
