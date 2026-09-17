import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/topbar";
import { Field } from "@/components/field";
import { DateField } from "@/components/date-field";
import { StickyBar } from "@/components/sticky-bar";
import { albumPeriod, coverColorOf, coverFrameOf, coverShapeOf, type Album } from "@/data/album";
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
  onSave: (album: Album) => void;
  back: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<Album>(album);
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
      <Topbar back={back} title="앨범 정보" />

      {/* 앨범 정보는 만든 사람만의 것이 아니다 — 참여 중인 가족이면 누구나 고친다. */}
      <p className="mt-4 rounded-lg bg-muted p-3 text-sm leading-relaxed text-body">
        참여 중인 가족은 누구나 앨범 정보를 고칠 수 있어요. 바꾼 내용은 함께 보는 모두에게 바로
        보여요.
      </p>

      <form className="mt-6 flex flex-col gap-6 pb-20" onSubmit={submit}>
        <Field label="앨범 제목" htmlFor="album-title" required>
          <Input
            id="album-title"
            value={draft.title}
            maxLength={40}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="예: 2023년 유럽여행"
          />
        </Field>

        {/* 시작일과 종료일은 한 줄에 반씩 나눠 갖는다 — 폭이 같고 사이가 벌어져 서로 닿지 않는다.
            비워 두면 사진의 촬영 날짜가 대신 쓰이므로, 그 날짜를 칸 안에 연하게 보여준다. */}
        <div className="flex flex-col gap-2">
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

        <Field label="앨범 커버 색">
          <div className="flex items-start gap-4">
            {/* 만들기와 같은 미리보기 — 고른 색이 실제 커버로 어떻게 보이는지 */}
            <AlbumCover
              album={{
                id: album.id,
                coverColor: coverColorOf(draft).id,
                coverShape: coverShapeOf(draft).id,
                coverFrame: coverFrameOf(draft).id,
                cover: album.cover,
              }}
              className="mt-1 w-40 shrink-0"
            />
            <CoverColorPicker
              value={coverColorOf(draft).id}
              onChange={(coverColor) => setDraft({ ...draft, coverColor })}
            />
          </div>
        </Field>

        <Field label="앨범 판형">
          <CoverShapePicker
            value={coverShapeOf(draft).id}
            onChange={(coverShape) => setDraft({ ...draft, coverShape })}
          />
        </Field>

        <Field label="사진이 보이는 자리">
          <CoverFramePicker
            value={coverFrameOf(draft).id}
            onChange={(coverFrame) => setDraft({ ...draft, coverFrame })}
            shape={coverShapeOf(draft).id}
            color={coverColorOf(draft).id}
            cover={album.cover}
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
