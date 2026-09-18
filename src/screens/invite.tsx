import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Info,
  Plus,
  RefreshCw,
  RotateCcw,
  Share2,
  X,
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
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { SectionHeading } from "@/components/section-heading";
import { MemberRow } from "@/components/member-row";
import {
  INVITE_DAYS,
  albumPeriod,
  formatAlbumPeriod,
  formatAlbumStart,
  formatKoreanDate,
  inviteDaysLeft,
  inviteExpiresAt,
  isInviteExpired,
} from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { reinvite, useAlbumParticipants } from "@/data/family";
import { usePhotoStore } from "@/data/photos";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

const statusVariant = { "참여 중": "primarySoft", 초대됨: "default" } as const;

type InviteProps = {
  go: Go;
  /** 초대할 수 있는 앨범 — 내가 참여 중인 앨범만 들어온다. */
  albums: AlbumCardData[];
  /** 만료된 링크를 새 코드로 다시 발급한다. */
  onReissue: (albumId: string) => void;
  /** 처음 골라 둘 앨범 — 방금 보고 있던 앨범이다. */
  initialAlbumId?: string;
  /** 앨범 상세에서 들어온 경우 — 그 앨범으로 고정한다. */
  locked?: boolean;
  /** 앨범을 막 만들고 넘어온 경우 — 만들기 흐름의 마지막 단계로 보여준다. */
  justCreated?: boolean;
  /** 상위 화면에서 들어온 경우에만 전달된다. */
  back?: () => void;
  notify: Notify;
};

export function InviteScreen(props: InviteProps) {
  // 참여 중인 앨범이 없으면 초대할 곳도 없다 — 링크를 만들 앨범부터 있어야 한다.
  if (props.albums.length === 0) return <NoAlbumInvite go={props.go} back={props.back} />;
  return <InviteBody {...props} />;
}

/** 초대할 앨범이 하나도 없을 때 — 링크 대신 앨범 만들기로 안내한다. */
function NoAlbumInvite({ go, back }: Pick<InviteProps, "go" | "back">) {
  return (
    <>
      {back && <Topbar back={back} title="초대" />}
      <section className={cn("flex flex-col gap-3", back ? "mt-4" : "mt-2.5")}>
        {/* 탭으로 들어오면 알림·내 설정과 같은 짧은 제목. 앨범에서 들어오면 상단 바가 이미 '초대'다. */}
        <h1 className="font-heading text-display-lg font-bold">
          {back ? "우리의 추억을 기록해요" : "초대하기"}
        </h1>
        <p className="text-base leading-relaxed text-body">
          아직 참여 중인 앨범이 없어요.
          <br />
          앨범을 만들면 가족에게 참여 링크를 보낼 수 있어요.
        </p>
      </section>
      <Button size="lg" className="mt-6 w-full" onClick={() => go("create")}>
        <Plus className="size-5" />
        새 앨범 만들기
      </Button>
      {!back && <BottomNav go={go} active="invite" />}
    </>
  );
}

