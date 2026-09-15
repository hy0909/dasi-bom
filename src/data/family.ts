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

/** 앨범에 초대된 가족. 홈 카드의 겹친 프로필과 초대 화면 목록이 같은 값을 쓴다. */
export const participants: Participant[] = [
  { character: 0, color: 5, name: "엄마", note: "답변 4개", status: "참여 중" },
  { character: 1, color: 3, name: "아버지", note: "아직 답변 없음", status: "초대됨" },
  { character: 2, color: 6, name: "동생 민준", note: "초대가 전달되지 않았어요", status: "다시 초대" },
];

/** 초대만 되고 아직 답이 없는 사람도 '참여 중'으로 세지 않는다. */
export const activeParticipants = participants.filter((p) => p.status === "참여 중");
