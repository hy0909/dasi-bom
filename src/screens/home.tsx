import { useState } from "react";
import { ArrowRight, ChevronDown, Ellipsis, Image, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatAlbumStart } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { useAlbumParticipants } from "@/data/family";
import { type Membership, useMyAlbums } from "@/data/membership";
import { photosOf } from "@/data/photos";
import { useSession } from "@/lib/auth";
import type { Go, Notify, Screen } from "@/types";

/** 내 앨범을 가르는 기준 — 내가 만든 앨범과 링크를 타고 합류한 앨범. */
const albumFilters = ["all", "owner", "member"] as const;
type AlbumFilter = (typeof albumFilters)[number];

const filterLabels: Record<AlbumFilter, string> = {
  all: "전체",
  owner: "내가 만든",
  member: "초대받은",
};

export function HomeScreen({
  go,
  albums,
  onOpenAlbum,
  notify,
}: {
  go: Go;
  albums: AlbumCardData[];
  /** 앨범을 지목해 그 앨범의 화면으로 간다 — 카드마다 다른 앨범이 열려야 한다. */
  onOpenAlbum: (id: string, screen: Screen) => void;
  notify: Notify;
}) {
  const [recent, setRecent] = useState(true);
  const [filter, setFilter] = useState<AlbumFilter>("all");
  const session = useSession();
  const participants = useAlbumParticipants();
  const membership = useMyAlbums();
  // 멤버십이 없는 앨범은 내가 만든 것으로 본다 — 목록에 있다는 건 이미 참여 중이라는 뜻이다.
  const roleOf = (id: string) => membership[id]?.role ?? "owner";
  const counts = {
    all: albums.length,
    owner: albums.filter((a) => roleOf(a.id) === "owner").length,
    member: albums.filter((a) => roleOf(a.id) === "member").length,
  };
  const picked = filter === "all" ? albums : albums.filter((a) => roleOf(a.id) === filter);
  // 정렬은 목록의 앞뒤만 뒤집는다 — 데이터에 수정 시각이 따로 없다.
  const list = recent ? picked : [...picked].reverse();
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
          albums.length > 1 && (
            <div className="-mr-2 flex shrink-0 items-center">
              {/* 분류 — 내가 만든 앨범과 초대받은 앨범을 갈라 본다 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="quiet" size="sm" className="px-2">
                    {filterLabels[filter]}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {albumFilters.map((key) => (
                    <DropdownMenuItem key={key} onSelect={() => setFilter(key)}>
                      {filterLabels[key]}
                      <span className="ml-auto pl-4 text-xs tabular-nums text-body-mid">
                        {counts[key]}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 정렬 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="quiet" size="sm" className="px-2">
                    {recent ? "최근 수정순" : "오래된 순"}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setRecent(true)}>최근 수정순</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setRecent(false)}>오래된 순</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      />

      {list.length === 0 ? (
        <Card variant="outline" size="sm" className="mt-4">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-muted text-body">
              <Image className="size-5" />
            </span>
            {albums.length === 0 ? (
              <>
                <b className="text-[15px] font-semibold text-ink">아직 참여 중인 앨범이 없어요</b>
                <small className="text-sm leading-relaxed text-body">
                  새 앨범을 만들거나,
                  <br />
                  가족이 보낸 참여 링크로 들어와보세요.
                </small>
              </>
            ) : (
              <>
                <b className="text-[15px] font-semibold text-ink">
                  {filterLabels[filter]} 앨범이 없어요
                </b>
                <Button variant="outline" size="sm" className="mt-1" onClick={() => setFilter("all")}>
                  전체 보기
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {list.map((item) => (
            <AlbumCard
              key={item.id}
              album={item}
              membership={membership[item.id]}
              photoCount={photosOf(item.id).length}
              members={[
                { character: session?.tone ?? 0, color: session?.color ?? 0 },
                // 링크를 타고 합류하면 참여자 명단에도 내가 들어간다 — 두 번 세지 않는다.
                ...(participants[item.id] ?? [])
                  .filter((p) => p.name !== session?.name)
                  .map((p) => ({ character: p.character, color: p.color })),
              ]}
              onOpen={() => onOpenAlbum(item.id, "detail")}
              menu={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon-xs"
                      className="absolute top-2 right-2 rounded-full bg-canvas/90 text-ink hover:bg-canvas"
                      aria-label={`${item.title} 더보기`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Ellipsis className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={() => onOpenAlbum(item.id, "albumEdit")}>
                      정보 수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onOpenAlbum(item.id, "invite")}>
                      공유
                    </DropdownMenuItem>
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
          ))}
        </div>
      )}

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
  membership,
  photoCount,
  members,
  onOpen,
  menu,
}: {
  album: AlbumCardData;
  /** 내가 이 앨범에 들어온 경위 — 초대받은 앨범이면 카드에 표시한다. */
  membership?: Membership;
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
        <img src={album.cover} alt={album.coverAlt} className="size-full object-cover" />
        {/* 내가 만든 앨범과 링크를 타고 합류한 앨범이 한 목록에 섞인다 — 어느 쪽인지 칩으로 알린다. */}
        <Badge variant="glass" className="absolute top-2 left-2 max-w-[calc(100%-56px)]">
          <span className="truncate">
            {membership?.role === "member" ? "초대받은" : "내가 만든"}
          </span>
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
