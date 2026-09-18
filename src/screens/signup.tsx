import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Topbar } from "@/components/topbar";
import { PageIntro } from "@/components/page-intro";
import { Field } from "@/components/field";
import { StepProgress } from "@/components/step-progress";
import { AVATAR_COLORS, CHARACTERS, CharacterAvatar } from "@/components/character-avatar";
import { ProviderIcon } from "@/components/provider-icons";
import { cn } from "@/lib/utils";
import {
  completeSignup,
  providerMeta,
  signOut,
  updateProfile,
  useSession,
} from "@/lib/auth";
import type { Go, Notify } from "@/types";

type Term = { key: string; label: string; detail?: string; required: boolean };

/** detail 이 있는 항목만 [보기] 버튼(약관 전문)을 노출한다. */
const terms: Term[] = [
  { key: "age", label: "만 14세 이상입니다", required: true },
  { key: "service", label: "서비스 이용약관", detail: "앨범 생성·공유 규칙", required: true },
  {
    key: "privacy",
    label: "개인정보 수집·이용 동의",
    detail: "이름, 이메일, 올린 사진과 음성",
    required: true,
  },
  { key: "marketing", label: "새 소식 받아보기", detail: "이메일 · 언제든 해제", required: false },
];

const requiredKeys = terms.filter((t) => t.required).map((t) => t.key);

export function SignupTerms({ go, notify }: { go: Go; notify: Notify }) {
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const session = useSession();

  const allChecked = terms.every((t) => agreed[t.key]);
  const canSubmit = requiredKeys.every((key) => agreed[key]);

  /** 가입을 중단하고 로그인으로 — 세션을 비워 로그인 화면을 깨끗한 상태로 되돌린다. */
  function cancel() {
    signOut();
    go("login");
  }

  return (
    <>
      <Topbar back={cancel} title="약관 동의" />
      <StepProgress step={1} total={2} />

      <PageIntro
        title={
          <>
            시작하기 전에
            <br />
            확인해주세요
          </>
        }
        description={
          session
            ? `${providerMeta[session.provider].label} 계정 ${session.email} 으로 가입해요.`
            : "가입에 필요한 약관을 확인해주세요."
        }
      />

      <Card size="sm" className="mt-8">
        <CardContent className="flex flex-col gap-1">
          <Label className="items-start gap-3 py-1 text-[15px] leading-snug font-semibold">
            <Checkbox
              aria-label="약관에 모두 동의합니다"
              checked={allChecked}
              onCheckedChange={(v) =>
                setAgreed(
                  v === true ? Object.fromEntries(terms.map((t) => [t.key, true])) : {},
                )
              }
              className="mt-0.5 size-5 bg-canvas"
            />
            약관에 모두 동의합니다
          </Label>
          <small className="pl-8 text-xs text-body-mid">
            선택 항목까지 한 번에 동의해요. 개별로도 고를 수 있어요.
          </small>

          <Separator className="my-3" />

          <div className="flex flex-col">
            {terms.map((term) => (
              <div key={term.key} className="flex items-center gap-2 py-2.5">
                <Label className="min-w-0 flex-1 items-start gap-3 text-sm leading-snug font-medium">
                  <Checkbox
                    aria-label={`${term.required ? "필수" : "선택"} · ${term.label}`}
                    checked={agreed[term.key] ?? false}
                    onCheckedChange={(v) =>
                      setAgreed((prev) => ({ ...prev, [term.key]: v === true }))
                    }
                    className="mt-0.5 size-5 bg-canvas"
                  />
                  <span className="min-w-0 flex-1">
                    <b className="block font-semibold">
                      <span className={term.required ? "text-primary" : "text-body-mid"}>
                        {term.required ? "[필수] " : "[선택] "}
                      </span>
                      {term.label}
                    </b>
                    {term.detail && (
                      <small className="block text-xs text-body-mid">{term.detail}</small>
                    )}
                  </span>
                </Label>
                {term.detail && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-body-mid"
                    onClick={() => notify(`${term.label} 전문을 준비했어요`)}
                  >
                    보기
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!canSubmit}
        onClick={() => {
          updateProfile({ marketing: agreed.marketing ?? false });
          go("signupProfile");
        }}
      >
        동의하고 계속하기
      </Button>

      <div className="mt-2 flex justify-center">
        <Button variant="link" size="sm" className="text-body" onClick={cancel}>
          다음에 가입할게요
        </Button>
      </div>
    </>
  );
}

export function SignupProfile({ go, notify }: { go: Go; notify: Notify }) {
  const session = useSession();
  const [name, setName] = useState(session?.name ?? "");
  const [tone, setTone] = useState(session?.tone ?? 0);
  const [color, setColor] = useState(session?.color ?? 0);

  return (
    <>
      <Topbar back={() => go("signupTerms")} title="프로필 설정" />
      <StepProgress step={2} total={2} />

      <PageIntro
        eyebrow="02 · 프로필"
        title={
          <>
            가족에게
            <br />
            어떻게 보일까요?
          </>
        }
        description="앨범과 초대 화면에 표시될 이름이에요. 나중에 바꿀 수 있어요."
      />

      <div className="mt-8 flex flex-col items-center gap-5">
        <CharacterAvatar index={tone} color={color} size="xl" />

        <div className="flex items-center gap-3" role="radiogroup" aria-label="프로필 캐릭터">
          {CHARACTERS.map((character, i) => (
            <button
              key={character.id}
              type="button"
              role="radio"
              aria-checked={tone === i}
              aria-label={character.label}
              onClick={() => setTone(i)}
              className={cn(
                "rounded-full transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                tone === i && "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-canvas",
              )}
            >
              <CharacterAvatar index={i} color={color} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2" role="radiogroup" aria-label="프로필 배경색">
          {AVATAR_COLORS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={color === i}
              aria-label={item.label}
              onClick={() => setColor(i)}
              className={cn(
                "size-7 rounded-full border transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                color === i ? "border-ink scale-110" : "border-border hover:scale-105",
              )}
              style={{ backgroundColor: item.value }}
            />
          ))}
        </div>
      </div>

      <form
        className="mt-8 flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          completeSignup({ name: trimmed, tone, color });
          notify(`반가워요, ${trimmed}님. 첫 앨범을 만들어볼까요?`);
          go("home");
        }}
      >
        <Field label="이름" htmlFor="signup-name" required hint="가족이 알아보기 쉬운 이름이 좋아요.">
          <Input
            id="signup-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 하연"
            maxLength={12}
            autoFocus
          />
        </Field>

        {session && (
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
            <ProviderIcon provider={session.provider} className="size-5 shrink-0" />
            <span className="min-w-0 flex-1 text-sm leading-snug text-body">
              <b className="font-semibold text-ink">
                {providerMeta[session.provider].label} 계정
              </b>
              <small className="block truncate text-xs text-body-mid">{session.email}</small>
            </span>
          </div>
        )}

        <Button size="lg" className="w-full" disabled={!name.trim()}>
          시작하기
        </Button>
      </form>
    </>
  );
}
