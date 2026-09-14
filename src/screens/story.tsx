import { useState } from "react";
import { ChevronLeft, ChevronRight, Ellipsis, Pause, Play, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/topbar";
import { MediaFrame } from "@/components/media-frame";
import { Eyebrow } from "@/components/eyebrow";
import { formatDate, formatTime, photos } from "@/data/photos";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

const styles = ["따뜻하게", "담백하게", "회고록처럼"];

export function StoryScreen({ go, notify }: { go: Go; notify: Notify }) {
  const [editing, setEditing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [style, setStyle] = useState(styles[0]);
  const [index, setIndex] = useState(0);
  const photo = photos[index];

  return (
    <>
      <Topbar
        back={() => go("detail")}
        title="사진 이야기"
        action={
          <Button variant="ghost" size="sm" className="-mr-2" onClick={() => setEditing(!editing)}>
            {editing ? "취소" : "수정"}
          </Button>
        }
      />

      <article className={cn("flex flex-col gap-5", editing && "pb-24")}>
        <MediaFrame className="mt-2" src={photo.src} alt={photo.title}>
          <Badge variant="glass" className="absolute top-3 right-3 tabular-nums">
            {index + 1} / {photos.length}
          </Badge>

          {/* 사진 위 좌우 이동 — 사진을 가리지 않게 canvas 90% 채움의 원형 버튼 */}
          <SlideButton
            side="left"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          />
          <SlideButton
            side="right"
            disabled={index === photos.length - 1}
            onClick={() => setIndex((i) => Math.min(photos.length - 1, i + 1))}
          />
        </MediaFrame>

        <Eyebrow className="flex items-center gap-2">
          {formatDate(photo.takenAt)}
          <i className="size-1 rounded-full bg-mute" />
          {formatTime(photo.takenAt)}
          <i className="size-1 rounded-full bg-mute" />
          {photo.place}
        </Eyebrow>

        {editing ? (
          <div className="flex flex-col gap-3">
            <Input
              key={photo.title}
              defaultValue={photo.title}
              className="font-heading text-display-sm font-bold h-14"
            />
            <div className="flex flex-wrap gap-2">
              {styles.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={style === item ? "secondary" : "outline"}
                  onClick={() => setStyle(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <h1 className="font-heading text-display-xl font-bold">{photo.title}</h1>
        )}

        <div className="flex flex-wrap gap-2">
          {["아버지", "어머니", "하연", "설렘"].map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        {editing ? (
          <Textarea
            className="min-h-44"
            defaultValue="긴 이동 끝에 파리에 도착한 가족들은 첫날 저녁을 함께 먹으며 여행의 시작을 기념했습니다. 모두 피곤했지만, 창밖으로 에펠탑이 보이던 순간만큼은 말없이 한참을 바라보았습니다."
          />
        ) : (
          <p className="text-[17px] leading-[1.7] text-body">
            긴 이동 끝에 파리에 도착한 가족들은 첫날 저녁을 함께 먹으며 여행의 시작을 기념했습니다.
            <br />
            <br />
            모두 피곤했지만, 창밖으로 에펠탑이 보이던 순간만큼은 말없이 한참을 바라보았습니다. 엄마는
            그때의 우리 표정이 아직도 생생하다고 말합니다.
          </p>
        )}

        {/* 인용 — card-feature-cream */}
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Quote className="size-5 text-primary" />
            <p className="font-heading text-display-sm font-bold">
              다 같이 너무 피곤했지만
              <br />
              정말 행복했어요.
            </p>
            <small className="text-sm text-body">— 엄마의 답변에서</small>
          </CardContent>
        </Card>

        {/* 원본 목소리 — pricing-card 크롬(헤어라인) */}
        <Card
          variant="outline"
          size="sm"
          role="button"
          tabIndex={0}
          onClick={() => {
            setPlaying(!playing);
            notify(playing ? "재생을 멈췄어요" : "엄마의 목소리를 재생합니다");
          }}
          onKeyDown={(e) => e.key === "Enter" && setPlaying(!playing)}
          className="cursor-pointer transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
        >
          <CardContent className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-full text-canvas",
                playing ? "bg-primary" : "bg-ink",
              )}
            >
              {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[15px] font-semibold">엄마의 목소리</b>
              <small className="block text-xs text-body-mid">0:32 · 원본 음성</small>
            </span>
            <Ellipsis className="size-5 text-body-mid" />
          </CardContent>
        </Card>

        <p className="flex items-center gap-1.5 text-xs text-body-mid">
          <Sparkles className="size-3.5" />이 이야기는 가족의 답변을 바탕으로 AI가 정리했어요.
        </p>
      </article>

      {editing && (
        <div className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 z-20 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2">
          <Button
            size="lg"
            className="w-full shadow-float"
            onClick={() => {
              setEditing(false);
              notify(`${style} 스타일로 이야기를 저장했어요`);
            }}
          >
            이야기 저장하기
          </Button>
        </div>
      )}
    </>
  );
}

/** 사진 위 좌우 이동 버튼 — canvas 90% 채움 + 블러로 사진 위에서도 읽힌다. */
function SlideButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "이전 사진" : "다음 사진"}
      className={cn(
        "absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/90 text-ink shadow-card backdrop-blur-sm transition-opacity outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        side === "left" ? "left-3" : "right-3",
        disabled ? "pointer-events-none opacity-0" : "hover:bg-canvas",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