function InviteBody({
  go,
  albums,
  initialAlbumId,
  locked = false,
  justCreated = false,
  onReissue,
  back,
  notify,
}: InviteProps) {
  const [selectedId, setSelectedId] = useState(initialAlbumId ?? albums[0]?.id);
  const album = useMemo(
    () => albums.find((a) => a.id === selectedId) ?? albums[0],
    [albums, selectedId],
  );
  const participants = useAlbumParticipants()[album.id] ?? [];
  const photoStore = usePhotoStore();
  /** 기간을 비워 둔 앨범은 사진의 촬영 날짜가 기간이 된다. */
  const periodOf = (item: AlbumCardData) => albumPeriod(item, photoStore[item.id] ?? []);

  const [link, setLink] = useState("참여 링크 준비 중…");
  useEffect(() => {
    setLink(`${window.location.origin}${window.location.pathname}?invite=${album.inviteCode}`);
  }, [album.inviteCode]);

  // 링크는 발급일로부터 일주일만 쓴다.
  const expired = isInviteExpired(album);
  const leftDays = inviteDaysLeft(album);
  const expiresAt = inviteExpiresAt(album);
  const expiresShort = `${expiresAt.getMonth() + 1}월 ${expiresAt.getDate()}일`;
  // 말풍선이 폰 캔버스 밖으로 나가지 않게 — 넓은 화면 미리보기에서도 폰 폭 안에 머문다.
  const [canvas, setCanvas] = useState<Element | null>(null);
  useEffect(() => setCanvas(document.querySelector("[data-screen]")), []);

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
      {/* 탭으로 들어오면 상단 바 없이 제목이 홈의 워드마크 높이에서 시작하고, 앨범에서 들어오면 뒤로가기 상단 바를 둔다. */}
      {back && <Topbar back={back} title="초대" />}
      {/* 막 만든 앨범이면 뒤로가기를 두지 않는다 — 만들기 화면으로는 되돌아가지 않는다.
          나가는 길은 오른쪽 위 닫기(앨범 홈)와 아래 ‘앨범에 사진 추가’ 둘이다. */}
      {justCreated ? (
        <>
          <header className="relative z-10 flex h-14 items-center justify-end">
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-2"
              onClick={() => go("home")}
              aria-label="닫기"
            >
              <X className="size-5" />
            </Button>
          </header>
          <section className="mt-4 flex flex-col gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-ink">
              <Check className="size-6" strokeWidth={2.5} />
            </span>
            <h1 className="font-heading text-display-lg font-bold">앨범을 만들었어요</h1>
            <p className="text-base leading-relaxed text-body">
              이제 함께 기록할 가족을 초대해보세요.
              <br />
              링크를 받은 가족은 가입 없이 참여할 수 있어요.
            </p>
          </section>
        </>
      ) : (
        <section className={cn("flex flex-col gap-3", back ? "mt-4" : "mt-2.5")}>
          {/* 탭으로 들어오면 알림·내 설정과 같은 짧은 제목. 앨범에서 들어오면 상단 바가 이미 '초대'다. */}
          <h1 className="font-heading text-display-lg font-bold">
            {back ? "우리의 추억을 기록해요" : "초대"}
          </h1>
          <p className="text-base leading-relaxed text-body">
            앨범 구성원은 누구나
            <br />
            새 구성원을 초대할 수 있어요.
          </p>
        </section>
      )}

      {/* 방금 만든 앨범이 무엇인지 한 줄로 확인시켜 준다. */}
      {justCreated && (
        <div className="mt-6 flex items-center gap-3 rounded-lg bg-muted p-3">
          <img src={album.cover} alt="" className="size-12 shrink-0 rounded-md object-cover" />
          <span className="min-w-0">
            <b className="block truncate text-[15px] font-semibold">{album.title}</b>
            <small className="block text-xs text-body-mid">
              {formatAlbumPeriod(periodOf(album)) || "사진을 넣으면 촬영 날짜로 기간이 채워져요"}
            </small>
          </span>
        </div>
      )}

      {/* 초대는 앨범 단위 — 어느 앨범으로 부를지 먼저 고른다.
          앨범이 여럿이면 목록을 다 펴 두지 않고 고른 하나만 보여준다. */}
      {!locked && albums.length > 1 && (
        <section className="mt-6 flex flex-col gap-2">
          <span className="text-xs font-semibold text-body">초대할 앨범</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-14 w-full items-center gap-3 rounded-lg border border-border px-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40 aria-expanded:bg-muted"
              >
                <img src={album.cover} alt="" className="size-9 shrink-0 rounded-md object-cover" />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold">{album.title}</b>
                  <small className="block truncate text-[11.5px] text-body-mid">
                    {[formatAlbumStart(periodOf(album)), `사진 ${photoStore[album.id]?.length ?? 0}장`]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <ChevronDown className="size-4 shrink-0 text-body-mid" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[260px] p-1">
              {albums.map((item) => {
                const on = item.id === album.id;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onSelect={() => setSelectedId(item.id)}
                    className="h-14 gap-3 px-2"
                  >
                    <img
                      src={item.cover}
                      alt=""
                      className="size-9 shrink-0 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm font-semibold">{item.title}</b>
                      <small className="block truncate text-[11.5px] text-body-mid">
                        {[
                          formatAlbumStart(periodOf(item)),
                          `사진 ${photoStore[item.id]?.length ?? 0}장`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </small>
                    </span>
                    {on && <Check className="size-4 shrink-0 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      )}

      {/* 참여 링크 — 앨범마다 코드가 다르고, 발급일로부터 일주일만 쓴다 */}
      <Card variant="outline" size="sm" className="mt-4">
        <CardContent className="flex flex-col gap-3">
          {/* 라벨 · 남은 유효기간(D-n) · 안내 · 복사가 한 줄 — 복사는 오른쪽 끝에 붙는다. */}
          <span className="flex items-center gap-2">
            <small className="min-w-0 truncate text-xs font-semibold text-body">
              ‘{album.title}’ 참여 링크
            </small>
            {expired ? (
              <Badge variant="destructive">만료됨</Badge>
            ) : (
              <span className="flex shrink-0 items-center gap-0.5">
                <b className="text-xs font-bold tabular-nums text-primary">
                  {leftDays === 0 ? "D-DAY" : `D-${leftDays}`}
                </b>
                {/* 유효기간 안내 — 한 줄 말풍선. 닫기나 바깥을 누르면 닫힌다(Popover 기본 동작). */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="유효기간 안내"
                      className="flex size-6 items-center justify-center rounded-full text-body-mid outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="end"
                    collisionBoundary={canvas}
                    collisionPadding={16}
                    className="w-auto max-w-[calc(100vw-40px)] flex-row items-center gap-1 py-1.5 pr-1 pl-3"
                    // 폰 캔버스보다 넓어지지 않게 — 넓은 화면 미리보기에서는 100vw 기준이 폰 폭을 넘는다.
                    style={canvas ? { maxWidth: canvas.clientWidth - 32 } : undefined}
                  >
                    <span className="text-xs leading-snug">
                      초대 링크 유효기간은 일주일이에요. {expiresShort}까지 쓸 수 있고, 만료되면 새로
                      만들 수 있어요.
                    </span>
                    <PopoverClose asChild>
                      <button
                        type="button"
                        aria-label="닫기"
                        className="flex size-6 shrink-0 items-center justify-center rounded-full text-body-mid outline-none hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40"
                      >
                        <X className="size-3.5" />
                      </button>
                    </PopoverClose>
                  </PopoverContent>
                </Popover>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="-my-1 ml-auto shrink-0 bg-muted text-ink hover:bg-accent hover:text-ink"
              onClick={copy}
              disabled={expired}
            >
              <Copy className="size-3.5" />
              복사
            </Button>
          </span>
          {/* 링크는 줄이지 않는다 — 두 줄이 되더라도 처음부터 끝까지 다 보여준다. */}
          <p
            className={cn(
              "text-xs leading-relaxed font-medium break-all",
              // 만료된 링크는 눌러도 소용없다는 걸 먼저 보이게 한다.
              expired && "text-body-mid line-through",
            )}
          >
            {link}
          </p>
          {/* 남은 기간은 위 D-n으로 보이므로, 만료됐을 때만 안내 문장을 둔다. */}
          {expired && (
            <p className="text-xs text-body-mid">
              {formatKoreanDate(inviteExpiresAt(album))}에 만료됐어요. 링크를 새로 만들면 다시 초대할
              수 있어요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 만료된 링크는 공유할 수 없다 — 그 자리에 새로 만들기를 둔다. */}
      {expired ? (
        <Button
          size="lg"
          className="mt-3 w-full"
          onClick={() => {
            onReissue(album.id);
            notify(`새 참여 링크를 만들었어요. ${INVITE_DAYS}일간 쓸 수 있어요`);
          }}
        >
          <RefreshCw className="size-5" />
          링크 새로 만들기
        </Button>
      ) : (
        <Button size="lg" className="mt-3 w-full" onClick={share}>
          <Share2 className="size-5" />
          공유하기
        </Button>
      )}

      {/* 만든 직후에는 빈 앨범이다 — 초대 다음 할 일은 사진을 채우는 것.
          나중에 채울 수도 있으니 홈으로 가는 길도 같은 무게로 나란히 둔다. */}
      {justCreated && (
        <>
          <Button variant="outline" size="lg" className="mt-2 w-full" onClick={() => go("upload")}>
            <Plus className="size-5" strokeWidth={2.5} />
            앨범에 사진 추가
          </Button>
          <Button variant="outline" size="lg" className="mt-2 w-full" onClick={() => go("home")}>
            홈으로 이동
          </Button>
        </>
      )}

      <section className="mt-9 flex flex-col gap-2">
        <SectionHeading
          title={<span className="text-lg">기록 중인 사람 {participants.length}명</span>}
        />
        <div className="flex flex-col">
          {participants.length === 0 && (
            <p className="pb-6 text-sm text-body-mid">아직 초대한 사람이 없어요.</p>
          )}
          {participants.map(({ character, color, name, note, status }) => (
            <MemberRow
              key={name}
              character={character}
              color={color}
              name={name}
              note={note}
              trailing={
                status === "다시 초대" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // 다시 보냈으면 이 자리도 답을 기다리는 '초대됨'이 된다
                      reinvite(album.id, name);
                      notify(`${name}에게 초대를 다시 보냈어요`);
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                    다시 초대
                  </Button>
                ) : (
                  <Badge variant={statusVariant[status]}>{status}</Badge>
                )
              }
            />
          ))}
        </div>
      </section>

      {/* 하단 탭은 탭으로 들어왔을 때만 둔다 — 앨범에서 들어오거나 만들기 흐름 중이면
          되돌아갈 곳이 상단 바 하나뿐이어야 한다. */}
      {!justCreated && !back && <BottomNav go={go} active="invite" />}
    </>
  );
}
