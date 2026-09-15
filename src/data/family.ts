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
 * 참여자는 앨범마다 따로 있다 — 초대 링크도 앨범 단위라 같은 키로 묶는다.
 * 키는 앨범의 inviteCode.
 */
export const participantsByAlbum: Record<string, Participant[]> = {
  EU23: [
    { character: 0, color: 5, name: "엄마", note: "답변 4개", status: "참여 중" },
    { character: 1, color: 3, name: "아버지", note: "아직 답변 없음", status: "초대됨" },
    {
      character: 2,
      color: 6,
      name: "동생 민준",
      note: "초대 실패",
      status: "다시 초대",
    },
  ],
  JEJU: [
    { character: 0, color: 5, name: "엄마", note: "답변 9개", status: "참여 중" },
    { character: 1, color: 3, name: "아버지", note: "답변 3개", status: "참여 중" },
    { character: 3, color: 1, name: "사촌 지우", note: "답변 2개", status: "참여 중" },
  ],
  SUMMER: [
    { character: 0, color: 2, name: "할머니", note: "답변 5개", status: "참여 중" },
    { character: 2, color: 6, name: "동생 민준", note: "아직 답변 없음", status: "초대됨" },
  ],
  SEA: [
    { character: 3, color: 4, name: "딸 서아", note: "답변 2개", status: "참여 중" },
    { character: 0, color: 0, name: "엄마", note: "아직 답변 없음", status: "초대됨" },
    { character: 1, color: 7, name: "아버지", note: "초대 실패", status: "다시 초대" },
    { character: 2, color: 6, name: "동생 민준", note: "아직 답변 없음", status: "초대됨" },
  ],
};

export function participantsOf(inviteCode: string): Participant[] {
  return participantsByAlbum[inviteCode] ?? [];
}
