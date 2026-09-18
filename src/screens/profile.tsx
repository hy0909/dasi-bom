import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { BottomNav } from "@/components/bottom-nav";
import { ListRow } from "@/components/list-row";
import { CharacterAvatar } from "@/components/character-avatar";
import { ProviderIcon } from "@/components/provider-icons";
import { signOut, useSession } from "@/lib/auth";
import type { Go, Notify } from "@/types";

export function ProfileScreen({ go, notify }: { go: Go; notify: Notify }) {
  const [alert, setAlert] = useState(true);
  const session = useSession();

  return (
    <>
      {/* 탭 최상위 화면 — 상단 바 없이 제목을 홈의 워드마크와 같은 높이에서 시작한다. */}
      <h1 className="mt-2.5 font-heading text-display-lg font-bold">내 정보</h1>

      <Card size="sm" className="mt-6">
        <CardContent className="flex items-center gap-4">
          <CharacterAvatar index={session?.tone} color={session?.color} size="lg" />
          <div className="min-w-0 flex-1">
            <b className="block text-[17px] font-semibold">{session?.name ?? "게스트"}</b>
            <small className="flex items-center gap-1.5 text-[13px] text-body-mid">
              {session && <ProviderIcon provider={session.provider} className="size-3.5" />}
              <span className="truncate">{session?.email ?? "로그인이 필요해요"}</span>
            </small>
          </div>
          <Button variant="outline" size="sm" onClick={() => go("profileEdit")}>
            수정
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline" size="sm" className="mt-4 py-1">
        <CardContent className="flex flex-col px-3">
          {/* 스위치 행은 ListRow(button)를 쓰지 않는다 — 버튼 중첩은 유효하지 않은 마크업 */}
          <div className="flex w-full items-center gap-3 px-1 py-3">
            <span className="min-w-0 flex-1 text-[15px] font-semibold">가족 기록 알림</span>
            <Switch checked={alert} onCheckedChange={setAlert} aria-label="가족 기록 알림" />
          </div>
          <Separator />
          <ListRow title="이용약관 및 개인정보" chevron onClick={() => notify("이용약관을 확인했어요")} />
          <Separator />
          <ListRow
            title="로그아웃"
            chevron
            className="text-body"
            onClick={() => {
              localStorage.removeItem("dasiBomGuest");
              signOut();
              notify("로그아웃 처리됐어요");
              go("login");
            }}
          />
        </CardContent>
      </Card>

      <BottomNav go={go} active="profile" />
    </>
  );
}
