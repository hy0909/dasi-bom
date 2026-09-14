import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Topbar } from "@/components/topbar";
import { PageIntro } from "@/components/page-intro";
import { Field } from "@/components/field";
import { StickyBar } from "@/components/sticky-bar";
import { InitialsAvatar } from "@/components/initials-avatar";
import { deleteAccount, initialOf, updateProfile, useSession } from "@/lib/auth";
import type { Go, Notify } from "@/types";

export function ProfileEditScreen({
  go,
  back,
  notify,
}: {
  go: Go;
  back: () => void;
  notify: Notify;
}) {
  const session = useSession();
  const [name, setName] = useState(session?.name ?? "");
  const [confirmLeave, setConfirmLeave] = useState(false);

  const trimmed = name.trim();
  const changed = trimmed.length > 0 && trimmed !== session?.name;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!changed) return;
    updateProfile({ name: trimmed });
    notify("닉네임을 저장했어요");
    back();
  }

  return (
    <>
      <Topbar back={back} title="프로필 수정" />
      <PageIntro
        title="가족에게 보일 이름"
        description="앨범과 알림에 이 이름으로 표시돼요."
      />

      <form className="mt-8 flex flex-col gap-6 pb-20" onSubmit={submit}>
        <div className="flex items-center gap-4">
          <InitialsAvatar name={initialOf(trimmed || session?.name)} tone={session?.tone ?? 0} size="lg" />
          <p className="text-sm text-body">
            이름의 첫 글자가 프로필 이미지로 쓰여요.
            <br />
            사진은 나중에 올릴 수 있어요.
          </p>
        </div>

        <Field label="닉네임" htmlFor="nickname" required>
          <Input
            id="nickname"
            autoFocus
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 하연"
          />
        </Field>

        <p className="text-xs text-body-mid">
          이메일과 로그인 수단은 바꿀 수 없어요. 계정을 바꾸려면 로그아웃한 뒤 다시 로그인해주세요.
        </p>

        {/* 탈퇴는 확인 모달 대신 두 번 누르기로 막는다 — 프로토타입에 다이얼로그 프리미티브가 없다. */}
        <div className="mt-4 border-t border-border pt-6">
          <b className="block text-[15px] font-semibold">회원 탈퇴</b>
          <p className="mt-1 text-sm text-body">
            계정과 가입 정보가 지워져요. 가족이 남긴 답변은 되돌릴 수 없어요.
          </p>
          <Button
            type="button"
            variant={confirmLeave ? "destructive" : "outline"}
            size="sm"
            className="mt-3"
            onClick={() => {
              if (!confirmLeave) {
                setConfirmLeave(true);
                return notify("한 번 더 누르면 계정이 지워져요");
              }
              localStorage.removeItem("dasiBomGuest");
              deleteAccount();
              notify("회원 탈퇴가 완료됐어요");
              go("login");
            }}
          >
            {confirmLeave ? "정말 탈퇴할게요" : "회원 탈퇴하기"}
          </Button>
        </div>

        <StickyBar>
          <Button size="lg" className="w-full" disabled={!changed}>
            저장하기
          </Button>
        </StickyBar>
      </form>
    </>
  );
}
