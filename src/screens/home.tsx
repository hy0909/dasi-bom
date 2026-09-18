import { useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Image,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/wordmark";
import { BottomNav } from "@/components/bottom-nav";
import { Fab } from "@/components/fab";
import { SectionHeading } from "@/components/section-heading";
import { CharacterAvatar } from "@/components/character-avatar";
import { AlbumCover } from "@/components/album-cover";
import {
  albumPeriod,
  coverColorOf,
  coverShapeOf,
  coverStageTone,
  formatAlbumStart,
} from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { useAlbumParticipants } from "@/data/family";
import { useMyAlbums } from "@/data/membership";
import { usePhotoStore } from "@/data/photos";
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
  albums: myAlbums,
  onOpenAlbum,
  notify,
}: {
  go: Go;
  albums: AlbumCardData[];
  /** 앨범을 지목해 그 앨범의 화면으로 간다 — 카드마다 다른 앨범이 열려야 한다. */
  onOpenAlbum: (id: string, screen: Screen, from?: DOMRect) => void;
  notify: Notify;
}) {
  const [recent, setRecent] = useState(true);
  const [filter, setFilter] = useState<AlbumFilter>("all");
  /** 위쪽 무대에 올려 둔 앨범 — 좌우 화살표나 스와이프로 넘긴다 */
  const [hero, setHero] = useState(0);
  /** 마지막으로 넘긴 방향 — 새 표지가 그쪽에서 밀려 들어온다 */
  const [heroDir, setHeroDir] = useState(1);
  const heroCover = useRef<HTMLDivElement>(null);
  /** 스와이프를 시작한 손끝 */
  const swipeFrom = useRef<{ x: number; y: number } | null>(null);
  const session = useSession();
  const participants = useAlbumParticipants();
  const membership = useMyAlbums();
  const photoStore = usePhotoStore();
  // 기간을 비워 둔 앨범은 사진의 촬영 날짜를 기간으로 쓴다 — 배너와 목록이 같은 날짜를 본다.
  const albums = myAlbums.map((album) => {
    const { startDate, endDate } = albumPeriod(album, photoStore[album.id] ?? []);
    return { ...album, startDate, endDate };
  });
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
  // 앨범이 줄면 무대에 올린 자리도 따라 줄인다.
  const heroAt = albums.length ? Math.min(hero, albums.length - 1) : 0;
  const heroAlbum = albums[heroAt];
  const turnHero = (step: number) => {
    setHeroDir(step);
    setHero((at) => (albums.length ? (at + step + albums.length) % albums.length : 0));
  };
  /** 표지가 이 높이로 서고, 판형에 따라 폭이 정해진다 — 브라우저가 폭을 스스로 계산하게
      두면(w-auto + aspect-ratio) 카카오 인앱처럼 계산이 다른 곳에서 가운데가 틀어진다. */
  const HERO_H = 326;
  const heroShape = heroAlbum ? coverShapeOf(heroAlbum) : null;
  /** 바탕은 지금 올라와 있는 표지의 색을 따라간다 */
  const stageTone = heroAlbum ? coverStageTone(coverColorOf(heroAlbum).hex) : "#2b2521";

  return (
    <>
      {/* 어두운 무대 — 로고는 왼쪽 위 흰 글씨, 그 아래 앨범 한 권을 크게 올린다 */}
      <section
        style={{ backgroundColor: stageTone }}
        className="relative -mx-5 -mt-[max(16px,env(safe-area-inset-top))] px-5 pt-[max(16px,env(safe-area-inset-top))] pb-8 transition-colors duration-500 ease-out"
      >
        <div className="flex h-12 items-center">
          <Wordmark className="text-canvas" />
        </div>

        {heroAlbum ? (
          <>
            {/* 판형이 달라도 무대 높이는 그대로 — 넘길 때 화면이 들썩이지 않는다.
                좌우로 밀면 앨범이 넘어가고, 위아래로 밀면 화면이 그대로 스크롤된다. */}
            <div
              className="relative mt-2 flex h-[338px] touch-pan-y items-center justify-center"
              onTouchStart={(e) => {
                const t = e.touches[0];
                swipeFrom.current = { x: t.clientX, y: t.clientY };
              }}
              onTouchEnd={(e) => {
                const from = swipeFrom.current;
                swipeFrom.current = null;
                if (!from || albums.length < 2) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - from.x;
                const dy = t.clientY - from.y;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) turnHero(dx < 0 ? 1 : -1);
              }}
            >
              {albums.length > 1 && (
                <button
                  type="button"
                  onClick={() => turnHero(-1)}
                  aria-label="이전 앨범"
                  className="absolute left-0 z-10 flex size-10 items-center justify-center rounded-full text-canvas opacity-40 transition-colors outline-none hover:bg-canvas/15 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-canvas/50"
                >
                  <ChevronLeft className="size-6" />
                </button>
              )}
              {/* 앨범 — 정면으로 세워 두고 잔잔한 그림자만 깐다 */}
              <div
                key={heroAlbum.id}
                ref={heroCover}
                style={
                  {
                    width: heroShape ? Math.round(HERO_H / heroShape.aspect) : undefined,
                    "--hero-from": heroDir > 0 ? "30px" : "-30px",
                  } as CSSProperties
                }
                role="button"
                tabIndex={0}
                aria-label={`${heroAlbum.title} 열기`}
                onClick={() =>
                  onOpenAlbum(heroAlbum.id, "detail", heroCover.current!.getBoundingClientRect())
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  onOpenAlbum(heroAlbum.id, "detail", heroCover.current!.getBoundingClientRect())
                }
                className="hero-turn max-w-[78%] cursor-pointer rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-canvas/50"
              >
                <AlbumCover
                  album={heroAlbum}
                  photoCount={photoStore[heroAlbum.id]?.length ?? 0}
                  className="drop-shadow-[0_18px_26px_rgb(0_0_0/0.32)]"
                />
              </div>
              {albums.length > 1 && (
                <button
                  type="button"
                  onClick={() => turnHero(1)}
                  aria-label="다음 앨범"
                  className="absolute right-0 z-10 flex size-10 items-center justify-center rounded-full text-canvas opacity-40 transition-colors outline-none hover:bg-canvas/15 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-canvas/50"
                >
                  <ChevronRight className="size-6" />
                </button>
              )}
            </div>
            <p className="mt-6 truncate text-center text-[15px] font-semibold text-canvas">
              {heroAlbum.title}
            </p>
            <p className="mt-1 text-center text-xs text-canvas-soft/55">
              {formatAlbumStart(heroAlbum)}
            </p>
          </>
        ) : (
          <p className="mt-6 mb-2 text-center text-sm text-canvas-soft/75">
            아직 앨범이 없어요. 아래에서 첫 앨범을 만들어보세요.
          </p>
        )}
      </section>

      <div className="mt-7">
        <h1 className="font-heading text-display-md font-bold">
          기억하고 싶은
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
        className="mt-5 cursor-pointer shadow-none ring-1 ring-border transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      >
        <CardContent className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-canvas">
            <Plus className="size-6" strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[17px] font-semibold text-ink">새 앨범 만들기</b>
            <small className="block text-sm text-body-mid">기록하고 싶은 사진을 첨부해 보세요</small>
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
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
          {list.map((item) => (
            <AlbumCard
              key={item.id}
              album={item}
              photoCount={photoStore[item.id]?.length ?? 0}
              members={[
                { character: session?.tone ?? 0, color: session?.color ?? 0 },
                // 링크를 타고 합류하면 참여자 명단에도 내가 들어간다 — 두 번 세지 않는다.
                ...(participants[item.id] ?? [])
                  .filter((p) => p.name !== session?.name)
                  .map((p) => ({ character: p.character, color: p.color })),
              ]}
              onOpen={(from) => onOpenAlbum(item.id, "detail", from)}
              menu={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="-mt-1 -mr-2 shrink-0 text-mute hover:bg-transparent hover:text-body aria-expanded:bg-transparent aria-expanded:text-body"
                      aria-label={`${item.title} 더보기`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EllipsisVertical className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={() => onOpenAlbum(item.id, "albumEdit")}>
                      정보 수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onOpenAlbum(item.id, "invite")}>
                      공유
                    </DropdownMenuItem>
                    {/* 수정·공유는 구성원 누구나. 삭제만 앨범을 만든 사람에게 남긴다. */}
                    {roleOf(item.id) === "owner" && (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => notify("삭제는 확인 후 진행돼요")}
                      >
                        삭제
                      </DropdownMenuItem>
                    )}
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
  photoCount,
  members,
  onOpen,
  menu,
}: {
  album: AlbumCardData;
  photoCount: number;
  members: { character: number; color: number }[];
  onOpen: (from: DOMRect) => void;
  menu?: React.ReactNode;
}) {
  const overflow = members.length - MAX_FACES;
  const coverRef = useRef<HTMLDivElement>(null);
  // 열림 모션이 이 커버 자리에서 시작하도록 위치를 넘긴다.
  const open = () => onOpen(coverRef.current!.getBoundingClientRect());
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      className="group/album album-3d-hover flex cursor-pointer flex-col gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      {/* 패브릭 앨범 — 그림자가 잘리지 않게 옆과 아래에 숨 쉴 공간을 둔다 */}
      <div className="relative px-2 pt-1 pb-3">
        <div ref={coverRef}>
          <AlbumCover album={album} photoCount={photoCount} tiltable />
        </div>
        <span className="sr-only">{album.coverAlt}</span>
      </div>
      <div className="flex flex-col gap-6 px-1">
        <div>
          {/* 제목 오른쪽 끝에 더보기 — 연한 회색으로, 카드 오른쪽 가장자리에 붙인다 */}
          <div className="flex items-start justify-between gap-1">
            <h3 className="line-clamp-2 min-w-0 font-heading text-[15px] leading-snug font-bold">
              {album.title}
            </h3>
            {menu}
          </div>
          <p className="mt-0.5 text-xs text-body-mid">{formatAlbumStart(album)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="flex -space-x-1.5">
              {members.slice(0, MAX_FACES).map((m, i) => (
                <CharacterAvatar
                  key={i}
                  index={m.character}
                  color={m.color}
                  className="size-6 ring-2 ring-canvas"
                />
              ))}
            </span>
            {/* 사진 개수와 같은 굵기·같은 색 — 굵게 두면 그쪽만 진해 보인다 */}
            {overflow > 0 && <span className="text-xs text-body">+{overflow}</span>}
            <span className="sr-only">{members.length}명이 함께해요</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-body">
            <Image className="size-3.5 text-body-mid" aria-hidden />
            <span className="sr-only">사진</span>
            {photoCount}
          </span>
        </div>
      </div>
    </div>
  );
}
