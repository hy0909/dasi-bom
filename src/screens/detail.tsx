import { useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  EllipsisVertical,
  Pause,
  Pencil,
  PenLine,
  Play,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { StatusFilter, useStatusFilter } from "@/components/status-filter";
import { CharacterAvatar } from "@/components/character-avatar";
import { MemberRow } from "@/components/member-row";
import { PhotoLightbox } from "@/components/photo-lightbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  albumPeriod,
  coverShapeOf,
  formatAlbumPeriod,
  formatKoreanDateWithDay,
} from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { type Participant, useAlbumParticipants } from "@/data/family";
import { useMyAlbums } from "@/data/membership";
import {
  type Photo,
  formatDate,
  formatDuration,
  formatShortDate,
  formatTime,
  byTakenAt,
  photoStatus,
  useAlbumPhotos,
} from "@/data/photos";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

/** 상세 화면의 큰 두 갈래 — 읽는 곳과 고치는 곳을 나눈다. */
type Section = "앨범" | "기록";
/** 기록 안에서 갈라지는 분류 */
type RecordTab = "사진" | "목소리" | "글" | "연대표";

/** 이름을 앞에서부터 이만큼만 쓰고 나머지는 '외 n명'으로 접는다. */
const NAMES_SHOWN = 3;
/** 겹쳐 보여줄 프로필 수 */
const FACES_SHOWN = 3;

/**
 * 사진 위 참여자 줄 — 프로필 몇 개와 이름 요약을 한 줄로 두고,
 * 누르면 전체 명단을 모달로 편다. 사람이 몇이든 hero 높이는 그대로다.
 */
function MemberSummary({
  session,
  others,
  iAmOwner,
}: {
  session: ReturnType<typeof useSession>;
  others: Participant[];
  iAmOwner: boolean;
}) {
  const me = {
    character: session?.tone ?? 0,
    color: session?.color ?? 0,
    name: session?.name ? `나 (${session.name})` : "나",
  };
  const total = others.length + 1;
  const names = ["나", ...others.map((p) => p.name)];
  const shown = names.slice(0, NAMES_SHOWN);
  const hidden = names.length - shown.length;
  const faces = [
    { character: me.character, color: me.color, key: "me" },
    ...others.map((p) => ({ character: p.character, color: p.color, key: p.name })),
  ].slice(0, FACES_SHOWN);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="-mx-1 mt-3 flex items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors outline-none hover:bg-canvas/10 focus-visible:ring-3 focus-visible:ring-canvas/40"
        >
          {/* 맨 앞 한 명만 온전히 보이고, 나머지는 그 뒤에서 오른쪽으로 조금씩만 내민다 */}
          <span className="flex shrink-0 -space-x-6">
            {faces.map((f, i) => (
              <CharacterAvatar
                key={f.key}
                index={f.character}
                color={f.color}
                className={cn("size-8 ring-2 ring-ink/50", i === 0 ? "z-20" : i === 1 ? "z-10" : "z-0")}
              />
            ))}
          </span>
          <span className="min-w-0 truncate text-[13px] font-semibold text-canvas-soft/90">
            {shown.join(" · ")}
            {hidden > 0 && <span className="text-canvas-soft/60"> 외 {hidden}명</span>}
          </span>
          <span className="sr-only">기록 중인 사람 {total}명 — 눌러서 전체 보기</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[360px] gap-3 p-5">
        <DialogHeader>
          <DialogTitle>기록 중인 사람 {total}명</DialogTitle>
          <DialogDescription>
            링크를 받은 가족은 누구나 이 앨범에 기록을 남길 수 있어요.
          </DialogDescription>
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
              trailing={<Badge variant={p.status === "참여 중" ? "primarySoft" : "default"}>{p.status}</Badge>}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const session = useSession();

  // 화면에 보이는 숫자는 모두 이 앨범의 사진·참여자에서 나온다.
  const photos = byTakenAt(useAlbumPhotos(album.id));
  const participants = useAlbumParticipants()[album.id] ?? [];
  // 링크를 타고 합류하면 참여자 명단에도 내가 들어간다 — 프로필을 두 번 세지 않는다.
  const others = participants.filter((p) => p.name !== session?.name);
  const iAmOwner = useMyAlbums()[album.id]?.role !== "member";
  // 기간을 비워 둔 앨범은 사진의 촬영 날짜가 곧 기간이다 — 사진이 없으면 아직 기간도 없다.
  const period = formatAlbumPeriod(albumPeriod(album, photos));

  return (
    <>
      {/* hero — 좌우 여백과 상단 여백을 무시하고 꽉 채우는 4:5 사진. 앨범 커버와 같은 비율이라 열림 모션이 그대로 이어진다 */}
      <section className="relative -mx-5 -mt-[max(16px,env(safe-area-inset-top))]">
        <div className={cn("relative w-full overflow-hidden bg-ink", coverShapeOf(album).cls)}>
          <img src={album.cover} alt={album.coverAlt} className="size-full object-cover" />
          {/* 아래쪽은 제목이, 위쪽은 상단 버튼이 읽히도록 각각 어둡게 */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 text-left text-canvas">
            {period && <p className="text-sm font-medium text-canvas-soft/80">{period}</p>}
            {/* 제목은 한 줄로 둔다 — 폭을 넘길 때만 저절로 다음 줄로 넘어간다 */}
            <h1 className="font-heading text-display-xl font-bold text-balance">{album.title}</h1>
            <MemberSummary
              session={session}
              others={others}
              iAmOwner={iAmOwner}
            />
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
          <div className="flex items-center gap-1">
            {/* 기록하기 — 아래 요약 카드에 있던 것을 여기로 올렸다 */}
            <Button
              variant="outline"
              size="sm"
              className="border-canvas bg-transparent text-canvas hover:bg-canvas/15 hover:text-canvas"
              onClick={() => go("recordList")}
            >
              <PenLine className="size-4" />
              기록
            </Button>
            {/* 사진 추가도 같은 자리에 같은 모양으로 — 아래 떠 있던 버튼을 여기로 올렸다 */}
            <Button
              variant="outline"
              size="sm"
              className="border-canvas bg-transparent text-canvas hover:bg-canvas/15 hover:text-canvas"
              onClick={() => go("upload")}
            >
              <Plus className="size-4" strokeWidth={2.5} />
              사진 추가
            </Button>
            {/* 앨범에 손대는 일은 여기 모은다 — 바깥을 누르면 닫힌다 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="-mr-2 text-canvas hover:bg-canvas/15 hover:text-canvas aria-expanded:bg-canvas/15"
                  aria-label="앨범 메뉴"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-3">
                {/* 초대도 자주 쓰는 일은 아니다 — 앨범에 손대는 일끼리 여기 모은다 */}
                <DropdownMenuItem onSelect={() => go("invite")}>구성원 초대</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => go("albumEdit")}>앨범 수정</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      </section>

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
    </>
  );
}

