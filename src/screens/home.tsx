import { useState } from "react";
import { ArrowRight, ChevronDown, Ellipsis, Image, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { Fab } from "@/components/fab";
import { SectionHeading } from "@/components/section-heading";
import { CharacterAvatar } from "@/components/character-avatar";
import { type Album, formatAlbumPeriod } from "@/data/album";
import { participants } from "@/data/family";
import { photos } from "@/data/photos";
import { useSession } from "@/lib/auth";
import type { Go, Notify } from "@/types";

export function HomeScreen({ go, album, notify }: { go: Go; album: Album; notify: Notify }) {
  const [recent, setRecent] = useState(true);
  return (
    <>
      <Topbar go={go} />

      <div className="mt-7">
        <h1 className="font-heading text-display-xl font-bold">
          함께 기억하고 싶은
          <br />
          순간이 있나요?
        </h1>
      </div>

      {/* 새 앨범 CTA — canvas 표면 + 소프트 섀도, 오렌지는 아이콘에만 */}
      <Card
        variant="plain"
        size="sm"
        role="button"
        tabIndex={0}
        onClick={() => go("create")}
        onKeyDown={(e) => e.key === "Enter" && go("create")}
        className="mt-7 cursor-pointer shadow-none ring-1 ring-border transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      >
        <CardContent className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-canvas">
            <Plus className="size-6" strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[17px] font-semibold text-ink">새 앨범 만들기</b>
            <small className="block text-sm text-body">사진 한 장에서 시작해보세요</small>
          </span>
          <ArrowRight className="size-5 text-ink" />
        </CardContent>
      </Card>

      <SectionHeading
        className="mt-9"
        title="내 앨범"
        action={
          <Button
            variant="quiet"
            size="sm"
            className="-mr-2"
            onClick={() => {
              setRecent(!recent);
              notify(recent ? "오래된 앨범부터 정렬했어요" : "최근 수정한 앨범부터 정렬했어요");
            }}
          >
            {recent ? "최근 수정순" : "오래된 순"}
            <ChevronDown className="size-4" />
          </Button>
        }
      />

      <RecordCard album={album} go={go} notify={notify} />

      <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink">
          <Sparkles className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-body">
          <b className="block font-semibold text-ink">오늘의 기록 팁</b>
          사진 속 표정보다 그날의 기분을 먼저 물어보세요.
        </p>
      </div>

      <Fab aboveNav onClick={() => go("create")} aria-label="새 앨범 만들기">
        <Plus className="size-6" strokeWidth={2.5} />
      </Fab>
      <BottomNav go={go} active="home" />
    </>
  );
}

function RecordCard({ album, go, notify }: { album: Album; go: Go; notify: Notify }) {
  const session = useSession();
  return (
    <Card
      className="mt-4 cursor-pointer transition-shadow hover:shadow-card focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      role="button"
      tabIndex={0}
      onClick={() => go("detail")}
      onKeyDown={(e) => e.key === "Enter" && go("detail")}
    >
      <div className="relative -mt-(--card-spacing) aspect-[16/10] overflow-hidden">
        <img src={photos[0].src} alt="해질 녘 에펠탑을 함께 바라보는 가족" className="size-full object-cover" />
        <Badge
          variant={album.status === "완료" ? "ink" : "glass"}
          className="absolute top-3 left-3"
        >
          {album.status}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-display-sm font-bold">{album.title}</h3>
            <p className="mt-1 text-sm text-body">{formatAlbumPeriod(album)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-mt-1 -mr-2"
                aria-label="앨범 더보기"
                onClick={(e) => e.stopPropagation()}
              >
                <Ellipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => go("albumEdit")}>
                정보 수정
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => go("invite")}>공유</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => notify("삭제는 확인 후 진행돼요")}>
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* 날짜 블록과 한 칸 더 띄운다 */}
        <div className="mt-1">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              {/* 함께하는 사람 — 소유자 + 초대된 가족 */}
              <span className="flex -space-x-2">
                <CharacterAvatar index={session?.tone} className="size-7 ring-2 ring-card" />
                {participants.map((p) => (
                  <CharacterAvatar
                    key={p.name}
                    index={p.character}
                    className="size-7 ring-2 ring-card"
                  />
                ))}
                <span className="sr-only">
                  나를 포함해 {participants.length + 1}명이 함께해요
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-body">
                <Image className="size-4 text-body-mid" aria-hidden />
                <span className="sr-only">사진</span>3
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
