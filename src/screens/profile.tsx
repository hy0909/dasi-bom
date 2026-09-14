import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Topbar } from "@/components/topbar";
import { ListRow } from "@/components/list-row";
import { InitialsAvatar } from "@/components/initials-avatar";
import type { Go, Notify } from "@/types";

export function ProfileScreen({ go, notify }: { go: Go; notify: Notify }) {
  const [alert, setAlert] = useState(true);
  return (
    <>
      <Topbar back={() => go("home")} title="내 설정" />

      <Card size="sm" className="mt-2">
        <CardContent className="flex items-center gap-4">
          <InitialsAvatar name="하" tone={0} size="lg" />
          <div className="min-w-0 flex-1">
            <b className="block text-[17px] font-semibold">하연</b>
            <small className="block truncate text-sm text-body-mid">hayun@example.com</small>
          </div>
          <Button variant="outline" size="sm" onClick={() => notify("프로필 수정 화면을 준비했어요")}>
            수정
          </Button>
        </CardContent>
      </Card>

      <Card variant="outline" size="sm" className="mt-4 py-1">
        <CardContent className="flex flex-col px-3">
          {/* 스위치 행은 ListRow(button)를 쓰지 않는다 — 버튼 중첩은 유효하지 않은 마크업 */}
          <div className="flex w-full items-center gap-3 px-1 py-3">
            <span className="min-w-0 flex-1 text-[15px] font-semibold">가족 답변 알림</span>
            <Switch checked={alert} onCheckedChange={setAlert} aria-label="가족 답변 알림" />
          </div>
          <Separator />
          <ListRow title="공유 링크 관리" chevron onClick={() => notify("공유 링크 1개가 활성화되어 있어요")} />
          <Separator />
          <ListRow title="이용약관 및 개인정보" chevron onClick={() => notify("이용약관을 확인했어요")} />
          <Separator />
          <ListRow
            title="로그아웃"
            chevron
            className="text-body"
            onClick={() => {
              localStorage.removeItem("dasiBomGuest");
              notify("로그아웃 처리됐어요");
              go("home");
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