/** 비어 있는 자리를 지키는 안내 */
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-body-mid">{children}</p>;
}

/* ── 앨범 — 사진과 글, 목소리가 한 줄기로 이어지는 읽기 화면 ─────────────── */


/** 문자열을 32비트 정수 씨앗으로 — 같은 앨범이면 같은 기울기 순서가 나온다. */
function seedOf(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * 사진마다 즉석사진 프레임의 기울기(도) — 좌우 0.5~6도.
 * 대개 왼쪽·오른쪽을 번갈아 가고(80%), 가끔 같은 쪽이 이어진다. 이웃과 같은 각도는 피한다.
 */
function frameTilts(seed: string, count: number) {
  let s = seedOf(seed);
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const out: number[] = [];
  let side = rnd() < 0.5 ? -1 : 1;
  for (let i = 0; i < count; i++) {
    if (i > 0 && rnd() < 0.8) side = -side;
    let mag = 0.5 + rnd() * 5.5;
    const prev = out[i - 1];
    // 같은 쪽으로 이어질 때 각도까지 비슷하면 눈에 띄게 벌린다.
    if (prev !== undefined && Math.sign(prev) === side && Math.abs(Math.abs(prev) - mag) < 1.5) {
      mag = Math.abs(prev) > 3.5 ? Math.abs(prev) - 2.5 : Math.abs(prev) + 2.5;
    }
    out.push(Math.round(side * mag * 10) / 10);
  }
  return out;
}

/** 프레임 안쪽 여백 — 옆 12px씩, 위 12px, 아래 40px (p-3 pb-10). */
const FRAME_X = 24;
const FRAME_Y = 52;
/** 본문 폭 기준값(px) — 폰 캔버스 430 - 좌우 여백 40. 실제 폭은 %로 따라간다. */
const BODY_W = 390;

/**
 * 기울어진 프레임이 본문 폭을 넘지 않는 가로 폭(px)과, 회전으로 위아래로 삐져나오는 여유(px).
 * ratio = 사진 가로/세로. 회전한 사각형의 가로 폭 w·cos + h·sin ≤ 본문 폭을 만족하는 w를 푼다.
 */
function tiltLayout(deg: number, ratio: number) {
  const a = (Math.abs(deg) * Math.PI) / 180;
  const sin = Math.sin(a);
  const cos = Math.cos(a);
  const w = Math.min(BODY_W, (BODY_W + (FRAME_X / ratio - FRAME_Y) * sin) / (cos + sin / ratio));
  const h = (w - FRAME_X) / ratio + FRAME_Y;
  const extra = Math.max(0, (w * sin + h * cos - h) / 2);
  return {
    box: { paddingBlock: Math.ceil(extra) } as CSSProperties,
    frame: {
      width: `${Math.round((w / BODY_W) * 1000) / 10}%`,
      transform: `rotate(${deg}deg)`,
    } as CSSProperties,
  };
}

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
  // 기울기는 앨범마다 고정된다 — 다시 그려도 같은 사진은 같은 각도.
  const tilts = frameTilts(album.id, photos.length);
  // 사진 비율은 로드된 뒤 알 수 있다 — 그때 폭과 여유를 다시 맞춘다. 그전엔 4:3으로 본다.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  /** 크게 보고 있는 사진 — 누르면 화면을 덮고 열린다 */
  const [zoomed, setZoomed] = useState<Photo | null>(null);

  if (photos.length === 0)
    return <Empty>아직 사진이 없어요. 위 ‘사진 추가’로 시작해보세요.</Empty>;

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

          {/* 본문 사진은 즉석사진 프레임에 담는다 — 종이 질감, 아래가 두꺼운 여백, 퍼지는 그림자.
              사진은 원본 가로세로 비율 그대로 프레임 폭을 채우고, 프레임은 사진마다 다른 각도로 기울인다.
              기울어진 프레임이 옆 여백을 넘지 않도록 각도에 맞춰 폭을 줄이고 위아래 여유를 둔다. */}
          <div style={tiltLayout(tilts[i], ratios[photo.src] ?? 4 / 3).box}>
            <figure
              className="polaroid mx-auto p-3 pb-10"
              style={tiltLayout(tilts[i], ratios[photo.src] ?? 4 / 3).frame}
            >
              <div className="polaroid-photo">
                {/* 누르면 화면 가득 크게 본다 */}
                <button
                  type="button"
                  onClick={() => setZoomed(photo)}
                  aria-label={`${photo.title} 크게 보기`}
                  className="block w-full cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt ?? photo.title}
                    className="block h-auto w-full"
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.currentTarget;
                      if (naturalWidth && naturalHeight)
                        setRatios((m) =>
                          m[photo.src] ? m : { ...m, [photo.src]: naturalWidth / naturalHeight },
                        );
                    }}
                  />
                </button>
              </div>
            </figure>
          </div>

          <h2 className="mt-1 font-heading text-display-sm font-bold">{photo.title}</h2>

          {photo.story ? (
            <p className="text-[15px] leading-relaxed text-body">{photo.story}</p>
          ) : (
            // 높이는 아래 목소리 줄과 같게 — 테두리 1px 두 줄만큼 위아래를 덜어낸다(11+36+11+2=60)
            <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-mute px-4 py-[11px]">
              <p className="min-w-0 text-sm leading-relaxed text-body-mid">
                그 날의 이야기를 기록해요.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => go("interview")}
              >
                기록하기
              </Button>
            </div>
          )}

          {(photo.voices ?? []).length > 0 && (
            <div className="mt-1 flex flex-col divide-y divide-border rounded-lg bg-accent/70 px-3">
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

      <PhotoLightbox
        photo={zoomed ? { src: zoomed.src, alt: zoomed.alt ?? zoomed.title } : null}
        onClose={() => setZoomed(null)}
      />

      {/* 책의 맺음말처럼 — 읽는 날짜와 함께 한 줄로 닫는다 */}
      <p className="border-t border-border pt-6 text-center font-serif text-sm italic text-body-mid">
        {formatKoreanDateWithDay(new Date())} 기록
      </p>
    </article>
  );
}

