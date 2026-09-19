import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AppShell, PhoneCanvas } from "@/components/phone-shell";
import { flushSync } from "react-dom";
import { AlbumOpening } from "@/components/album-opening";
import { Wordmark } from "@/components/wordmark";
import type { Screen } from "@/types";
import { HomeScreen } from "@/screens/home";
import { CreateScreen } from "@/screens/create";
import { DetailScreen } from "@/screens/detail";
import { InterviewScreen } from "@/screens/interview";
import { VoiceScreen } from "@/screens/voice";
import { StoryScreen } from "@/screens/story";
import { InviteScreen } from "@/screens/invite";
import { UploadScreen } from "@/screens/upload";
import { GuestWelcome, GuestInfo, GuestAnswer, GuestDone } from "@/screens/guest";
import { GuestPin } from "@/screens/guest-pin";
import { NoticesScreen } from "@/screens/notices";
import { ProfileScreen } from "@/screens/profile";
import { ProfileEditScreen } from "@/screens/profile-edit";
import { AlbumEditScreen } from "@/screens/album-edit";
import { RecordListScreen } from "@/screens/record-list";
import { isInviteExpired, newInviteCode, newInvitePin } from "@/data/album";
import { initialAlbums, type AlbumCardData } from "@/data/albums";
import { joinAlbum } from "@/data/family";
import { joinMyAlbum, useMyAlbums } from "@/data/membership";
import { LoginScreen } from "@/screens/login";
import { SignupTerms, SignupProfile } from "@/screens/signup";
import { getSession } from "@/lib/auth";

function notify(text: string) {
  toast(text);
}

/** 하단 탭으로 오가는 최상위 화면 — 탭끼리 이동할 때는 뒤로가기 기록을 쌓지 않는다. */
const TAB_SCREENS: Screen[] = ["home", "invite", "notices", "profile"];

/**
 * 첫 로드에 들어온 초대 코드.
 * 합류한 뒤에는 주소에서 코드를 지우므로, 주소를 다시 읽으면 값이 사라진다.
 * 한 번만 읽어 두고 그 값을 쓴다.
 */
