import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { Eyebrow } from "@/components/eyebrow";
import { MediaFrame } from "@/components/media-frame";
import { GoogleIcon, KakaoIcon } from "@/components/provider-icons";
import { photos } from "@/data/photos";
import { providerMeta, signIn, type AuthProvider } from "@/lib/auth";
import type { Go, Notify } from "@/types";

export function LoginScreen({ go, notify }: { go: Go; notify: Notify }) {
  const [pending, setPending] = useState<AuthProvider | null>(null);

  async function start(provider: AuthProvider) {
    if (pending) return;
    setPending(provider);
    const { account, needsSignup } = await signIn(provider);
    setPending(null);
    if (needsSignup) {
      notify(`${providerMeta[provider].label} 계정을 연결했어요`);
      go("signupTerms");
    } else {
      notify(`${account.name}님, 다시 만나 반가워요`);
      go("home");
    }
  }

  return (
    <>
      <div className="flex h-14 items-center justify-center">
        <Wordmark />
      </div>

      <MediaFrame className="mt-2" src={photos[0].src} alt="가족과 함께 본 유럽여행 사진" />

      <section className="mt-6 flex flex-col gap-3">
        <Eyebrow>시작하기</Eyebrow>
        <h1 className="font-heading text-display-xl font-bold">
          기억하고 싶은
          <br />
          순간이 있나요?
        </h1>
        <p className="text-base leading-relaxed text-body">
          SNS 계정으로 시작해 보세요. 링크를 공유받았다면 회원가입 없이 앨범에 사진을 첨부할 수도
          있어요.
        </p>
      </section>

      <div className="mt-7 flex flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2.5"
          disabled={pending !== null}
          onClick={() => start("google")}
        >
          {pending === "google" ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {pending === "google" ? "구글 계정 확인 중…" : "구글로 시작하기"}
        </Button>

        <Button
          size="lg"
          className="w-full gap-2.5 bg-[#fee500] text-[#191919] hover:bg-[#f2d900]"
          disabled={pending !== null}
          onClick={() => start("kakao")}
        >
          {pending === "kakao" ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <KakaoIcon />
          )}
          {pending === "kakao" ? "카카오 계정 확인 중…" : "카카오로 시작하기"}
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <small className="text-xs font-semibold text-body-mid">초대받아 오셨나요?</small>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-3 flex justify-center">
        <Button variant="link" size="sm" className="text-body" onClick={() => go("guest")}>
          초대 링크로 참여하기
        </Button>
      </div>
    </>
  );
}
