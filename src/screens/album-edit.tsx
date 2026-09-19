import { useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { InfoHint } from "@/components/info-hint";
import { DateField } from "@/components/date-field";
import { StickyBar } from "@/components/sticky-bar";
import {
  albumPeriod,
  coverColorOf,
  coverFrameOf,
  coverPreviewWidth,
  coverShapeOf,
} from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import { useAlbumPhotos } from "@/data/photos";
import { AlbumCover } from "@/components/album-cover";
import { CoverColorPicker } from "@/components/cover-color-picker";
import { CoverFramePicker, CoverShapePicker } from "@/components/cover-style-picker";
import type { Notify } from "@/types";

export function AlbumEditScreen({
  album,
  onSave,
  back,
  notify,
}: {
  album: AlbumCardData;
  onSave: (album: AlbumCardData) => void;
  back: () => void;
  notify: Notify;
}) {
  // 표지 사진까지 고칠 수 있으므로 카드 데이터 전체를 들고 고친다.
  const [draft, setDraft] = useState<AlbumCardData>(album);

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return notify("이미지 파일만 선택해주세요");
    const reader = new FileReader();
    reader.onload = () =>
      setDraft((d) => ({
        ...d,
        cover: String(reader.result),
        coverAlt: `${d.title.trim() || "앨범"} 대표 사진`,
      }));
    reader.readAsDataURL(file);
  }
  // 날짜를 비워 두면 사진의 촬영 날짜가 앨범 기간이 된다 — 그 값을 칸에 미리 보여준다.
  const photos = useAlbumPhotos(album.id);
  const period = albumPeriod(draft, photos);

  const trimmed = draft.title.trim();
  const changed =
    trimmed.length > 0 && JSON.stringify({ ...draft, title: trimmed }) !== JSON.stringify(album);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!changed) return;
    onSave({ ...draft, title: trimmed });
    notify("앨범 정보를 저장했어요");
    back();
  }

  return (
    <>
      {/* 만들기와 같은 어두운 작업대 — 표지를 눈앞에 두고 겉모습을 고친다 */}
      <section className="relative -mx-5 -mt-[max(16px,env(safe-area-inset-top))] overflow-hidden bg-ink px-5 pt-[max(16px,env(safe-area-inset-top))] pb-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_54%_at_50%_46%,rgb(255_255_255/0.17)_0%,rgb(255_255_255/0)_72%)]" />

        <header className="relative z-10 flex h-14 items-center px-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-2 text-canvas hover:bg-canvas/15 hover:text-canvas"
            onClick={back}
            aria-label="뒤로가기"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold whitespace-nowrap text-canvas">
            앨범 정보
          </h1>
        </header>

        <div className="relative z-10 flex flex-col items-center gap-4 px-5 pt-3">
          <div className="flex h-[154px] items-center justify-center">
            <AlbumCover
              album={{
                id: album.id,
                coverColor: coverColorOf(draft).id,
                coverShape: coverShapeOf(draft).id,
                coverFrame: coverFrameOf(draft).id,
                cover: draft.cover,
              }}
              style={{ width: coverPreviewWidth(draft) }}
              className="drop-shadow-[0_20px_30px_rgb(0_0_0/0.55)]"
            />
          </div>
          <CoverColorPicker
            value={coverColorOf(draft).id}
            onChange={(coverColor) => setDraft({ ...draft, coverColor })}
            tone="dark"
            className="mt-[14px] max-w-[216px] justify-center gap-3"
          />
        </div>
      </section>

      {/* 앨범 정보는 만든 사람만의 것이 아니다 — 참여 중인 가족이면 누구나 고친다. */}
      <p className="mt-6 rounded-lg bg-muted p-3 text-sm leading-relaxed text-body">
        참여 중인 구성원은 누구나 앨범 정보를 고칠 수 있어요. 바꾼 내용은 모두에게 바로 보여요.
      </p>

      <form className="mt-6 flex flex-col gap-6 pb-20" onSubmit={submit}>
        <Field label="대표 사진">
          <label className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-mute px-4 py-3 transition-colors hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-ink">
              <ImagePlus className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[15px] font-semibold">대표 사진 변경</b>
              <small className="block text-xs text-body-mid">JPG, PNG · 최대 10MB</small>
            </span>
            <input
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(e) => chooseFile(e.target.files?.[0])}
            />
          </label>
        </Field>

        <Field label="앨범 비율">
          <CoverShapePicker
            value={coverShapeOf(draft).id}
            onChange={(coverShape) => setDraft({ ...draft, coverShape })}
          />
        </Field>

        <Field label="앨범 디자인">
          <CoverFramePicker
            value={coverFrameOf(draft).id}
            onChange={(coverFrame) => setDraft({ ...draft, coverFrame })}
            shape={coverShapeOf(draft).id}
            color={coverColorOf(draft).id}
            cover={draft.cover}
          />
        </Field>

        <Field label="앨범 제목" htmlFor="album-title" required>
          <Input
            id="album-title"
            value={draft.title}
            maxLength={40}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="예: 2023년 유럽여행"
          />
        </Field>

        {/* 앨범 기간 — 기본은 사진이 정한다. 앨범에 담긴 사진 중 가장 오래된 날짜가 시작일,
            가장 최근 날짜가 종료일이다. 여기서만 손으로 고칠 수 있고, 고친 값은 사진보다 앞선다.
            그 규칙은 ⓘ 말풍선으로 설명하고, 칸 안에는 지금 쓰이고 있는 날짜를 연하게 비춰 준다. */}
        <div className="flex flex-col gap-2">
          <div className="-mb-1 flex items-center gap-0.5">
            <span className="text-sm font-semibold text-ink">앨범 기간</span>
            <InfoHint label="앨범 기간 안내">
              시작일과 종료일은 앨범에 담긴 사진 중 가장 오래된 날짜와 가장 최근 날짜로 자동으로
              채워져요. 사진이 늘면 기간도 따라 넓어져요. 직접 고치고 싶을 때만 여기서 바꾸면 돼요.
            </InfoHint>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="시작일" htmlFor="album-start" className="min-w-0">
              <DateField
                id="album-start"
                label="시작일"
                compact
                value={draft.startDate}
                auto={period.auto.start ? period.startDate : ""}
                onChange={(startDate) => setDraft({ ...draft, startDate })}
              />
            </Field>
            <Field label="종료일" htmlFor="album-end" className="min-w-0">
              <DateField
                id="album-end"
                label="종료일"
                compact
                value={draft.endDate}
                auto={period.auto.end ? period.endDate : ""}
                onChange={(endDate) => setDraft({ ...draft, endDate })}
              />
            </Field>
          </div>
          {period.auto.start || period.auto.end ? (
            <p className="text-xs text-body-mid">
              비워 둔 날짜는 사진의 촬영 날짜로 채워져요. 사진이 늘면 그만큼 기간도 넓어져요.
            </p>
          ) : (
            photos.length > 0 && (
              <div className="flex items-center gap-1">
                <p className="text-xs text-body-mid">직접 고른 날짜예요.</p>
                <Button
                  type="button"
                  variant="quiet"
                  size="xs"
                  onClick={() => setDraft({ ...draft, startDate: "", endDate: "" })}
                >
                  사진 날짜로 되돌리기
                </Button>
              </div>
            )
          )}
        </div>

        <Field label="짧은 설명" htmlFor="album-desc">
          <Textarea
            id="album-desc"
            className="min-h-24"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="예: 가족들과 처음 떠난 유럽여행의 사진과 기록을 모았어요."
          />
        </Field>

        <StickyBar>
          <Button size="lg" className="w-full" disabled={!changed}>
            저장하기
          </Button>
        </StickyBar>
      </form>
    </>
  );
}
