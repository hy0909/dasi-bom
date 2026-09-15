import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Topbar } from "@/components/topbar";
import { Wordmark } from "@/components/wordmark";
import { Eyebrow } from "@/components/eyebrow";
import { PageIntro } from "@/components/page-intro";
import { Field } from "@/components/field";
import { MediaFrame } from "@/components/media-frame";
import { StepProgress } from "@/components/step-progress";
import { QuestionCard } from "@/components/question-card";
import { INVITE_DAYS } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { formatDate, formatTime, photosOf } from "@/data/photos";
import type { Go, Notify } from "@/types";

function leaveGuest(go: Go) {
  window.history.replaceState({}, "", window.location.pathname);
  go("home");
}

export function GuestWelcome({
  go,
  album,
  expired = false,
}: {
  go: Go;
  album: AlbumCardData;
  /** 링크가 만료된 경우 — 참여를 받지 않고 새 링크를 부탁하게 안내한다. */
  expired?: boolean;
}) {
  const [first, ...rest] = album.title.split(" ");

  if (expired) {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center gap-4 text-center">
        <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-muted text-body">
          <LinkIcon className="size-7" />
        </span>
        <Eyebrow>가족 앨범 초대</Eyebrow>
        <h1 className="font-heading text-display-lg font-bold">
          링크가
          <br />
          만료됐어요
        </h1>
        <p className="max-w-[300px] text-base leading-relaxed text-body">
          참여 링크는 만든 날부터 {INVITE_DAYS}일 동안만 쓸 수 있어요. 초대한 가족에게 새 링크를
          부탁해주세요.
        </p>
        <Button variant="outline" size="lg" className="mt-4 w-full" onClick={() => leaveGuest(go)}>
          닫기
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-14 items-center justify-center">
        <Wordmark />
      </div>

      <MediaFrame
        className="mt-2"
        src={album.cover}
        alt={album.coverAlt}
        caption="하연님이 초대했어요"
      />

      <section className="mt-6 flex flex-col gap-3">
        <Eyebrow>가족 앨범 초대</Eyebrow>
        <h1 className="font-heading text-display-xl font-bold">
          {first}
          {rest.length > 0 && (
            <>
              <br />
              {rest.join(" ")}
            </>
          )}
        </h1>
        <p className="text-base leading-relaxed text-body">
          “사진을 보며 기억나는 순간을 들려주세요. 회원가입 없이 바로 참여할 수 있어요.”
        </p>
      </section>

      <Card size="sm" className="mt-6">
        <CardContent className="flex flex-col gap-3">
          <b className="text-[15px] font-semibold">이렇게 참여해요</b>
          {["사진을 천천히 살펴봐요", "AI 질문에 목소리나 글로 답해요", "가족의 한 편의 기록으로 완성돼요"].map(
            (step, i) => (
              <p key={step} className="flex items-center gap-3 text-sm text-body">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-canvas">
                  {i + 1}
                </span>
                {step}
              </p>
            ),
          )}
        </CardContent>
      </Card>

      <Button size="lg" className="mt-6 w-full" onClick={() => go("guestInfo")}>
        이 앨범에 참여하기
      </Button>
      <div className="mt-2 flex justify-center">
        <Button variant="link" size="sm" className="text-body" onClick={() => leaveGuest(go)}>
          지금은 참여하지 않을게요
        </Button>
      </div>
    </>
  );
}

export function GuestInfo({ go, notify }: { go: Go; notify: Notify }) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <>
      <Topbar back={() => go("guest")} title="참여자 정보" />
      <PageIntro
        eyebrow="01 · 참여자 정보"
        title={
          <>
            가족에게 나를
            <br />
            알려주세요
          </>
        }
        description="앨범에 표시될 이름과 관계를 입력해주세요."
      />

      <form
        className="mt-8 flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name || !relation || !agree) return notify("이름·관계·동의를 모두 확인해주세요");
          localStorage.setItem("dasiBomGuest", name);
          go("guestAnswer");
        }}
      >
        <Field label="닉네임" htmlFor="nick" required>
          <Input id="nick" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 엄마" />
        </Field>

        <Field label="가족 관계" htmlFor="relation" required>
          <Select value={relation} onValueChange={setRelation}>
            <SelectTrigger id="relation" className="w-full">
              <SelectValue placeholder="관계를 선택해주세요" />
            </SelectTrigger>
            <SelectContent position="popper">
              {["어머니", "아버지", "형제·자매", "친척"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Label className="group/field-label flex items-start gap-3 rounded-lg bg-muted p-4 text-sm leading-snug font-medium">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            className="mt-0.5 size-5 bg-canvas"
          />
          사진·음성·답변 처리에 동의합니다.
        </Label>

        <Button size="lg" className="w-full">
          참여 시작하기
        </Button>
      </form>
    </>
  );
}

