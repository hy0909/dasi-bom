import type { ReactNode } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import { cn } from "@/lib/utils";

/**
 * 참여자 한 줄 — 초대 화면 명단과 앨범 상세의 참여자 모달이 같은 모양을 쓴다.
 * 행 자체는 버튼으로 두지 않는다 — trailing 에 버튼이 들어올 수 있어 중첩이 된다.
 */
export function MemberRow({
  character,
  color,
  name,
  note,
  trailing,
  className,
}: {
  character: number;
  color: number;
  name: string;
  note?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-center gap-3 px-1 py-3", className)}>
      <CharacterAvatar index={character} color={color} size="lg" />
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[15px] font-semibold">{name}</b>
        {note && <small className="block truncate text-[13px] text-body-mid">{note}</small>}
      </span>
      {trailing}
    </div>
  );
}
