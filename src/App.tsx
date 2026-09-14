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

function notify(text: string) {
  toast(text);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [title, setTitle] = useState("2023년 유럽여행");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("invite") === "EU23") setScreen("guest");
    setReady(true);
  }, []);

  const go: Go = (next) => {
    setScreen(next);
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

  const roomy = screen === "home" || screen === "detail";

  return (
    <AppShell>
      <PhoneCanvas
        className={roomy ? "pb-[calc(112px+env(safe-area-inset-bottom))]" : "pb-12"}
        data-screen={screen}
      >
        {screen === "home" && <HomeScreen go={go} title={title} notify={notify} />}
        {screen === "create" && <CreateScreen go={go} onCreate={setTitle} />}
        {screen === "detail" && <DetailScreen go={go} title={title} notify={notify} />}
        {screen === "interview" && <InterviewScreen go={go} notify={notify} />}
        {screen === "voice" && <VoiceScreen go={go} notify={notify} />}
        {screen === "story" && <StoryScreen go={go} notify={notify} />}
        {screen === "invite" && <InviteScreen go={go} notify={notify} />}
        {screen === "upload" && <UploadScreen go={go} notify={notify} />}
        {screen === "notices" && <NoticesScreen go={go} />}
        {screen === "profile" && <ProfileScreen go={go} notify={notify} />}
        {screen === "guest" && <GuestWelcome go={go} />}
        {screen === "guestInfo" && <GuestInfo go={go} notify={notify} />}
        {screen === "guestAnswer" && <GuestAnswer go={go} notify={notify} />}
        {screen === "guestDone" && <GuestDone go={go} />}
      </PhoneCanvas>
      <Toaster />
    </AppShell>
  );
}