const guestQuestions = [
  "이때 가족들은 어떤 기분이었나요?",
  "이날 기억나는 대화나 음식이 있나요?",
  "여행 마지막 날, 가장 아쉬웠던 건 무엇인가요?",
];

export function GuestAnswer({
  go,
  album,
  notify,
}: {
  go: Go;
  album: AlbumCardData;
  notify: Notify;
}) {
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(0);
  // 초대받은 앨범의 사진을 순서대로 본다.
  const albumPhotos = photosOf(album.id);
  const photo = albumPhotos[Math.min(saved, Math.max(albumPhotos.length - 1, 0))];
  const last = Math.max(albumPhotos.length - 1, 0);

  if (!photo) {
    return (
      <>
        <Topbar back={() => go("guestInfo")} title="기록 남기기" />
        <p className="mt-10 text-center text-sm text-body-mid">
          아직 이 앨범에 사진이 없어요. 초대한 가족에게 알려주세요.
        </p>
      </>
    );
  }

  return (
    <>
      <Topbar back={() => go("guestInfo")} title="기록 남기기" />
      <StepProgress step={saved + 1} total={albumPhotos.length} />

      <MediaFrame className="mt-5" src={photo.src} alt={photo.alt ?? photo.title} caption={`${formatDate(photo.takenAt)} · ${formatTime(photo.takenAt)} · ${photo.shortPlace}`} />

      <QuestionCard
        eyebrow="이 사진에 대해 궁금해요"
        question={guestQuestions[saved % guestQuestions.length]}
      />

      <div className="mt-4 flex flex-col gap-3">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="떠오르는 기억을 편하게 남겨주세요."
          maxLength={500}
        />
        <small className="text-right text-xs tabular-nums text-body-mid">{answer.length} / 500</small>
        <Button
          size="lg"
          className="w-full"
          disabled={!answer.trim()}
          onClick={() => {
            if (saved < last) {
              setSaved(saved + 1);
              setAnswer("");
              notify("답변을 저장했어요");
            } else go("guestDone");
          }}
        >
          {saved === last ? "답변 모두 제출하기" : "답변 저장하고 다음 사진"}
        </Button>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="link"
          size="sm"
          className="text-body"
          onClick={() => (saved < last ? setSaved(saved + 1) : go("guestDone"))}
        >
          이 사진은 건너뛸게요
        </Button>
      </div>
    </>
  );
}

export function GuestDone({ go }: { go: Go }) {
  const name = typeof window !== "undefined" ? localStorage.getItem("dasiBomGuest") || "가족" : "가족";
  return (
    <div className="flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center gap-4 text-center">
      <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-primary text-canvas">
        <Check className="size-8" strokeWidth={3} />
      </span>
      <Eyebrow>{name}님의 기록</Eyebrow>
      <h1 className="font-heading text-display-lg font-bold">
        소중한 기억을
        <br />
        남겨주셔서 고마워요
      </h1>
      <p className="max-w-[300px] text-base leading-relaxed text-body">
        사진 3장에 남긴 답변이 하연님에게 전달됐어요. AI가 가족의 기록으로 따뜻하게 정리할게요.
      </p>

      <Card size="sm" className="mt-2 w-full">
        <CardContent className="grid grid-cols-2 divide-x divide-border">
          <div className="flex flex-col gap-1">
            <small className="text-xs font-semibold text-body">답변한 사진</small>
            <strong className="font-heading text-display-md font-bold">3장</strong>
          </div>
          <div className="flex flex-col gap-1 pl-4">
            <small className="text-xs font-semibold text-body">텍스트 답변</small>
            <strong className="font-heading text-display-md font-bold">2개</strong>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="mt-4 w-full" onClick={() => go("guestAnswer")}>
        답변 다시 보기
      </Button>
      <Button variant="link" size="sm" className="text-body" onClick={() => leaveGuest(go)}>
        참여 마치기
      </Button>
    </div>
  );
}
