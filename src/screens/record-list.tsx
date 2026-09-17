import { AudioLines, ChevronRight, PenLine } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { StatusFilter, useStatusFilter } from "@/components/status-filter";
import type { AlbumCardData } from "@/data/albums";
import { formatDate, photoStatus, useAlbumPhotos, type Photo } from "@/data/photos";
import type { Go } from "@/types";

/** 앨범의 사진을 상태별로 모아, 남은 사진은 바로 이어서 기록하도록 돕는 화면. */
export function RecordListScreen({
  go,
  album,
  back,
}: {
  go: Go;
  album: AlbumCardData;
  back: () => void;
}) {
  const photos = useAlbumPhotos(album.id);
  // 이 화면은 남은 사진부터 보여준다 — 칩을 눌러 전체나 기록 완료로 옮겨 갈 수 있다.
  const { status, setStatus, counts, list } = useStatusFilter(photos, "기록 전");
  // 번호는 걸러 봐도 앨범에서의 순서 그대로다 — 상세의 사진·목소리·글·연대표와 같은 번호다.
  const orderOf = (photo: (typeof photos)[number]) => photos.indexOf(photo) + 1;

  return (
    <>
      <Topbar back={back} title="기록할 사진" />

      <p className="mt-6 text-sm text-body">
        {counts["기록 전"] === 0
          ? "모든 사진의 기록이 끝났어요."
          : `${photos.length}장 중 ${counts["기록 전"]}장이 남았어요. 사진을 누르면 바로 기록할 수 있어요.`}
      </p>

      <div className="mt-4">
        <StatusFilter value={status} onChange={setStatus} counts={counts} />
      </div>

      {list.length === 0 ? (
        <p className="mt-8 text-center text-sm text-body-mid">이 상태의 사진이 없어요.</p>
      ) : (
        <section className="mt-2 flex flex-col divide-y divide-border">
          {list.map((photo) => (
            <button
              key={photo.title}
              type="button"
              // 기록이 끝난 사진은 완성된 글로, 남은 사진은 질문으로 간다.
              onClick={() => go(photoStatus(photo) === "기록 완료" ? "story" : "interview")}
              className="flex w-full items-center gap-3 py-3 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <img src={photo.src} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[15px] font-semibold">{photo.title}</b>
                <small className="block truncate text-[13px] text-body-mid">
                  <span className="font-semibold text-body tabular-nums">
                    {orderOf(photo)}번째 사진
                  </span>{" "}
                  · {formatDate(photo.takenAt)} · {photo.shortPlace}
                </small>
                {/* 기록이 끝난 사진은 목소리·글 중 무엇이 들어왔는지 함께 보인다 */}
                <RecordMarks photo={photo} />
              </span>
              <ChevronRight className="size-4 shrink-0 text-body-mid" />
            </button>
          ))}
        </section>
      )}
    </>
  );
}

/** 이 사진에 들어온 기록 — 목소리와 글 중 있는 것만 상세 요약과 같은 아이콘으로 보인다. */
function RecordMarks({ photo }: { photo: Photo }) {
  const voices = photo.voices?.length ?? 0;
  const story = Boolean(photo.story?.trim());
  if (voices === 0 && !story) return null;
  return (
    <span className="mt-1 flex items-center gap-2.5 text-xs text-body">
      {voices > 0 && (
        <span className="flex items-center gap-1">
          <AudioLines className="size-3.5 text-body-mid" aria-hidden />
          목소리 {voices}
        </span>
      )}
      {story && (
        <span className="flex items-center gap-1">
          <PenLine className="size-3.5 text-body-mid" aria-hidden />글
        </span>
      )}
    </span>
  );
}
