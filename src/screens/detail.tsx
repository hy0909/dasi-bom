import { useState } from "react";
import { ArrowLeft, ChevronDown, Pause, Play, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { CharacterAvatar } from "@/components/character-avatar";
import { type Album, formatAlbumPeriod } from "@/data/album";
import { participantsOf } from "@/data/family";
import { formatShortDate, photos } from "@/data/photos";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

type Tab = "사진" | "목소리" | "기록" | "연대표";

export function DetailScreen({ go, album, notify }: { go: Go; album: Album; notify: Notify }) {
  const [tab, setTab] = useState<Tab>("사진");
  const [sorted, setSorted] = useState(false);
  const [first, ...rest] = album.title.split(" ");
  const session = useSession();

  return (
    <>
      {/* hero — 좌우 여백과 상단 여백을 무시하고 꽉 채우는 1:1 사진 */}
      <section className="relative -mx-5 -mt-[max(16px,env(safe-area-inset-top))]">
        <div className="relative aspect-square w-full overflow-hidden bg-ink">
          <img
            src={photos[0].src}
            alt="해질 녘 에펠탑을 함께 바라보는 가족"
            className="size-full object-cover"
          />
          {/* 아래쪽은 제목이, 위쪽은 상단 버튼이 읽히도록 각각 어둡게 */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 text-canvas">
            <p className="text-sm font-medium text-canvas-soft/80">{formatAlbumPeriod(album)}</p>
            <h1 className="font-heading text-display-xl font-bold">
              {first}
              {rest.length > 0 && (
                <>
                  <br />
                  {rest.join(" ")}
                </>
              )}
            </h1>
            <span className="mt-1 flex -space-x-2">
              <CharacterAvatar index={session?.tone} color={session?.color} className="size-8 ring-2 ring-ink/50" />
              {participantsOf(album.inviteCode).map((p) => (
                <CharacterAvatar
                  key={p.name}
                  index={p.character}
                  color={p.color}
                  className="size-8 ring-2 ring-ink/50"
                />
              ))}
              <span className="sr-only">
                나를 포함해 {participantsOf(album.inviteCode).length + 1}명이 함께해요
              </span>
            </span>
          </div>
        </div>

        {/* 사진 위에 얹는 상단 바 — 흰색 컨트롤 */}
        <header className="absolute inset-x-0 top-0 flex h-14 items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-2 text-canvas hover:bg-canvas/15 hover:text-canvas"
            onClick={() => go("home")}
            aria-label="뒤로가기"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-canvas bg-transparent text-canvas hover:bg-canvas/15 hover:text-canvas"
            onClick={() => go("invite")}
          >
            <UserPlus className="size-4" />
            초대
          </Button>
        </header>
      </section>

      {/* summary — card-content */}
      <Card size="sm" className="mt-4">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={album.status === "완료" ? "ink" : "primary"}>{album.status}</Badge>
            <p className="min-w-0 flex-1 text-sm text-body">
              {album.status === "완료"
                ? "가족의 기록이 모두 담겼어요."
                : "사진 1장의 답변을 기다리고 있어요."}
            </p>
            <Button variant="outline" size="sm" onClick={() => go("albumEdit")}>
              앨범 정보
            </Button>
          </div>
          {album.status === "기록 중" && (
            <Button variant="secondary" className="w-full" onClick={() => go("interview")}>
              이어서 기록 남기기
            </Button>
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-6 gap-5 pb-20">
        <TabsList variant="line" className="w-full border-b border-border">
          {(["사진", "목소리", "기록", "연대표"] as Tab[]).map((item) => (
            <TabsTrigger key={item} value={item} className="text-[15px]">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="사진">
          <PhotoTab
            go={go}
            sorted={sorted}
            onSort={() => {
              setSorted(!sorted);
              notify(sorted ? "촬영일 순으로 정렬했어요" : "진행 상태 순으로 정렬했어요");
            }}
          />
        </TabsContent>
        <TabsContent value="목소리">
          <VoiceTab notify={notify} />
        </TabsContent>
        <TabsContent value="기록">
          <StoryTab go={go} />
        </TabsContent>
        <TabsContent value="연대표">
          <TimelineTab go={go} />
        </TabsContent>
      </Tabs>

      <div className="pointer-events-none fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2">
        <Button size="lg" className="pointer-events-auto shadow-float" onClick={() => go("upload")}>
          <Plus className="size-5" strokeWidth={2.5} />
          사진 추가
        </Button>
      </div>
    </>
  );
}


function PhotoTab({ go, sorted, onSort }: { go: Go; sorted: boolean; onSort: () => void }) {
  const list = sorted ? [...photos].reverse() : photos;
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={<span className="text-lg">사진 3장</span>}
        description="사진을 눌러 기록을 이어가세요"
        action={
          <Button variant="quiet" size="sm" className="-mr-2" onClick={onSort}>
            {sorted ? "진행 상태순" : "촬영일순"}
            <ChevronDown className="size-4" />
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        {list.map((photo) => {
          const index = photos.indexOf(photo);
          return (
            <button
              type="button"
              key={photo.title}
              onClick={() => go(index === 0 ? "story" : "interview")}
              className="group/tile flex flex-col gap-2 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="relative block aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]"
                />
                {/* 완료한 사진은 표시하지 않는다 — 아직 채울 사진만 눈에 띄면 된다 */}
                {photo.status === "기록 중" && (
                  <Badge variant="glass" className="absolute top-2 right-2">
                    기록 중
                  </Badge>
                )}
              </span>
              <span className="px-0.5">
                <b className="block truncate text-sm font-semibold">{photo.title}</b>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function VoiceTab({ notify }: { notify: Notify }) {
  const [playing, setPlaying] = useState<number | null>(null);
  function toggle(i: number, name: string) {
    const next = playing === i ? null : i;
    setPlaying(next);
    notify(next === null ? "재생을 멈췄어요" : `${name}의 목소리를 재생합니다`);
  }
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={<span className="text-lg">가족의 목소리 4개</span>}
        description="그날의 온도가 담긴 목소리"
      />
      <div className="flex flex-col divide-y divide-border">
        {["엄마", "아버지", "나"].map((name, i) => (
          <article key={name} className="flex items-center gap-3 py-3">
            <Button
              variant={playing === i ? "default" : "secondary"}
              size="icon"
              className="rounded-full"
              onClick={() => toggle(i, name)}
              aria-label={`${name} 목소리 ${playing === i ? "일시정지" : "재생"}`}
            >
              {playing === i ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
            </Button>
            <div className="min-w-0 flex-1">
              <b className="block text-[15px] font-semibold">{name}의 목소리</b>
              <span className="block truncate text-[13px] text-body-mid">{photos[i].title}</span>
            </div>
            <time className="text-sm tabular-nums text-body">0:{24 + i * 13}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

function StoryTab({ go }: { go: Go }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={<span className="text-lg">완성된 기록 2편</span>}
        description="AI가 가족의 답변을 정리했어요"
      />
      <Card
        size="sm"
        role="button"
        tabIndex={0}
        onClick={() => go("story")}
        onKeyDown={(e) => e.key === "Enter" && go("story")}
        className="cursor-pointer transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      >
        <CardContent className="flex gap-4">
          <img src={photos[0].src} alt="해질 녘 에펠탑을 바라보는 가족" className="size-20 shrink-0 rounded-lg object-cover" />
          <span className="min-w-0">
            <small className="block text-xs text-body-mid">2023. 07. 10 · 파리</small>
            <b className="mt-0.5 block text-[15px] font-semibold">파리에 도착한 첫날</b>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-body">
              긴 이동 끝에 도착한 가족들은 함께 저녁을 먹으며 여행의 시작을 기념했습니다.
            </p>
          </span>
        </CardContent>
      </Card>
    </section>
  );
}

function TimelineTab({ go }: { go: Go }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={<span className="text-lg">우리 여행 연대표</span>}
        description="기록이 시간순으로 정리됐어요"
      />
      <ol className="relative ml-[58px] flex flex-col border-l border-border">
        {photos.map((photo, i) => (
          <li key={photo.title} className="relative">
            <button
              type="button"
              onClick={() => go(i === 0 ? "story" : "interview")}
              className="flex w-full items-center gap-3 rounded-md py-3 pl-5 text-left outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <time className="absolute -left-[58px] w-[46px] text-right text-xs font-semibold tabular-nums text-body">
                {formatShortDate(photo.takenAt)}
              </time>
              <span
                className={cn(
                  "absolute -left-[5px] size-[9px] rounded-full ring-2 ring-canvas",
                  i === 0 ? "bg-primary" : "bg-mute",
                )}
              />
              <img src={photo.src} alt="" className="size-12 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <b className="block truncate text-[15px] font-semibold">{photo.title}</b>
                <small className="block text-xs text-body-mid">{photo.place}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
