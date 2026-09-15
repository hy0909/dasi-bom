import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Topbar } from "@/components/topbar";
import { Field } from "@/components/field";
import { StickyBar } from "@/components/sticky-bar";
import { CharacterAvatar, characterAt } from "@/components/character-avatar";
import { CharacterPicker } from "@/components/character-picker";
import { ProviderIcon } from "@/components/provider-icons";
import { deleteAccount, providerMeta, updateProfile, useSession } from "@/lib/auth";
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
  const [color, setColor] = useState(session?.color ?? 0);
  const [picking, setPicking] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const trimmed = name.trim();
  // 저장 버튼을 누르기 전에는 아무것도 반영하지 않는다 — 모달에서 고른 캐릭터도 마찬가지.
  const changed =
    trimmed.length > 0 &&
    (trimmed !== session?.name ||
      character !== (session?.tone ?? 0) ||
      color !== (session?.color ?? 0));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!changed) return;
    updateProfile({ name: trimmed, tone: character, color });
    notify("프로필을 저장했어요");
    back();
  }

  return (
    <>
      <Topbar back={back} title="프로필 수정" />

      <form className="mt-6 flex flex-col gap-6 pb-20" onSubmit={submit}>
        <div className="flex items-center gap-4">
          <CharacterAvatar index={character} color={color} size="xl" />
          <div className="min-w-0">
            <b className="block text-[15px] font-semibold">
              {characterAt(character).label} 프로필 이미지
            </b>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setPicking(true)}
            >
              프로필 변경
            </Button>
          </div>
        </div>

        <CharacterPicker
          open={picking}
          onOpenChange={setPicking}
          character={character}
          color={color}
          onConfirm={(next) => {
            setCharacter(next.character);
            setColor(next.color);
          }}
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

        {/* 바꿀 수 없는 값이라 위계를 한 단계 낮춰 아래에 따로 둔다. */}
        {session && (
          <section className="mt-2 flex flex-col gap-2 rounded-lg bg-muted px-4 py-3.5">
            <b className="text-xs font-semibold text-body">연결된 계정</b>
            <div className="flex items-center gap-2 text-sm">
              <ProviderIcon provider={session.provider} className="size-4 shrink-0" />
              <span className="min-w-0 truncate text-ink">{session.email}</span>
            </div>
            <p className="text-xs text-body-mid">
              {providerMeta[session.provider].label} 계정 ·{" "}
              {new Date(session.createdAt).toLocaleDateString("ko-KR")} 가입
              <br />
              이메일과 로그인 수단은 바꿀 수 없어요.
            </p>
          </section>
        )}

        {/* 탈퇴는 확인 모달 대신 두 번 누르기로 막는다 — 프로토타입에 다이얼로그 프리미티브가 없다. */}
        <div className="mt-4 border-t border-border pt-6">
          <b className="block text-[15px] font-semibold">회원 탈퇴</b>
          <p className="mt-1 text-sm text-body">
            계정과 가입 정보가 지워져요. 가족이 남긴 기록은 되돌릴 수 없어요.
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
            {confirmLeave ? "정말 탈퇴할게요" : "회원 탈퇴"}
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
