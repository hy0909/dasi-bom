import { useState, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/topbar";
import { PageIntro } from "@/components/page-intro";
import { Field } from "@/components/field";
import { DateField } from "@/components/date-field";
import { StickyBar } from "@/components/sticky-bar";
import { COVER_COLORS, defaultAlbum, type CoverColorId } from "@/data/album";
import { AlbumCover } from "@/components/album-cover";
import { CoverColorPicker } from "@/components/cover-color-picker";
import type { AlbumCardData } from "@/data/albums";
import type { Go } from "@/types";
import { toast } from "sonner";

/** 대표 사진을 고르지 않은 앨범이 쓰는 빈 커버 */
const PLACEHOLDER_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ece7e3"/></svg>`,
  );

export function CreateScreen({
  go,
  onCreate,
}: {
  go: Go;
  onCreate: (album: AlbumCardData) => void;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(defaultAlbum.startDate);
  const [endDate, setEndDate] = useState(defaultAlbum.endDate);
  const [description, setDescription] = useState("");
  const [ready, setReady] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  // 커버 색은 무작위로 하나 골라 두고 시작한다 — 바꾸지 않아도 앨범마다 색이 갈린다.
  const [coverColor, setCoverColor] = useState<CoverColorId>(
    () => COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)].id,
  );

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
    // 다음 화면으로 넘기는 일은 앱이 맡는다 — 만든 뒤에는 초대 화면으로 이어진다.
    setTimeout(
      () =>
        onCreate({
          id: code.toLowerCase(),
          inviteCode: code,
          title: title.trim(),
          startDate,
          endDate,
          description: description.trim(),
          coverColor,
          // 참여 링크는 만든 순간부터 일주일 동안 쓴다.
          inviteIssuedAt: new Date().toISOString(),
          // 대표 사진을 고르지 않았으면 첫 사진을 올릴 때까지 회색 자리로 둔다.
          cover: cover ?? PLACEHOLDER_COVER,
          coverAlt: cover ? `${title.trim()} 대표 사진` : "아직 대표 사진이 없는 앨범",
        }),
      500,
    );
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

        {/* 시작일과 종료일은 한 줄에 반씩 나눠 갖는다 — 폭이 같고 사이가 벌어져 서로 닿지 않는다. */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="시작일" htmlFor="start" className="min-w-0">
            <DateField id="start" label="시작일" compact value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="종료일" htmlFor="end" className="min-w-0">
            <DateField id="end" label="종료일" compact value={endDate} onChange={setEndDate} />
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

        <Field label="앨범 커버 색">
          <div className="flex items-start gap-4">
            {/* 고른 색과 대표 사진이 실제 커버로 어떻게 보이는지 바로 보여준다. */}
            <AlbumCover
              album={{ id: "preview", coverColor, cover: cover ?? PLACEHOLDER_COVER }}
              className="mt-1 w-20 shrink-0"
            />
            <CoverColorPicker value={coverColor} onChange={setCoverColor} />
          </div>
        </Field>

        <StickyBar>
          <Button size="lg" className="w-full" disabled={!title.trim() || ready}>
            {ready ? "앨범을 만들고 있어요…" : "앨범 만들기"}
          </Button>
        </StickyBar>
      </form>
    </>
  );
}
