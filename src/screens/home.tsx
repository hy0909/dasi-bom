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
import { type Album, formatAlbumStart } from "@/data/album";
import { sampleAlbums } from "@/data/albums";
import { participantsOf } from "@/data/family";
import { photos } from "@/data/photos";
import { useSession } from "@/lib/auth";
import type { Go, Notify } from "@/types";

export function HomeScreen({ go, album, notify }: { go: Go; album: Album; notify: Notify }) {
  const [recent, setRecent] = useState(true);
  const session = useSession();
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <AlbumCard
          album={album}
          cover={photos[0].src}
          coverAlt="해질 녘 에펠탑을 함께 바라보는 가족"
          photoCount={photos.length}
          members={[
            { character: session?.tone ?? 0, color: session?.color ?? 0 },
            ...participantsOf(album.inviteCode).map((p) => ({
              character: p.character,
              color: p.color,
            })),
          ]}
          onOpen={() => go("detail")}
          menu={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-xs"
                  className="absolute top-2 right-2 rounded-full bg-canvas/90 text-ink hover:bg-canvas"
                  aria-label="앨범 더보기"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={() => go("albumEdit")}>정보 수정</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => go("invite")}>공유</DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => notify("삭제는 확인 후 진행돼요")}
                >
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        {sampleAlbums.map((item) => (
          <AlbumCard
            key={item.id}
            album={item}
            cover={item.cover}
            coverAlt={item.coverAlt}
            photoCount={item.photoCount}
            members={item.members}
            onOpen={() => go("detail")}
          />
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink">
          <Sparkles className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-body">
          <b className="block font-semibold text-ink">기록 Tip</b>
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

/** 그리드 카드에서 겹쳐 보여줄 프로필 최대 개수 */
const MAX_FACES = 3;

function AlbumCard({
  album,
  cover,
  coverAlt,
  photoCount,
  members,
  onOpen,
  menu,
}: {
  album: Album;
  cover: string;
  coverAlt: string;
  photoCount: number;
  members: { character: number; color: number }[];
  onOpen: () => void;
  menu?: React.ReactNode;
}) {
  const overflow = members.length - MAX_FACES;
  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="cursor-pointer transition-shadow hover:shadow-card focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
    >
      <div className="relative -mt-(--card-spacing) aspect-square overflow-hidden">
        <img src={cover} alt={coverAlt} className="size-full object-cover" />
        <Badge
          variant={album.status === "완료" ? "ink" : "glass"}
          className="absolute top-2 left-2"
        >
          {album.status}
        </Badge>
        {menu}
      </div>
      <CardContent className="flex flex-col gap-2">
        <div>
          <h3 className="line-clamp-2 font-heading text-[15px] leading-snug font-bold">
            {album.title}
          </h3>
          <p className="mt-1 text-xs text-body-mid">{formatAlbumStart(album)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="flex -space-x-1.5">
              {members.slice(0, MAX_FACES).map((m, i) => (
                <CharacterAvatar
                  key={i}
                  index={m.character}
                  color={m.color}
                  className="size-6 ring-2 ring-card"
                />
              ))}
            </span>
            {overflow > 0 && <span className="text-xs font-semibold text-body">+{overflow}</span>}
            <span className="sr-only">{members.length}명이 함께해요</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-body">
            <Image className="size-3.5 text-body-mid" aria-hidden />
            <span className="sr-only">사진</span>
            {photoCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
