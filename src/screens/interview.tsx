import { useState } from "react";
import { Mic, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/topbar";
import { StepProgress } from "@/components/step-progress";
import { MediaFrame } from "@/components/media-frame";
import { QuestionCard } from "@/components/question-card";
import type { AlbumCardData } from "@/data/albums";
import { formatDate, formatTime, useAlbumPhotos } from "@/data/photos";
import type { Go, Notify } from "@/types";

const questions = [
  "이 사진은 여행 중 언제, 어디에서 찍은 사진인가요?",
  "그날 가장 기억에 남는 대화는 무엇이었나요?",
  "이 순간을 한 문장으로 남긴다면요?",
];

export function InterviewScreen({
  go,
  album,
  notify,
}: {
  go: Go;
  album: AlbumCardData;
  notify: Notify;
}) {
  const [question, setQuestion] = useState(0);
  const [textMode, setTextMode] = useState(false);
  const [answer, setAnswer] = useState("");
  // 아직 기록 전인 사진 — 앨범 상세에서 이어하기로 들어오는 대상
  const albumPhotos = useAlbumPhotos(album.id);
  const photo = albumPhotos.find((p) => p.status === "기록 전") ?? albumPhotos[0];

  if (!photo) {
    return (
      <>
        <Topbar back={() => go("detail")} title="사진 기록 남기기" />
        <p className="mt-10 text-center text-sm text-body-mid">
          아직 기록할 사진이 없어요. 사진을 먼저 추가해주세요.
        </p>
      </>
    );
  }

  function submit() {
    if (!answer.trim()) return;
    if (question < 2) {
      setQuestion(question + 1);
      setAnswer("");
      setTextMode(false);
      notify("기록을 저장하고 다음 질문을 만들었어요");
    } else {
      notify("사진 기록이 완성됐어요");
      go("story");
    }
  }

  return (
    <>
      <Topbar
        back={() => go("detail")}
        title="사진 기록 남기기"
        action={
          <Button variant="ghost" size="sm" className="-mr-2" onClick={() => go("detail")}>
            나가기
          </Button>
        }
      />
      <StepProgress step={question + 1} total={3} label="질문" />

      <MediaFrame
        className="mt-5"
        src={photo.src}
        alt={photo.alt ?? photo.title}
        caption={`${formatDate(photo.takenAt)} · ${formatTime(photo.takenAt)} · ${photo.shortPlace}`}
      />

      <QuestionCard eyebrow="AI가 사진을 보고 물어봐요" question={questions[question]}>
        {question > 0 && (
          <div className="mt-1 border-l-2 border-primary pl-3 text-sm leading-relaxed text-canvas-soft/80">
            <small className="block text-xs font-semibold text-canvas-soft/60">이전 기록</small>
            “파리에 도착한 다음 날, 가족들과 작은 식당에서 저녁을 먹었어요.”
          </div>
        )}
      </QuestionCard>

      {!textMode ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <AnswerOption
            icon={<Mic className="size-5" />}
            iconClass="bg-primary text-ink"
            title="목소리로 답하기"
            description="실제로 녹음해 남겨보세요"
            onClick={() => go("voice")}
          />
          <AnswerOption
            icon={<Type className="size-5" />}
            iconClass="bg-ink text-canvas"
            title="글로 답하기"
            description="글로 직접 작성하세요"
            onClick={() => setTextMode(true)}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <Textarea
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="사진을 보며 떠오르는 기억을 들려주세요."
            maxLength={500}
          />
          <small className="text-right text-xs tabular-nums text-body-mid">{answer.length} / 500</small>
          <Button size="lg" className="w-full" disabled={!answer.trim()} onClick={submit}>
            {question === 2 ? "기록 완성하기" : "기록 남기기"}
          </Button>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Button
          variant="link"
          size="sm"
          className="text-body"
          onClick={() => (question < 2 ? setQuestion(question + 1) : go("detail"))}
        >
          이 질문은 건너뛸게요
        </Button>
      </div>
    </>
  );
}

function AnswerOption({
  icon,
  iconClass,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="cursor-pointer transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
    >
      <CardContent className="flex flex-col gap-3">
        <span className={`flex size-11 items-center justify-center rounded-full ${iconClass}`}>{icon}</span>
        <span>
          <b className="block text-[15px] font-semibold">{title}</b>
          <small className="block text-xs text-body-mid">{description}</small>
        </span>
      </CardContent>
    </Card>
  );
}
