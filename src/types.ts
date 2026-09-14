export type Screen =
  | "home"
  | "create"
  | "detail"
  | "interview"
  | "voice"
  | "story"
  | "invite"
  | "upload"
  | "notices"
  | "profile"
  | "guest"
  | "guestInfo"
  | "guestAnswer"
  | "guestDone";

export type Go = (screen: Screen) => void;
export type Notify = (text: string) => void;
