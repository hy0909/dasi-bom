import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AppShell, PhoneCanvas } from "@/components/phone-shell";
import { Wordmark } from "@/components/wordmark";
import type { Go, Screen } from "@/types";
import { HomeScreen } from "@/screens/home";
import { CreateScreen } from "@/screens/create";
import { DetailScreen } from "@/screens/detail";
import { InterviewScreen } from "@/screens/interview";
import { VoiceScreen } from "@/screens/voice";
import { StoryScreen } from "@/screens/story";
import { InviteScreen } from "@/screens/invite";
import { UploadScreen } from "@/screens/upload";
import { GuestWelcome, GuestInfo, GuestAnswer, GuestDone } from "@/screens/guest";
import { NoticesScreen } from "@/screens/notices";
import { ProfileScreen } from "@/screens/profile";
import { ProfileEditScreen } from "@/screens/profile-edit";
import { AlbumEditScreen } from "@/screens/album-edit";
import { RecordListScreen } from "@/screens/record-list";
import { initialAlbums, type AlbumCardData } from "@/data/albums";
import { LoginScreen } from "@/screens/login";
import { SignupTerms, SignupProfile } from "@/screens/signup";
import { getSession } from "@/lib/auth";

function notify(text: string) {
  toast(text);
}

/** 하단 탭으로 오가는 최상위 화면 — 탭끼리 이동할 때는 뒤로가기 기록을 쌓지 않는다. */
const TAB_SCREENS: Screen[] = ["home", "invite", "notices", "profile"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  /** 뒤로가기용 방문 기록. 화면마다 돌아갈 곳을 하드코딩하면 진입 경로가 둘 이상일 때 어긋난다. */
  const [history, setHistory] = useState<Screen[]>([]);
  const [albums, setAlbums] = useState<AlbumCardData[]>(initialAlbums);
  /** 지금 열어 둔 앨범 — 상세·정보 수정·기록 목록이 모두 이 앨범을 본다. */
  const [openId, setOpenId] = useState(initialAlbums[0].id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // 초대 링크는 로그인보다 우선한다 — 게스트는 가입 없이 참여한다.
    const code = params.get("invite");
    const knownCodes = initialAlbums.map((a) => a.inviteCode);
    if (code && knownCodes.includes(code)) setScreen("guest");
    else {
      const session = getSession();
      // 가입을 중간에 멈춘 계정이면 약관 단계부터 이어서 진행한다.
      if (session) setScreen(session.onboarded ? "home" : "signupTerms");
    }
    setReady(true);
  }, []);

  const go: Go = (next) => {
    if (next !== screen) {
      setHistory((past) =>
        // 탭 사이 이동은 기록하지 않는다 — 탭은 서로의 상위 화면이 아니다.
        TAB_SCREENS.includes(next) && TAB_SCREENS.includes(screen) ? [] : [...past, screen],
      );
      setScreen(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** 앨범을 하나 지목하고 그 앨범의 화면으로 간다. */
  const openAlbum = (id: string, next: Screen) => {
    setOpenId(id);
    go(next);
  };

  /** 실제로 거쳐온 화면으로 돌아간다. 기록이 없으면 홈으로. */
  const goBack = () => {
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

  const roomy = TAB_SCREENS.includes(screen) || screen === "detail";

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
            albums={albums}
            onOpenAlbum={openAlbum}
            notify={notify}
          />
        )}
        {screen === "create" && (
          <CreateScreen
            go={go}
            onCreate={(next) => {
              // 새 앨범은 목록 맨 앞에 두고, 만든 직후 그 앨범을 연다.
              setAlbums((list) => [next, ...list]);
              setOpenId(next.id);
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
            albums={albums}
            initialAlbumId={current.id}
            locked={history.at(-1) === "detail"}
            back={history.length > 0 ? goBack : undefined}
            notify={notify}
          />
        )}
        {screen === "upload" && <UploadScreen go={go} notify={notify} />}
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
        {screen === "guest" && <GuestWelcome go={go} />}
        {screen === "guestInfo" && <GuestInfo go={go} notify={notify} />}
        {screen === "guestAnswer" && <GuestAnswer go={go} notify={notify} />}
        {screen === "guestDone" && <GuestDone go={go} />}
      </PhoneCanvas>
      <Toaster />
    </AppShell>
  );
}
