export type Screen =
  | "login"
  | "signupTerms"
  | "signupProfile"
  | "home"
  | "create"
  | "detail"
  | "albumEdit"
  | "recordList"
  | "interview"
  | "voice"
  | "story"
  | "invite"
  | "upload"
  | "notices"
  | "profile"
  | "profileEdit"
  /** 초대 링크로 들어온 사람이 네 자리 비밀번호를 적는 잠금 화면 */
  | "guestPin"
  | "guest"
  | "guestInfo"
  | "guestAnswer"
  | "guestDone";

export type Go = (screen: Screen) => void;
export type Notify = (text: string) => void;
