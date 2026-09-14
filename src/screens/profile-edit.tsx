import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Topbar } from "@/components/topbar";
import { PageIntro } from "@/components/page-intro";
import { Field } from "@/components/field";
import { StickyBar } from "@/components/sticky-bar";
import { CharacterAvatar, characterAt } from "@/components/character-avatar";
import { CharacterPicker } from "@/components/character-picker";
import { deleteAccount, updateProfile, useSession } from "@/lib/auth";
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
  const [character, setCharacter] = useState(session?.tone ?? 0);
  const [picking, setPicking] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const trimmed = name.trim();
  // 저장 버튼을 누르기 전에는 아무것도 반영하지 않는다 — 모달에서 고른 캐릭터도 마찬가지.
  const changed =
    trimmed.length > 0 && (trimmed !== session?.name || character !== (session?.tone ?? 0));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!changed) return;
    updateProfile({ name: trimmed, tone: character });
    notify("프로필을 저장했어요");
    back();
  }

  return (
    <>
      <Topbar back={back} title="프로필 수정" />
      <PageIntro
        title="가족에게 어떻게 보일까요?"
        description="앨범과 알림에 이 캐릭터와 이름으로 표시돼요."
      />

      <form className="mt-8 flex flex-col gap-6 pb-20" onSubmit={submit}>
        <div className="flex items-center gap-4">
          <CharacterAvatar index={character} size="xl" />
          <div className="min-w-0">
            <b className="block text-[15px] font-semibold">{characterAt(character).label}</b>
            <p className="mt-0.5 text-sm text-body">프로필 캐릭터</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setPicking(true)}
            >
              캐릭터 변경
            </Button>
          </div>
        </div>

        <CharacterPicker
          open={picking}
          onOpenChange={setPicking}
          value={character}
          onConfirm={setCharacter}
        />

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
