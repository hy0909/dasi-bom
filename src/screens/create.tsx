import { useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { StickyBar } from "@/components/sticky-bar";
import {
  COVER_COLORS,
  type CoverColorId,
  type CoverFrameId,
  type CoverShapeId,
} from "@/data/album";
import { AlbumCover } from "@/components/album-cover";
import { CoverColorPicker } from "@/components/cover-color-picker";
import { CoverFramePicker, CoverShapePicker } from "@/components/cover-style-picker";
import type { AlbumCardData } from "@/data/albums";
import type { Go } from "@/types";
import { toast } from "sonner";

/** 대표 사진을 고르지 않은 앨범이 쓰는 빈 커버 */
const PLACEHOLDER_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#ece7e3"/></svg>`,
  );

export function CreateScreen({
  go,
  onCreate,
}: {
  go: Go;
  onCreate: (album: AlbumCardData) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ready, setReady] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  // 커버 색은 무작위로 하나 골라 두고 시작한다 — 바꾸지 않아도 앨범마다 색이 갈린다.
  const [coverColor, setCoverColor] = useState<CoverColorId>(
    () => COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)].id,
  );
  // 판형과 사진이 앉는 자리 — 기본값은 지금까지의 앨범과 같은 세로형 기본 창이다.
  const [coverShape, setCoverShape] = useState<CoverShapeId>("portrait");
  const [coverFrame, setCoverFrame] = useState<CoverFrameId>("window");

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
          // 기간은 사진의 촬영 날짜에서 채워진다 — 직접 적는 일은 앨범 정보 수정에서 한다.
          startDate: "",
          endDate: "",
          description: description.trim(),
          coverColor,
          coverShape,
          coverFrame,
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
      {/* 어두운 작업대 — 만들 앨범을 눈앞에 두고 겉모습을 정한다.
          좌우·위 여백을 무시하고 화면을 꽉 채우고, 그 위에 흰 상단 바를 얹는다. */}
      <section className="relative -mx-5 -mt-[max(16px,env(safe-area-inset-top))] overflow-hidden bg-ink text-canvas">
        {/* 표지 뒤로 번지는 빛 — 어둠이 납작해지지 않게 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_54%_at_50%_46%,rgb(255_255_255/0.17)_0%,rgb(255_255_255/0)_72%)]" />

        <header className="relative z-10 flex h-14 items-center px-5 pt-[env(safe-area-inset-top)]">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-2 text-canvas hover:bg-canvas/15 hover:text-canvas"
            onClick={() => go("home")}
            aria-label="뒤로가기"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold whitespace-nowrap text-canvas">
            새 앨범 만들기
          </h1>
        </header>

        <div className="relative z-10 flex flex-col items-center gap-4 px-5 pt-3 pb-10">
          {/* 고른 색·판형·사진 자리가 실제 표지로 어떻게 보이는지 여기서 바로 보인다 */}
          <AlbumCover
            album={{
              id: "preview",
              coverColor,
              coverShape,
              coverFrame,
              cover: cover ?? PLACEHOLDER_COVER,
            }}
            className="w-44 drop-shadow-[0_20px_30px_rgb(0_0_0/0.55)]"
          />
          {/* 표지 색은 표지 바로 아래 — 고르는 순간 위 표지가 그 색이 된다 */}
          <CoverColorPicker
            value={coverColor}
            onChange={setCoverColor}
            tone="dark"
            className="mt-1 grid w-fit grid-cols-6 gap-3"
          />
        </div>
      </section>

      <form className="mt-7 flex flex-col gap-7 pb-20" onSubmit={submit}>
        {/* 겉모습 — 위 표지가 바로 따라 바뀌는 것들끼리 모은다 */}
        <section className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-ink">표지 꾸미기</h2>

          <label className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-mute px-4 py-3 transition-colors hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-ink">
              <ImagePlus className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[15px] font-semibold">
                {cover ? "대표 사진 변경" : "대표 사진 추가"}
              </b>
              <small className="block text-xs text-body-mid">JPG, PNG · 최대 10MB</small>
            </span>
            <input
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(e) => chooseFile(e.target.files?.[0])}
            />
          </label>

          <Field label="앨범 판형">
            <CoverShapePicker value={coverShape} onChange={setCoverShape} />
          </Field>

          <Field label="사진이 보이는 자리">
            <CoverFramePicker
              value={coverFrame}
              onChange={setCoverFrame}
              shape={coverShape}
              color={coverColor}
              cover={cover ?? PLACEHOLDER_COVER}
            />
          </Field>
        </section>

        {/* 앨범 정보 — 겉모습과는 하는 일이 달라 줄 하나로 갈라 둔다 */}
        <section className="flex flex-col gap-5 border-t border-border pt-7">
          <h2 className="text-sm font-semibold text-ink">앨범 정보</h2>

          <Field label="앨범 제목" htmlFor="record-title" required>
            <Input
              id="record-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2023년 유럽여행"
            />
          </Field>

          <Field label="짧은 설명" htmlFor="desc">
            <Textarea
              id="desc"
              className="min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 가족들과 처음 떠난 유럽여행의 사진과 기록을 모았어요."
            />
          </Field>
        </section>

        <StickyBar>
          <Button size="lg" className="w-full" disabled={!title.trim() || ready}>
            {ready ? "앨범을 만들고 있어요…" : "앨범 만들기"}
          </Button>
        </StickyBar>
      </form>
    </>
  );
}
