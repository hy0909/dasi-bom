import { useSyncExternalStore } from "react";

/**
 * 프로토타입 목업 인증.
 * 실제 OAuth 대신 localStorage 만 쓴다 — 실연동 시 signIn() 내부의 mockAuthorize()
 * 한 곳만 Google Identity Services / Kakao SDK 호출로 바꾸면 나머지는 그대로 쓸 수 있다.
 */

export type AuthProvider = "google" | "kakao";

export type Account = {
  provider: AuthProvider;
  email: string;
  /** 가족에게 보이는 이름 */
  name: string;
  /** 프로필 캐릭터 인덱스 (CHARACTERS) */
  tone: number;
  /** 선택 약관(소식 받기) 동의 여부 */
  marketing: boolean;
  /** 약관 동의 + 프로필 설정까지 끝났는가 */
  onboarded: boolean;
  createdAt: string;
};

export const providerMeta: Record<
  AuthProvider,
  { label: string; email: string; name: string }
> = {
  google: { label: "구글", email: "hayun.kim@gmail.com", name: "하연" },
  kakao: { label: "카카오", email: "hayun@kakao.com", name: "하연" },
};

const SESSION_KEY = "dasiBomAuth";
const ACCOUNTS_KEY = "dasiBomAccounts";
/** 목업 지연 — 실제 OAuth 팝업/리다이렉트 왕복을 흉내 낸다. */
const MOCK_DELAY = 700;

type Accounts = Partial<Record<AuthProvider, Account>>;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null; // 프라이빗 모드 등 — 세션 없음으로 취급
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 실패는 무시 — 세션은 메모리로만 유지된다 */
  }
}

let session: Account | null = read<Account>(SESSION_KEY);
const listeners = new Set<() => void>();

/** 세션을 갱신하고 가입 이력(ACCOUNTS_KEY)까지 동기화한다. */
function publish(next: Account | null) {
  session = next;
  write(SESSION_KEY, next);
  if (next) {
    write(ACCOUNTS_KEY, { ...read<Accounts>(ACCOUNTS_KEY), [next.provider]: next });
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSession() {
  return useSyncExternalStore(
    subscribe,
    () => session,
    () => null,
  );
}

export function getSession() {
  return session;
}

/** 이름 첫 글자 — 아바타 이니셜. */
export function initialOf(name?: string | null) {
  return name?.trim().charAt(0) || "봄";
}

export type SignInResult = {
  account: Account;
  /** 약관 동의·프로필 설정을 아직 마치지 않은 계정 → 가입 온보딩으로 보낸다 */
  needsSignup: boolean;
};

function mockAuthorize(provider: AuthProvider): Promise<Account> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saved = read<Accounts>(ACCOUNTS_KEY)?.[provider];
      resolve(
        saved ?? {
          provider,
          email: providerMeta[provider].email,
          name: providerMeta[provider].name,
          tone: 0,
          marketing: false,
          onboarded: false,
          createdAt: new Date().toISOString(),
        },
      );
    }, MOCK_DELAY);
  });
}

export async function signIn(provider: AuthProvider): Promise<SignInResult> {
  const account = await mockAuthorize(provider);
  publish(account);
  return { account, needsSignup: !account.onboarded };
}

/** 가입 온보딩(약관 → 프로필) 완료 처리. */
export function completeSignup(patch: Pick<Account, "name" | "tone">) {
  if (!session) return;
  publish({ ...session, ...patch, onboarded: true });
}

export function updateProfile(patch: Partial<Pick<Account, "name" | "tone" | "marketing">>) {
  if (!session) return;
  publish({ ...session, ...patch });
}

/** 로그아웃 — 가입 이력은 남겨서 다시 로그인하면 기존 회원으로 들어온다. */
export function signOut() {
  publish(null);
}

/** 회원 탈퇴 — 가입 이력까지 지워서 다음 로그인은 신규 가입으로 시작한다. */
export function deleteAccount() {
  const provider = session?.provider;
  if (provider) {
    const accounts = read<Accounts>(ACCOUNTS_KEY) ?? {};
    delete accounts[provider];
    write(ACCOUNTS_KEY, accounts);
  }
  publish(null);
}
