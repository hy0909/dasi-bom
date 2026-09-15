import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Topbar } from "@/components/topbar";
import { Field } from "@/components/field";
import { StickyBar } from "@/components/sticky-bar";
import { cn } from "@/lib/utils";
import type { Album, AlbumStatus } from "@/data/album";
import type { Notify } from "@/types";

const statuses: AlbumStatus[] = ["기록 중", "완료"];

export function AlbumEditScreen({
  album,
  onSave,
  back,
  notify,
}: {
  album: Album;
  onSave: (album: Album) => void;
  back: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState(album);

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

        <div className="grid grid-cols-2 gap-3">
          <Field label="시작일" htmlFor="album-start">
            <Input
              id="album-start"
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            />
          </Field>
          <Field label="종료일" htmlFor="album-end">
            <Input
              id="album-end"
              type="date"
              value={draft.endDate}
              onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            />
          </Field>
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

        {/* 상태는 앨범을 만든 사람만 바꾼다 — 가족의 답변과 무관하게 직접 고르는 값 */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">앨범 상태</span>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="앨범 상태">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                role="radio"
                aria-checked={draft.status === status}
                onClick={() => setDraft({ ...draft, status })}
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  draft.status === status
                    ? "border-ink bg-ink text-canvas"
                    : "border-border text-body hover:bg-muted",
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <p className="text-xs text-body-mid">
            완료로 바꾸면 가족에게 더 이상 답변을 요청하지 않아요. 언제든 다시 기록 중으로 되돌릴 수
            있어요.
          </p>
        </div>

        <StickyBar>
          <Button size="lg" className="w-full" disabled={!changed}>
            저장하기
          </Button>
        </StickyBar>
      </form>
    </>
  );
}
