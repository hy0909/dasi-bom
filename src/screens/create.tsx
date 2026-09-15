import { useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/topbar";
import { PageIntro } from "@/components/page-intro";
import { Field } from "@/components/field";
import { StickyBar } from "@/components/sticky-bar";
import { type Album, defaultAlbum } from "@/data/album";
import type { Go } from "@/types";
import { toast } from "sonner";

export function CreateScreen({
  go,
  onCreate,
}: {
  go: Go;
  onCreate: (album: Omit<Album, "status">) => void;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(defaultAlbum.startDate);
  const [endDate, setEndDate] = useState(defaultAlbum.endDate);
  const [description, setDescription] = useState("");
  const [ready, setReady] = useState(false);
  const [cover, setCover] = useState<string | null>(null);

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("이미지 파일만 선택해주세요");
    const reader = new FileReader();
    reader.onload = () => setCover(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setReady(true);
    // 앨범마다 참여 링크가 다르다 — 만들 때 코드를 한 번 발급한다.
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    onCreate({
      id: code.toLowerCase(),
      inviteCode: code,
      title: title.trim(),
      startDate,
      endDate,
      description: description.trim(),
    });
    setTimeout(() => go("detail"), 500);
  }

  return (
    <>
      <Topbar back={() => go("home")} title="새 앨범 만들기" />
      <PageIntro
        title={
          <>
            어떤 순간을
            <br />
            기록해볼까요?
          </>
        }
        description="사진과 기록은 나중에도 추가할 수 있어요."
      />

      <form className="mt-8 flex flex-col gap-6 pb-20" onSubmit={submit}>
        <Field label="앨범 제목" htmlFor="record-title" required>
          <Input
            id="record-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2023년 유럽여행"
          />
        </Field>

        {/* 날짜 입력은 기기 로케일에 따라 내용 폭이 달라진다 — 칸을 좁히지 말고 늘어나게 둔다 */}
        <div className="grid grid-cols-2 gap-2">
          <Field className="min-w-0" label="시작일" htmlFor="start">
            <Input
              id="start"
              type="date"
              className="w-full min-w-0 px-3 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field className="min-w-0" label="종료일" htmlFor="end">
            <Input
              id="end"
              type="date"
              className="w-full min-w-0 px-3 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label="짧은 설명" htmlFor="desc">
          <Textarea
            id="desc"
            className="min-h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 가족들과 처음 떠난 유럽여행의 사진과 기록을 모았어요."
          />
        </Field>

        <label className="relative flex cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-xl bg-muted p-6 text-center transition-colors hover:bg-accent has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40">
          {cover ? (
            <img src={cover} alt="대표 사진 미리보기" className="mb-2 aspect-[16/9] w-full rounded-lg object-cover" />
          ) : (
            <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-canvas text-ink">
              <ImagePlus className="size-5" />
            </span>
          )}
          <b className="text-[15px] font-semibold">{cover ? "대표 사진 변경" : "대표 사진 추가"}</b>
          <small className="text-xs text-body-mid">JPG, PNG · 최대 10MB</small>
          <input
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={(e) => chooseFile(e.target.files?.[0])}
          />
        </label>

        <StickyBar>
          <Button size="lg" className="w-full" disabled={!title.trim() || ready}>
            {ready ? "앨범을 만들고 있어요…" : "앨범 만들기"}
          </Button>
        </StickyBar>
      </form>
    </>
  );
}
