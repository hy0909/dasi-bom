import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { MediaFrame } from "@/components/media-frame";
import { Eyebrow } from "@/components/eyebrow";
import type { AlbumCardData } from "@/data/albums";
import { photosOf } from "@/data/photos";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

export function VoiceScreen({
  go,
  album,
  notify,
}: {
  go: Go;
  album: AlbumCardData;
  notify: Notify;
}) {
  const albumPhotos = photosOf(album.id);
  const photo = albumPhotos.find((p) => p.status === "기록 전") ?? albumPhotos[0];
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function start() {
    try {
      const live = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = live;
      chunks.current = [];
      const media = new MediaRecorder(live);
      recorder.current = media;
      media.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      media.onstop = () => {
        setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: media.mimeType })));
        live.getTracks().forEach((track) => track.stop());
      };
      media.start();
      setRecording(true);
      setSeconds(0);
    } catch {
      notify("마이크 권한을 허용하거나 글로 답해주세요");
    }
  }
  function stop() {
    recorder.current?.stop();
    setRecording(false);
  }
  function reset() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <Topbar back={() => go("interview")} title="목소리로 답하기" />
      <MediaFrame className="mt-2" ratio="aspect-[16/9]" src={photo?.src} alt={photo?.alt ?? photo?.title ?? ""} />

      <section className="mt-6 flex flex-col gap-2">
        <Eyebrow>AI 질문</Eyebrow>
        <h1 className="font-heading text-display-md font-bold">
          이 사진은 여행 중 언제, 어디에서 찍은 사진인가요?
        </h1>
      </section>

      <Card className={cn("mt-6", recording && "recording")}>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 items-center gap-[3px]" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <i
                key={i}
                className={cn(
                  "wave-bar block w-[3px] rounded-full transition-colors",
                  recording ? "bg-primary" : audioUrl ? "bg-ink" : "bg-mute",
                )}
                style={{ height: `${12 + ((i * 13) % 32)}px`, animationDelay: `${(i % 7) * 90}ms` }}
              />
            ))}
          </div>
          <time className="font-heading text-display-lg font-bold tabular-nums">
            {mm}:{ss}
          </time>
          <p className="text-sm text-body">
            {audioUrl
              ? "녹음이 완료됐어요"
              : recording
                ? "듣고 있어요. 편하게 이야기해주세요."
                : "버튼을 누르면 실제 녹음이 시작돼요"}
          </p>

          {audioUrl ? (
            <audio className="w-full" src={audioUrl} controls />
          ) : (
            <Button
              variant={recording ? "secondary" : "default"}
              onClick={recording ? stop : start}
              aria-label={recording ? "녹음 정지" : "녹음 시작"}
              className={cn("size-20 rounded-full shadow-float", recording && "animate-pulse")}
            >
              {recording ? <Square className="size-6 fill-current" /> : <Mic className="size-7" />}
            </Button>
          )}
          <small className="text-xs text-body-mid">
            {audioUrl ? "재생해 확인한 뒤 목소리를 남겨주세요" : "최대 5분까지 녹음할 수 있어요"}
          </small>
        </CardContent>
      </Card>

      {audioUrl ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={reset}>
            다시 녹음
          </Button>
          <Button
            size="lg"
            onClick={() => {
              notify("목소리를 안전하게 저장했어요");
              go("story");
            }}
          >
            이 목소리 남기기
          </Button>
        </div>
      ) : (
        !recording && (
          <div className="mt-4 flex justify-center">
            <Button variant="link" size="sm" className="text-body" onClick={() => go("interview")}>
              글로 답하기
            </Button>
          </div>
        )
      )}
    </>
  );
}
