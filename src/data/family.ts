import { useSyncExternalStore } from "react";

export type ParticipantStatus = "참여 중" | "초대됨" | "다시 초대";

export type Participant = {
  /** CHARACTERS 인덱스 */
  character: number;
  /** AVATAR_COLORS 인덱스 */
  color: number;
  name: string;
  note: string;
  status: ParticipantStatus;
};

/**
 * 참여자는 앨범마다 따로 있다 — 키는 앨범의 id.
 * 초대 코드가 아니라 앨범 id 로 묶는다. 링크를 새로 발급해 코드가 바뀌어도
 * 이미 합류한 가족은 그대로 남아야 한다.
 */
const initialParticipants: Record<string, Participant[]> = {
  eu23: [
    { character: 0, color: 5, name: "엄마", note: "사진 4장 · 목소리 2회 · 글 2회", status: "참여 중" },
    { character: 1, color: 3, name: "아버지", note: "기록 없음", status: "초대됨" },
    { character: 2, color: 6, name: "동생 민준", note: "초대 실패", status: "다시 초대" },
  ],
  jeju: [
    { character: 0, color: 5, name: "엄마", note: "사진 9장 · 목소리 4회 · 글 5회", status: "참여 중" },
    { character: 1, color: 3, name: "아버지", note: "사진 3장 · 목소리 1회 · 글 2회", status: "참여 중" },
    { character: 3, color: 1, name: "사촌 지우", note: "사진 2장 · 목소리 1회 · 글 1회", status: "참여 중" },
  ],
  summer: [
    { character: 0, color: 2, name: "할머니", note: "사진 5장 · 목소리 3회 · 글 2회", status: "참여 중" },
    { character: 2, color: 6, name: "동생 민준", note: "기록 없음", status: "초대됨" },
  ],
  seaside: [
    { character: 3, color: 4, name: "딸 서아", note: "사진 2장 · 목소리 1회 · 글 1회", status: "참여 중" },
    { character: 0, color: 0, name: "엄마", note: "기록 없음", status: "초대됨" },
    { character: 1, color: 7, name: "아버지", note: "초대 실패", status: "다시 초대" },
    { character: 2, color: 6, name: "동생 민준", note: "기록 없음", status: "초대됨" },
  ],
  school1: [
    { character: 0, color: 5, name: "엄마", note: "사진 17장 · 목소리 8회 · 글 9회", status: "참여 중" },
    { character: 1, color: 3, name: "아버지", note: "사진 6장 · 목소리 2회 · 글 4회", status: "참여 중" },
    { character: 0, color: 2, name: "할머니", note: "사진 3장 · 목소리 2회 · 글 1회", status: "참여 중" },
  ],
};

/**
 * 링크를 타고 들어온 회원이 앨범 그룹에 합류하면 참여자가 늘어난다.
 * 화면 여러 곳이 같은 목록을 보므로 작은 스토어로 두고 구독하게 한다.
 */
let store: Record<string, Participant[]> = initialParticipants;
const listeners = new Set<() => void>();

function publish(next: Record<string, Participant[]>) {
  store = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 앨범별 참여자 전체 — 목록 화면처럼 여러 앨범을 한 번에 그리는 곳에서 쓴다. */
export function useAlbumParticipants() {
  return useSyncExternalStore(
    subscribe,
    () => store,
    () => initialParticipants,
  );
}

export function participantsOf(albumId: string): Participant[] {
  return store[albumId] ?? [];
}

/** 이미 이 앨범에 있는 사람인가 — 이름으로 본다. */
export function isMemberOf(albumId: string, name: string) {
  return participantsOf(albumId).some((p) => p.name === name);
}

/** 초대를 다시 보냈다 — 그 사람은 답을 기다리는 '초대됨'이 된다. */
export function reinvite(albumId: string, name: string) {
  publish({
    ...store,
    [albumId]: participantsOf(albumId).map((p) =>
      // 전에 '초대 실패'였다면 그 자국도 지운다 — 방금 다시 보냈으니까
      p.name === name ? { ...p, note: "초대를 다시 보냈어요", status: "초대됨" as const } : p,
    ),
  });
}

/**
 * 회원이 초대 링크로 들어와 앨범 그룹에 합류한다.
 * 이미 있는 사람이면 아무 일도 하지 않는다.
 */
export function joinAlbum(
  albumId: string,
  member: Pick<Participant, "name" | "character" | "color">,
) {
  if (isMemberOf(albumId, member.name)) return false;
  publish({
    ...store,
    [albumId]: [...participantsOf(albumId), { ...member, note: "방금 참여했어요", status: "참여 중" }],
  });
  return true;
}
