export type Screen =
  | "login"
  | "signupTerms"
  | "signupProfile"
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
  | "profileEdit"
  | "guest"
  | "guestInfo"
  | "guestAnswer"
  | "guestDone";

export type Go = (screen: Screen) => void;
export type Notify = (text: string) => void;