const inviteCodeAtLoad = new URLSearchParams(window.location.search).get("invite");

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  /** 뒤로가기용 방문 기록. 화면마다 돌아갈 곳을 하드코딩하면 진입 경로가 둘 이상일 때 어긋난다. */
  const [history, setHistory] = useState<Screen[]>([]);
  const [albums, setAlbums] = useState<AlbumCardData[]>(initialAlbums);
  /** 지금 열어 둔 앨범 — 상세·정보 수정·기록 목록이 모두 이 앨범을 본다. */
  const [openId, setOpenId] = useState(initialAlbums[0].id);
  /** 방금 앨범을 만든 직후인가 — 초대 화면이 만들기 흐름의 마지막 단계로 바뀐다. */
  const [justCreated, setJustCreated] = useState(false);
  /** 초대 링크를 타고 들어온 앨범 — 비회원 참여 화면이 이 앨범을 본다. */
  const [invitedId, setInvitedId] = useState<string | null>(null);
  /** 링크가 이미 만료됐는가 — 회원이든 아니든 참여할 수 없다. */
  const [inviteExpired, setInviteExpired] = useState(false);
  const [ready, setReady] = useState(false);
  /** 내가 참여 중인 앨범 — 내가 만들었든 링크를 타고 들어왔든 여기에 담긴다. */
  const membership = useMyAlbums();

  useEffect(() => {
    // 초대 링크는 로그인보다 우선한다.
    const invited = inviteCodeAtLoad
      ? initialAlbums.find((a) => a.inviteCode === inviteCodeAtLoad)
      : undefined;
    const session = getSession();

    if (invited) {
      setInvitedId(invited.id);
      setOpenId(invited.id);
      if (isInviteExpired(invited)) {
        // 만료된 링크는 회원·비회원 모두 막고, 초대한 사람에게 새 링크를 받게 안내한다.
        // 이미 못 쓰는 링크라 비밀번호는 묻지 않는다.
        setInviteExpired(true);
        setScreen("guest");
      } else {
        // 링크만으로는 열리지 않는다 — 네 자리 비밀번호를 맞혀야 그다음으로 간다.
        setScreen("guestPin");
      }
    } else if (session) {
      // 가입을 중간에 멈춘 계정이면 약관 단계부터 이어서 진행한다.
      setScreen(session.onboarded ? "home" : "signupTerms");
    }
    setReady(true);
  }, []);

  /**
   * 초대 비밀번호를 맞힌 뒤 — 회원이면 그 앨범에 합류해 상세로, 회원이 아니면 비회원 참여 흐름으로 간다.
   * 잠금 화면을 지나기 전에는 어느 쪽으로도 가지 않는다.
   */
  const unlockInvite = () => {
    const invitedAlbum = albums.find((a) => a.id === invitedId);
    if (!invitedAlbum) return;
    const session = getSession();
    if (session?.onboarded) {
      // 회원이 링크를 타고 오면 그 앨범 그룹에 바로 합류한다.
      joinAlbum(invitedAlbum.id, {
        name: session.name,
        character: session.tone,
        color: session.color,
      });
      // 남이 만든 앨범이어도 합류한 순간부터 내 앨범 목록에 들어온다.
      joinMyAlbum(invitedAlbum.id, { role: "member" });
      window.history.replaceState({}, "", window.location.pathname);
      setScreen("detail");
    } else {
      // 회원이 아니면 가입 없이 참여하는 비회원 흐름으로 간다.
      setScreen("guest");
    }
  };

  const go = (next: Screen, instant = false) => {
    const move = () => {
      // 초대 화면을 벗어나면 앨범 만들기 흐름은 끝난다.
      if (next !== "invite") setJustCreated(false);
      if (next !== screen) {
        setHistory((past) =>
          // 탭 사이 이동은 기록하지 않는다 — 탭은 서로의 상위 화면이 아니다.
          TAB_SCREENS.includes(next) && TAB_SCREENS.includes(screen) ? [] : [...past, screen],
        );
        setScreen(next);
      }
    };
    // 즉시 전환은 화면 교체와 스크롤을 한 프레임에 묶는다 — 스크롤만 먼저 튀는 프레임이 없게
    if (instant) flushSync(move);
    else move();
    window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
  };

  // 앨범 열림 모션 — 눌린 커버가 커지며 펼쳐지는 동안 아래에서 상세로 바뀐다.
  const [opening, setOpening] = useState<{ album: AlbumCardData; from: DOMRect } | null>(null);

  /** 방문 기록을 갈아끼우며 이동한다 — 앨범을 만든 뒤처럼 되돌아갈 수 없는 흐름에 쓴다. */
  const jump = (next: Screen, past: Screen[]) => {
    setHistory(past);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** 앨범을 하나 지목하고 그 앨범의 화면으로 간다. 커버 자리(from)가 오면 열림 모션으로 상세에 들어간다. */
  const openAlbum = (id: string, next: Screen, from?: DOMRect) => {
    // 열림 모션이 진행 중이면 어떤 이동도 받지 않는다 — 다른 앨범으로 바뀌거나 순서가 꼬이지 않게
    if (opening) return;
    setOpenId(id);
    const album = albums.find((a) => a.id === id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (from && next === "detail" && album && !reduce) {
      setOpening({ album, from });
      return;
    }
    go(next);
  };

  /**
   * 만료된 초대 링크를 새 코드로 다시 발급한다 — 참여자는 앨범 id 로 묶여 그대로 남는다.
   * 코드가 바뀌면 네 자리 비밀번호도 함께 바뀐다. 옛 링크와 옛 비밀번호로는 들어올 수 없다.
   */
  const reissueInvite = (albumId: string) => {
    setAlbums((list) =>
      list.map((a) =>
        a.id === albumId
          ? {
              ...a,
              inviteCode: newInviteCode(),
              invitePin: newInvitePin(),
              inviteIssuedAt: new Date().toISOString(),
            }
          : a,
      ),
    );
  };

  /** 실제로 거쳐온 화면으로 돌아간다. 기록이 없으면 홈으로. */
  const goBack = () => {
    setJustCreated(false);
    setHistory((past) => {
      setScreen(past.at(-1) ?? "home");
      return past.slice(0, -1);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!ready) {
    return (
      <AppShell>
        <PhoneCanvas className="flex flex-col items-center justify-center gap-6 pb-10">
          <Wordmark className="text-[34px]" />
          <span className="h-1 w-24 overflow-hidden rounded-full bg-mute/40">
            <span className="block h-full w-1/2 animate-[boot_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
          </span>
          <p className="text-sm text-body">가족의 기억을 불러오고 있어요</p>
          <style>{`@keyframes boot{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
        </PhoneCanvas>
      </AppShell>
    );
  }

  // 하단 탭이나 플로팅 버튼이 뜨는 화면은 그만큼 아래 여백이 필요하다.
  const current = albums.find((a) => a.id === openId) ?? albums[0];

  // 초대 링크로 들어온 앨범 — 비회원 참여 화면이 이 앨범의 사진과 제목을 보여준다.
  const invited = albums.find((a) => a.id === invitedId) ?? current;

  // 홈과 초대 화면이 보는 목록 — 앱이 아는 앨범이 아니라 내가 참여 중인 앨범이다.
  const myAlbums = albums.filter((a) => membership[a.id]);

  // 초대 화면은 탭으로 들어왔을 때만 하단 탭이 뜬다 — 앨범에서 들어오면 화면을 꽉 채운다.
  const inviteCoversPage = screen === "invite" && (justCreated || history.length > 0);
  const roomy = (TAB_SCREENS.includes(screen) || screen === "detail") && !inviteCoversPage;

  return (
    <AppShell>
      <PhoneCanvas
        className={roomy ? "pb-[calc(148px+env(safe-area-inset-bottom))]" : "pb-12"}
        data-screen={screen}
      >
        {screen === "login" && <LoginScreen go={go} notify={notify} />}
        {screen === "signupTerms" && <SignupTerms go={go} notify={notify} />}
        {screen === "signupProfile" && <SignupProfile go={go} notify={notify} />}
        {screen === "home" && (
          <HomeScreen
            go={go}
            albums={myAlbums}
            onOpenAlbum={openAlbum}
            notify={notify}
          />
        )}
        {screen === "create" && (
          <CreateScreen
            go={go}
            onCreate={(next) => {
              // 새 앨범은 목록 맨 앞에 두고, 곧바로 초대 화면으로 이어 준다.
              setAlbums((list) => [next, ...list]);
              // 내가 만든 앨범 — 만든 사람으로 내 목록에 들어간다.
              joinMyAlbum(next.id, { role: "owner" });
              setOpenId(next.id);
              setJustCreated(true);
              // 만들기 화면으로는 돌아가지 않는다 — 여기서 뒤로 가면 홈이다.
              jump("invite", ["home"]);
            }}
          />
        )}
        {screen === "detail" && <DetailScreen go={go} album={current} notify={notify} />}
        {screen === "interview" && <InterviewScreen go={go} album={current} notify={notify} />}
        {screen === "voice" && <VoiceScreen go={go} album={current} notify={notify} />}
        {screen === "story" && <StoryScreen go={go} album={current} notify={notify} />}
        {screen === "invite" && (
          // 탭으로 들어오면 방문 기록이 비어 있다 — 그때는 뒤로가기를 두지 않는다.
          <InviteScreen
            go={go}
            albums={myAlbums}
            initialAlbumId={current.id}
            locked={justCreated || history.at(-1) === "detail"}
            justCreated={justCreated}
            onReissue={reissueInvite}
            back={!justCreated && history.length > 0 ? goBack : undefined}
            notify={notify}
          />
        )}
        {screen === "upload" && <UploadScreen go={go} album={current} notify={notify} />}
        {screen === "notices" && <NoticesScreen go={go} />}
        {screen === "profile" && <ProfileScreen go={go} notify={notify} />}
        {screen === "albumEdit" && (
          <AlbumEditScreen
            album={current}
            onSave={(next) =>
              setAlbums((list) => list.map((a) => (a.id === next.id ? { ...a, ...next } : a)))
            }
            back={goBack}
            notify={notify}
          />
        )}
        {screen === "recordList" && <RecordListScreen go={go} album={current} back={goBack} />}
        {screen === "profileEdit" && (
          <ProfileEditScreen go={go} back={goBack} notify={notify} />
        )}
        {screen === "guestPin" && (
          <GuestPin album={invited} onUnlock={unlockInvite} notify={notify} />
        )}
        {screen === "guest" && <GuestWelcome go={go} album={invited} expired={inviteExpired} />}
        {screen === "guestInfo" && <GuestInfo go={go} notify={notify} />}
        {screen === "guestAnswer" && <GuestAnswer go={go} album={invited} notify={notify} />}
        {screen === "guestDone" && <GuestDone go={go} />}
      </PhoneCanvas>
      <Toaster />
      {opening && (
        <AlbumOpening
          album={opening.album}
          from={opening.from}
          onReveal={() => go("detail", true)}
          onDone={() => setOpening(null)}
        />
      )}
    </AppShell>
  );
}
