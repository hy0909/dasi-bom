import type { ReactNode } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberRow } from "@/components/member-row";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Participant } from "@/data/family";

/**
 * 기록 중인 사람 전체 명단 모달.
 * 앨범 상세의 사진 위 참여자 줄과 홈 목록 카드의 겹친 프로필이 같은 모달을 연다 —
 * 프로필이 겹쳐 있는 자리는 어디서든 눌러서 명단을 펼 수 있어야 한다.
 * 여는 자리마다 생김새가 달라 트리거는 children 으로 받는다.
 */
export function MembersDialog({
  me,
  others,
  iAmOwner,
  onInvite,
  children,
}: {
  me: { character: number; color: number; name: string };
  others: Participant[];
  iAmOwner: boolean;
  onInvite: () => void;
  children: ReactNode;
}) {
  const total = others.length + 1;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[360px] gap-3 p-5">
        <DialogHeader>
          <DialogTitle>기록 중인 사람 {total}명</DialogTitle>
          <DialogDescription>앨범 구성원은 누구나 새 구성원을 초대할 수 있어요.</DialogDescription>
        </DialogHeader>
        <div className="-mx-1 flex max-h-[320px] flex-col overflow-y-auto overscroll-contain">
          <MemberRow
            character={me.character}
            color={me.color}
            name={me.name}
            note={iAmOwner ? "이 앨범을 만들었어요" : "초대 링크로 참여했어요"}
          />
          {others.map((p) => (
            <MemberRow
              key={p.name}
              character={p.character}
              color={p.color}
              name={p.name}
              note={p.note}
              trailing={
                <Badge variant={p.status === "참여 중" ? "primarySoft" : "default"}>
                  {p.status}
                </Badge>
              }
            />
          ))}
        </div>
        {/* 여기서 바로 부를 수 있게 — 이 모달을 연 그 앨범의 초대 화면으로 간다 */}
        <Button variant="outline" size="lg" className="w-full" onClick={onInvite}>
          <UserPlus className="size-5" />
          초대하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
