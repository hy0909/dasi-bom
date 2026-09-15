import { ChevronRight } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { formatDate, formatTime, photos } from "@/data/photos";
import type { Go } from "@/types";

/** 아직 기록이 끝나지 않은 사진만 모아 바로 이어서 기록하도록 돕는 화면. */
export function RecordListScreen({ go, back }: { go: Go; back: () => void }) {
  const pending = photos.filter((photo) => photo.status === "기록 중");

  return (
    <>
      <Topbar back={back} title="기록할 사진" />

      <p className="mt-6 text-sm text-body">
        {pending.length === 0
          ? "모든 사진의 기록이 끝났어요."
          : `${photos.length}장 중 ${pending.length}장이 남았어요. 사진을 누르면 바로 기록할 수 있어요.`}
      </p>

      <section className="mt-4 flex flex-col divide-y divide-border">
        {pending.map((photo) => (
          <button
            key={photo.title}
            type="button"
            onClick={() => go("interview")}
            className="flex w-full items-center gap-3 py-3 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <img
              src={photo.src}
              alt=""
              className="size-16 shrink-0 rounded-lg object-cover"
            />
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[15px] font-semibold">{photo.title}</b>
              <small className="block truncate text-[13px] text-body-mid">
                {formatDate(photo.takenAt)} · {formatTime(photo.takenAt)} · {photo.shortPlace}
              </small>
            </span>
            <ChevronRight className="size-4 shrink-0 text-body-mid" />
          </button>
        ))}
      </section>
    </>
  );
}
