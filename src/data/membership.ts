import { useSyncExternalStore } from "react";

/** 내가 이 앨범과 맺은 관계 — 내가 만들었거나, 초대 링크를 타고 참여했거나. */
export type MyRole = "owner" | "member";

export type Membership = {
  role: MyRole;
  /** 나를 부른 사람 — 링크를 타고 들어온 앨범에만 있다. */
  invitedBy?: string;
};

/**
 * 내가 참여 중인 앨범 — 홈의 ‘내 앨범’이 곧 이 목록이다.
 * 앱이 아는 앨범이라고 다 내 앨범은 아니므로 앨범 목록(initialAlbums)과 따로 둔다.
 * 내가 만든 앨범과 초대 링크를 타고 합류한 앨범만 여기에 들어온다.
 */
const initialMembership: Record<string, Membership> = {
  eu23: { role: "owner" },
  summer: { role: "owner" },
  // 사진이 상한(20장)까지 찬 예시 앨범
  school1: { role: "owner" },
  // 엄마가 보낸 링크를 타고 들어간 앨범 — 내가 만들지 않았어도 내 앨범이다.
  jeju: { role: "member", invitedBy: "엄마" },
  // seaside 는 아직 내 앨범이 아니다 — ?invite=SEA 링크를 타야 목록에 들어온다.
};

/** 참여자 목록과 같은 이유로 작은 스토어를 둔다 — 홈·초대 화면이 같은 목록을 본다. */
let store: Record<string, Membership> = initialMembership;
const listeners = new Set<() => void>();

function publish(next: Record<string, Membership>) {
  store = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 내가 참여 중인 앨범 전체 — 키는 앨범 id. */
export function useMyAlbums() {
  return useSyncExternalStore(
    subscribe,
    () => store,
    () => initialMembership,
  );
}

export function membershipOf(albumId: string): Membership | undefined {
  return store[albumId];
}

export function isMyAlbum(albumId: string) {
  return albumId in store;
}

/**
 * 앨범을 만들거나 초대 링크를 타고 들어오면 내 목록에 들어온다.
 * 이미 참여 중이면 처음 들어온 경위를 그대로 둔다.
 */
export function joinMyAlbum(albumId: string, membership: Membership) {
  if (isMyAlbum(albumId)) return false;
  publish({ ...store, [albumId]: membership });
  return true;
}
