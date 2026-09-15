import { useState } from "react";
import {
  ArrowLeft,
  AudioLines,
  Image,
  Pause,
  Pencil,
  Play,
  Plus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { CharacterAvatar } from "@/components/character-avatar";
import { formatAlbumPeriod } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { useAlbumParticipants } from "@/data/family";
import {
  type Photo,
  formatDate,
  formatDuration,
  formatShortDate,
  formatTime,
  photosOf,
  voicesOf,
} from "@/data/photos";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

/** 상세 화면의 큰 두 갈래 — 읽는 곳과 고치는 곳을 나눈다. */
type Section = "앨범" | "기록";
/** 기록 안에서 갈라지는 분류 */
type RecordTab = "사진" | "목소리" | "글" | "연대표";

/** 촬영 시각 순 — 연대표와 앨범 읽기 흐름이 같은 순서를 쓴다. */
function byTakenAt(list: Photo[]) {
  return [...list].sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}

export function DetailScreen({
  go,
  album,
  notify,
}: {
  go: Go;
  album: AlbumCardData;
  notify: Notify;
}) {
  const [section, setSection] = useState<Section>("앨범");
  const [first, ...rest] = album.title.split(" ");
  const session = useSession();

  // 화면에 보이는 숫자는 모두 이 앨범의 사진·참여자에서 나온다.
  const photos = byTakenAt(photosOf(album.id));
  const voices = voicesOf(album.id);
  const participants = useAlbumParticipants()[album.id] ?? [];
  // 링크를 타고 합류하면 참여자 명단에도 내가 들어간다 — 프로필을 두 번 세지 않는다.
  const others = participants.filter((p) => p.name !== session?.name);
  const pending = photos.filter((p) => p.status === "기록 중").length;

  return (
    <>
      {/* hero — 좌우 여백과 상단 여백을 무시하고 꽉 채우는 1:1 사진 */}
      <section className="relative -mx-5 -mt-[max(16px,env(safe-area-inset-top))]">
        <div className="relative aspect-square w-full overflow-hidden bg-ink">
          <img src={album.cover} alt={album.coverAlt} className="size-full object-cover" />
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
              <CharacterAvatar
                index={session?.tone}
                color={session?.color}
                className="size-8 ring-2 ring-ink/50"
              />
              {others.map((p) => (
                <CharacterAvatar
                  key={p.name}
                  index={p.character}
                  color={p.color}
                  className="size-8 ring-2 ring-ink/50"
                />
              ))}
              <span className="sr-only">나를 포함해 {others.length + 1}명이 함께해요</span>
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

      {/* summary — 앨범에 무엇이 얼마나 쌓였는지와 남은 일 */}
      <Card size="sm" className="mt-4">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex min-w-0 flex-1 items-center gap-3 text-sm text-body">
              <span className="flex items-center gap-1.5">
                <Image className="size-4 text-body-mid" aria-hidden />
                <span className="sr-only">사진</span>
                {photos.length}
              </span>
              <span className="flex items-center gap-1.5">
                <AudioLines className="size-4 text-body-mid" aria-hidden />
                <span className="sr-only">목소리</span>
                {voices.length}
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={() => go("albumEdit")}>
              앨범 정보
            </Button>
          </div>
          {pending > 0 && (
            <Button
              variant="secondary"
              className="h-auto w-full flex-col items-start gap-0.5 py-3"
              onClick={() => go("recordList")}
            >
              <span className="text-[15px] font-semibold">이어서 기록 남기기</span>
              <span className="text-xs font-medium text-canvas-soft/70">
                전체 {photos.length}장 · 기록 완료 {photos.length - pending}장 · 기록 중 {pending}장
              </span>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 읽을 때는 ‘앨범’, 고칠 때는 ‘기록’ — 상세의 큰 두 갈래 */}
      <Tabs
        value={section}
        onValueChange={(v) => setSection(v as Section)}
        className="mt-6 gap-5 pb-20"
      >
        <TabsList variant="line" className="w-full border-b border-border">
          {(["앨범", "기록"] as Section[]).map((item) => (
            <TabsTrigger key={item} value={item} className="text-[15px]">
              {item}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="앨범">
          <AlbumReader go={go} album={album} photos={photos} notify={notify} />
        </TabsContent>
        <TabsContent value="기록">
          <RecordSection go={go} photos={photos} notify={notify} />
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

/** 비어 있는 자리를 지키는 안내 */
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-body-mid">{children}</p>;
}

/* ── 앨범 — 사진과 글, 목소리가 한 줄기로 이어지는 읽기 화면 ─────────────── */

function AlbumReader({
  go,
  album,
  photos,
  notify,
}: {
  go: Go;
  album: AlbumCardData;
  photos: Photo[];
  notify: Notify;
}) {
  if (photos.length === 0)
    return <Empty>아직 사진이 없어요. 아래 ‘사진 추가’로 시작해보세요.</Empty>;

  return (
    <article className="flex flex-col gap-10">
      {album.description && (
        <p className="text-[15px] leading-relaxed text-body">{album.description}</p>
      )}

      {photos.map((photo, i) => (
        <section key={photo.title} className="flex flex-col gap-3">
          <header className="flex items-baseline gap-2">
            <span className="font-heading text-sm font-bold text-primary tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-xs text-body-mid">
              {formatDate(photo.takenAt)} · {photo.place}
            </span>
          </header>

          {/* 본문 사진은 좌우를 꽉 채운다 — 읽는 흐름이 사진에서 한 번 쉰다 */}
          <div className="-mx-5">
            <img
              src={photo.src}
              alt={photo.alt ?? photo.title}
              className="block w-full object-cover"
            />
          </div>

          <h2 className="mt-1 font-heading text-display-sm font-bold">{photo.title}</h2>

          {photo.story ? (
            <p className="text-[15px] leading-relaxed text-body">{photo.story}</p>
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-lg bg-muted p-4">
              <p className="text-sm leading-relaxed text-body">
                아직 글이 없어요. 가족의 답변이 모이면 이 자리에 이야기가 채워져요.
              </p>
              <Button variant="outline" size="sm" onClick={() => go("interview")}>
                기록 이어가기
              </Button>
            </div>
          )}

          {(photo.voices ?? []).length > 0 && (
            <div className="mt-1 flex flex-col divide-y divide-border rounded-lg bg-muted/60 px-3">
              {(photo.voices ?? []).map((voice) => (
                <VoiceRow
                  key={`${photo.title}-${voice.name}`}
                  name={voice.name}
                  seconds={voice.seconds}
                  notify={notify}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      <p className="border-t border-border pt-6 text-center text-sm text-body-mid">
        여기까지가 지금까지의 기록이에요.
      </p>
    </article>
  );
}

/** 목소리 한 줄 — 재생과 길이만 보여준다 */
function VoiceRow({
  name,
  seconds,
  notify,
  trailing,
  caption,
}: {
  name: string;
  seconds: number;
  notify: Notify;
  trailing?: React.ReactNode;
  caption?: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-3 py-3">
      <Button
        variant={playing ? "default" : "secondary"}
        size="icon-sm"
        className="rounded-full"
        onClick={() => {
          setPlaying(!playing);
          notify(playing ? "재생을 멈췄어요" : `${name}의 목소리를 재생합니다`);
        }}
        aria-label={`${name} 목소리 ${playing ? "일시정지" : "재생"}`}
      >
        {playing ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current" />
        )}
      </Button>
      <div className="min-w-0 flex-1">
        <b className="block truncate text-sm font-semibold">{name}의 목소리</b>
        {caption && <span className="block truncate text-xs text-body-mid">{caption}</span>}
      </div>
      <time className="text-sm tabular-nums text-body">{formatDuration(seconds)}</time>
      {trailing}
    </div>
  );
}

/* ── 기록 — 분류별로 보고 고치는 화면 ──────────────────────────────────── */

function RecordSection({
  go,
  photos,
  notify,
}: {
  go: Go;
  photos: Photo[];
  notify: Notify;
}) {
  const [tab, setTab] = useState<RecordTab>("사진");
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as RecordTab)} className="gap-5">
      <TabsList className="w-full">
        {(["사진", "목소리", "글", "연대표"] as RecordTab[]).map((item) => (
          <TabsTrigger key={item} value={item} className="text-sm">
            {item}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="사진">
        <PhotoTab go={go} photos={photos} />
      </TabsContent>
      <TabsContent value="목소리">
        <VoiceTab go={go} photos={photos} notify={notify} />
      </TabsContent>
      <TabsContent value="글">
        <StoryTab go={go} photos={photos} />
      </TabsContent>
      <TabsContent value="연대표">
        <TimelineTab go={go} photos={photos} />
      </TabsContent>
    </Tabs>
  );
}

/** 기록 중 / 기록 완료로 나눠 보는 필터 */
function StatusFilter({
  value,
  onChange,
  counts,
}: {
  value: "전체" | "기록 중" | "기록 완료";
  onChange: (next: "전체" | "기록 중" | "기록 완료") => void;
  counts: Record<"전체" | "기록 중" | "기록 완료", number>;
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="상태로 보기">
      {(["전체", "기록 중", "기록 완료"] as const).map((item) => (
        <button
          key={item}
          type="button"
          role="radio"
          aria-checked={item === value}
          onClick={() => onChange(item)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            item === value
              ? "border-ink bg-ink text-canvas"
              : "border-border text-body hover:bg-muted",
          )}
        >
          {item} {counts[item]}
        </button>
      ))}
    </div>
  );
}

function useStatusFilter(photos: Photo[]) {
  const [status, setStatus] = useState<"전체" | "기록 중" | "기록 완료">("전체");
  const counts = {
    전체: photos.length,
    "기록 중": photos.filter((p) => p.status === "기록 중").length,
    "기록 완료": photos.filter((p) => p.status === "기록 완료").length,
  };
  const list = status === "전체" ? photos : photos.filter((p) => p.status === status);
  return { status, setStatus, counts, list };
}

function PhotoTab({ go, photos }: { go: Go; photos: Photo[] }) {
  const { status, setStatus, counts, list } = useStatusFilter(photos);

  if (photos.length === 0) return <Empty>아직 사진이 없어요.</Empty>;

  return (
    <section className="flex flex-col gap-4">
      <StatusFilter value={status} onChange={setStatus} counts={counts} />
      {list.length === 0 ? (
        <Empty>이 상태의 사진이 없어요.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((photo) => (
            <button
              type="button"
              key={photo.title}
              // 기록이 끝난 사진은 완성된 글로, 남은 사진은 질문으로 간다.
              onClick={() => go(photo.status === "기록 완료" ? "story" : "interview")}
              className="group/tile flex flex-col gap-2 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="relative block aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={photo.src}
                  alt={photo.alt ?? photo.title}
                  className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]"
                />
                {/* 기록이 끝난 사진에는 표시를 붙이지 않는다 — 남은 사진만 눈에 띄면 된다. */}
                {photo.status === "기록 중" && (
                  <Badge variant="glass" className="absolute top-2 right-2">
                    {photo.status}
                  </Badge>
                )}
              </span>
              <span className="px-0.5">
                <b className="block truncate text-sm font-semibold">{photo.title}</b>
                <small className="block text-xs text-body-mid">
                  {formatShortDate(photo.takenAt)} · {photo.shortPlace}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function VoiceTab({ go, photos, notify }: { go: Go; photos: Photo[]; notify: Notify }) {
  const rows = photos.flatMap((photo) =>
    (photo.voices ?? []).map((voice) => ({ ...voice, photo })),
  );

  if (rows.length === 0)
    return <Empty>아직 도착한 목소리가 없어요. 가족을 초대해보세요.</Empty>;

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-body">전체 {rows.length}개</p>
      <div className="flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <VoiceRow
            key={`${row.photo.title}-${row.name}`}
            name={row.name}
            seconds={row.seconds}
            caption={row.photo.title}
            notify={notify}
            trailing={
              <Button
                variant="quiet"
                size="icon-sm"
                aria-label={`${row.name}의 목소리 수정`}
                onClick={() => go("voice")}
              >
                <Pencil className="size-4" />
              </Button>
            }
          />
        ))}
      </div>
    </section>
  );
}

function StoryTab({ go, photos }: { go: Go; photos: Photo[] }) {
  const { status, setStatus, counts, list } = useStatusFilter(photos);

  if (photos.length === 0) return <Empty>사진을 추가하면 글을 쓸 수 있어요.</Empty>;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={<span className="text-lg">완성된 글 {counts["기록 완료"]}편</span>}
        description="AI가 가족의 답변을 정리했어요"
      />
      <StatusFilter value={status} onChange={setStatus} counts={counts} />

      {list.length === 0 ? (
        <Empty>이 상태의 글이 없어요.</Empty>
      ) : (
        list.map((photo) => (
          <Card key={photo.title} size="sm">
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-4">
                <img
                  src={photo.src}
                  alt={photo.alt ?? photo.title}
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <small className="block text-xs text-body-mid">
                    {formatDate(photo.takenAt)} · {photo.shortPlace}
                  </small>
                  <b className="mt-0.5 block text-[15px] font-semibold">{photo.title}</b>
                  <p className="mt-1 line-clamp-2 text-sm leading-snug text-body">
                    {photo.story ?? "아직 글이 없어요. 가족의 답변이 모이면 정리해드려요."}
                  </p>
                </span>
              </div>
              {/* 완성된 글은 고쳐 쓰고, 아직 없는 글은 질문부터 이어간다. */}
              <Button
                variant={photo.story ? "outline" : "secondary"}
                size="sm"
                className="self-start"
                onClick={() => go(photo.story ? "story" : "interview")}
              >
                <Pencil className="size-3.5" />
                {photo.story ? "글 수정" : "기록 이어가기"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </section>
  );
}

function TimelineTab({ go, photos }: { go: Go; photos: Photo[] }) {
  if (photos.length === 0) return <Empty>사진을 추가하면 시간순으로 정리해드려요.</Empty>;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title={<span className="text-lg">우리 여행 연대표</span>}
        description="사진이 찍힌 시각을 따라 자동으로 정리돼요"
      />
      <ol className="relative ml-[58px] flex flex-col border-l border-border">
        {photos.map((photo, i) => (
          <li key={photo.title} className="relative">
            <button
              type="button"
              onClick={() => go(photo.status === "기록 완료" ? "story" : "interview")}
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
              <img
                src={photo.src}
                alt=""
                className="size-12 shrink-0 rounded-md object-cover"
              />
              <span className="min-w-0">
                <b className="block truncate text-[15px] font-semibold">{photo.title}</b>
                <small className="block text-xs text-body-mid">
                  {formatTime(photo.takenAt)} · {photo.place}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
