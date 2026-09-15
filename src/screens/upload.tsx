import { useRef, useState } from "react";
import { FolderOpen, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/topbar";
import type { AlbumCardData } from "@/data/albums";
import { type Photo, addPhotos, byTakenAt, photoFromFile } from "@/data/photos";
import type { Go, Notify } from "@/types";

/** 파일 탐색기를 다운로드 폴더에서 열 수 있는 환경인가 — 데스크톱 크로미움 계열. */
function canOpenFolder() {
  return typeof window !== "undefined" && "showOpenFilePicker" in window;
}

/** 손가락으로 쓰는 기기인가 — 문구를 '폰에 저장된 사진'으로 바꾼다. */
function isTouch() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

export function UploadScreen({
  go,
  album,
  notify,
}: {
  go: Go;
  album: AlbumCardData;
  notify: Notify;
}) {
  const [items, setItems] = useState<Photo[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const touch = isTouch();
  const folder = !touch && canOpenFolder();

  function add(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    // 고르는 순서와 상관없이 촬영 시각순으로 줄을 세운다 — 기록도 이 순서로 한다.
    setItems((old) => byTakenAt([...old, ...images.map(photoFromFile)]));
  }

  /** 데스크톱은 다운로드 폴더부터 연다. 그 외에는 기기의 기본 사진 선택기로 넘긴다. */
  async function pick() {
    const picker = window.showOpenFilePicker;
    if (!folder || !picker) return input.current?.click();
    try {
      const handles = await picker.call(window, {
        multiple: true,
        startIn: "downloads",
        types: [
          {
            description: "사진",
            accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"] },
          },
        ],
      });
      add(await Promise.all(handles.map((handle) => handle.getFile())));
    } catch {
      // 사용자가 창을 닫은 경우 — 아무 일도 일어나지 않는다.
    }
  }

  return (
    <>
      <Topbar back={() => go("detail")} title="사진 추가하기" />

      <button
        type="button"
        onClick={pick}
        className="mt-4 flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-mute bg-muted/60 px-6 py-12 text-center transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      >
        <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-canvas text-ink">
          {folder ? <FolderOpen className="size-6" /> : <Images className="size-6" />}
        </span>
        <b className="text-[17px] font-semibold">
          {touch ? "폰에 저장된 사진 불러오기" : "내 컴퓨터에서 사진 고르기"}
        </b>
        <small className="text-sm text-body-mid">
          {folder ? "다운로드 폴더부터 열려요 · 여러 장 선택 가능" : "JPG, PNG, WebP · 여러 장 선택 가능"}
        </small>
      </button>

      {/* 파일 선택기를 열 수 없는 환경(모바일·사파리)의 기본 경로 */}
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {items.length > 0 && (
        <p className="mt-5 text-xs text-body">
          촬영이 이른 사진부터 정렬했어요. 이 순서대로 기록을 남기게 돼요.
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {items.map((photo, i) => (
            <div
              key={photo.src}
              className="relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={photo.src}
                alt={photo.title || `선택한 사진 ${i + 1}`}
                className="size-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon-xs"
                className="absolute top-1.5 right-1.5 rounded-full"
                onClick={() => setItems(items.filter((_, n) => n !== i))}
                aria-label={`${photo.title || `사진 ${i + 1}`} 선택 해제`}
              >
                <X className="size-3.5" />
              </Button>
              <Badge variant="glass" className="absolute bottom-1.5 left-1.5 h-5 px-2 text-[10px]">
                업로드 준비
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!items.length}
        onClick={() => {
          addPhotos(album.id, items);
          notify(`사진 ${items.length}장을 촬영 시간순으로 정리했어요`);
          // 정리가 끝나면 가장 오래된 사진부터 기록을 남긴다.
          go("interview");
        }}
      >
        {items.length ? `사진 ${items.length}장 추가하고 기록 시작` : "사진을 먼저 골라주세요"}
      </Button>
    </>
  );
}