/** 목소리 한 줄 — 재생과 길이, 그리고 어느 사진에 남긴 목소리인지 */
function VoiceRow({
  name,
  seconds,
  notify,
  trailing,
  caption,
  thumb,
}: {
  name: string;
  seconds: number;
  notify: Notify;
  trailing?: React.ReactNode;
  caption?: string;
  /** 이 목소리가 붙어 있는 사진 — 목록에서는 어느 사진인지 바로 보여준다 */
  thumb?: string;
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
      {thumb && (
        <img src={thumb} alt="" className="size-9 shrink-0 rounded-md object-cover" />
      )}
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
      {/* 기록 안에서 한 번 더 갈라지는 탭 — 바깥 탭과 구분되게 accent 보다 한 톤 짙은 바탕 */}
      <TabsList className="w-full bg-[#e7dfd2]">
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

function PhotoTab({ go, photos }: { go: Go; photos: Photo[] }) {
  const { status, setStatus, counts, list } = useStatusFilter(photos);
  // 걸러 봐도 번호는 앨범에서의 순서 그대로다 — 목소리·글·연대표가 부르는 번호와 같아야 한다.
  const orderOf = (photo: Photo) => photos.indexOf(photo) + 1;

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
              onClick={() => go(photoStatus(photo) === "기록 완료" ? "story" : "interview")}
              className="group/tile flex flex-col gap-2 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="relative block aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={photo.src}
                  alt={photo.alt ?? photo.title}
                  className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]"
                />
                {/* 앨범에서 몇 번째 사진인지 — 목소리·글·연대표가 부르는 번호와 같다. */}
                <Badge variant="glass" className="absolute top-2 left-2 tabular-nums">
                  {orderOf(photo)}번째
                </Badge>
                {/* 기록이 끝난 사진에는 표시를 붙이지 않는다 — 남은 사진만 눈에 띄면 된다. */}
                {photoStatus(photo) === "기록 전" && (
                  <Badge variant="glass" className="absolute top-2 right-2">
                    기록 전
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
  // 목소리는 사진에 딸려 있다 — 앨범에서 몇 번째 사진인지 함께 들고 다닌다.
  const rows = photos.flatMap((photo, i) =>
    (photo.voices ?? []).map((voice) => ({ ...voice, photo, order: i + 1 })),
  );

  if (rows.length === 0)
    return <Empty>아직 도착한 목소리가 없어요. 가족을 초대해보세요.</Empty>;

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-body">전체 {rows.length}개</p>
      {/* 종이 위에 그대로 — 면을 깔지 않고 줄 사이 경계선만 남긴다 */}
      <div className="flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <VoiceRow
            key={`${row.photo.title}-${row.name}`}
            name={row.name}
            seconds={row.seconds}
            thumb={row.photo.src}
            caption={`${row.order}번째 사진 · ${row.photo.title}`}
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
  const orderOf = (photo: Photo) => photos.indexOf(photo) + 1;

  if (photos.length === 0) return <Empty>사진을 추가하면 글을 쓸 수 있어요.</Empty>;

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-body">전체 {counts["전체"]}개</p>
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
                    <span className="font-semibold text-body tabular-nums">
                      {orderOf(photo)}번째 사진
                    </span>{" "}
                    · {formatDate(photo.takenAt)} · {photo.shortPlace}
                  </small>
                  <b className="mt-0.5 block text-[15px] font-semibold">{photo.title}</b>
                  <p className="mt-1 line-clamp-2 text-sm leading-snug text-body">
                    {photo.story ?? "아직 글이 없어요. 가족의 기록이 모이면 정리해드려요."}
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
                {photo.story ? "글 수정" : "기록하기"}
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
        description="사진을 찍은 날짜 순서대로 정리했어요"
      />
      <ol className="relative ml-[58px] flex flex-col border-l border-border">
        {photos.map((photo, i) => (
          <li key={photo.title} className="relative">
            <button
              type="button"
              onClick={() => go(photoStatus(photo) === "기록 완료" ? "story" : "interview")}
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
                <small className="block truncate text-xs text-body-mid">
                  <span className="font-semibold text-body tabular-nums">{i + 1}번째 사진</span> ·{" "}
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
