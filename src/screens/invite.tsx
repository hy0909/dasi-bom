import { useEffect, useMemo, useState } from "react";
import { Copy, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { SectionHeading } from "@/components/section-heading";
import { CharacterAvatar } from "@/components/character-avatar";
import type { AlbumCardData } from "@/data/albums";
import { participantsOf } from "@/data/family";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

const statusVariant = { "참여 중": "primarySoft", 초대됨: "default" } as const;

export function InviteScreen({
  go,
  albums,
  initialAlbumId,
  locked = false,
  back,
  notify,
}: {
  go: Go;
  /** 초대할 수 있는 앨범 목록 */
  albums: AlbumCardData[];
  /** 처음 골라 둘 앨범 — 방금 보고 있던 앨범이다. */
  initialAlbumId?: string;
  /** 앨범 상세에서 들어온 경우 — 그 앨범으로 고정한다. */
  locked?: boolean;
  /** 상위 화면에서 들어온 경우에만 전달된다. */
  back?: () => void;
  notify: Notify;
}) {
  const [selectedId, setSelectedId] = useState(initialAlbumId ?? albums[0]?.id);
  const album = useMemo(
    () => albums.find((a) => a.id === selectedId) ?? albums[0],
    [albums, selectedId],
  );
  const participants = participantsOf(album.inviteCode);

  const [link, setLink] = useState("참여 링크 준비 중…");
  useEffect(() => {
    setLink(`${window.location.origin}${window.location.pathname}?invite=${album.inviteCode}`);
  }, [album.inviteCode]);

  async function copy() {
    await copyText(link);
    notify("참여 링크를 복사했어요");
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${album.title}에 초대해요`,
          text: "사진을 보고 떠오르는 기억을 들려주세요.",
          url: link,
        });
      } catch {
        return;
      }
    } else await copy();
  }

  return (
    <>
      {/* 탭으로 들어오면 상단 바가 없고, 앨범에서 들어오면 돌아갈 곳이 있어 상단 바를 둔다. */}
      {back && <Topbar back={back} title="초대" />}

      <section className={cn("flex flex-col gap-3", back ? "mt-4" : "mt-8")}>
        <h1 className="font-heading text-display-lg font-bold">함께 추억을 기록해요</h1>
        <p className="text-base leading-relaxed text-body">
          링크를 통해 회원가입없이
          <br />
          사진을 추가할 수 있어요.
        </p>
      </section>

      {/* 초대는 앨범 단위 — 어느 앨범으로 부를지 먼저 고른다. */}
      {!locked && albums.length > 1 && (
        <section className="mt-6 flex flex-col gap-2">
          <span className="text-xs font-semibold text-body">초대할 앨범</span>
          <div
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5"
            role="radiogroup"
            aria-label="초대할 앨범"
          >
            {albums.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === album.id}
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border py-1.5 pr-3 pl-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  item.id === album.id
                    ? "border-ink bg-ink text-canvas"
                    : "border-border text-body hover:bg-muted",
                )}
              >
                <img src={item.cover} alt="" className="size-7 rounded-md object-cover" />
                {item.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 참여 링크 — 앨범마다 코드가 다르다 */}
      <Card variant="outline" size="sm" className="mt-4">
        <CardContent className="flex flex-col gap-3">
          <small className="text-xs font-semibold text-body">
            ‘{album.title}’ 참여 링크
          </small>
          <div className="flex items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {link.replace("https://", "")}
            </span>
            <Button variant="secondary" size="sm" onClick={copy}>
              <Copy className="size-3.5" />
              복사
            </Button>
          </div>
          <p className="text-xs text-body-mid">이 링크는 2026년 9월 28일까지 사용할 수 있어요.</p>
        </CardContent>
      </Card>

      {/* 이 화면의 유일한 주요 동작 — 오렌지 CTA 하나로 둔다. */}
      <Button size="lg" className="mt-3 w-full" onClick={share}>
        <Share2 className="size-5" />
        공유하기
      </Button>

      <section className="mt-9 flex flex-col gap-2">
        <SectionHeading
          title={<span className="text-lg">함께하는 가족 {participants.length}명</span>}
          description="답변이 도착하면 알려드릴게요"
        />
        <div className="flex flex-col">
          {participants.length === 0 && (
            <p className="py-6 text-sm text-body-mid">아직 초대한 가족이 없어요.</p>
          )}
          {/* 행 자체를 버튼으로 두지 않는다 — '다시 초대'가 행 안의 버튼이라 중첩이 된다. */}
          {participants.map(({ character, color, name, note, status }) => (
            <div key={name} className="flex w-full items-center gap-3 px-1 py-3">
              <CharacterAvatar index={character} color={color} size="lg" />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[15px] font-semibold">{name}</b>
                <small className="block truncate text-[13px] text-body-mid">{note}</small>
              </span>
              {status === "다시 초대" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => notify(`${name}에게 초대를 다시 보냈어요`)}
                >
                  <RotateCcw className="size-3.5" />
                  다시 초대
                </Button>
              ) : (
                <Badge variant={statusVariant[status]}>{status}</Badge>
              )}
            </div>
          ))}
        </div>
      </section>

      <BottomNav go={go} active="invite" />
    </>
  );
}
