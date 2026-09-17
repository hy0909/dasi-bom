import { useRef, useState } from "react";
import { FolderOpen, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/topbar";
import { MAX_PHOTOS } from "@/components/album-cover";
import { albumPeriod, formatAlbumPeriod } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import {
  type Photo,
  addPhotos,
  byTakenAt,
  formatDate,
  photoFromFile,
  useAlbumPhotos,
  withPlace,
} from "@/data/photos";
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
  /** 사진에서 촬영 정보를 읽고 지명을 받아오는 중 — 그동안은 추가를 막는다. */
  const [reading, setReading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const touch = isTouch();
  const folder = !touch && canOpenFolder();

  // 앨범에 이미 있는 사진까지 더해야 기간이 어떻게 채워질지 미리 보여줄 수 있다.
  const inAlbum = useAlbumPhotos(album.id);
  const period = albumPeriod(album, [...inAlbum, ...items]);
  // 촬영 시각이 적혀 있지 않아 파일 시각으로 갈음한 사진 — 몇 장인지 밝혀 둔다.
  const guessed = items.filter((photo) => photo.takenAtFrom !== "exif").length;

  // 한 앨범은 MAX_PHOTOS 장까지 — 이미 담긴 사진과 지금 고른 사진을 함께 세어 남은 자리를 구한다.
  const room = MAX_PHOTOS - inAlbum.length - items.length;

  async function add(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    if (room <= 0) {
      notify(`한 앨범에는 사진을 ${MAX_PHOTOS}장까지 담을 수 있어요`);
      return;
    }
    // 남은 자리보다 많이 골랐으면 담기는 만큼만 받고, 몇 장만 받았는지 알린다.
    const taking = images.slice(0, room);
    if (taking.length < images.length) {
      notify(`${MAX_PHOTOS}장까지 담을 수 있어 ${taking.length}장만 받았어요`);
    }
    setReading(true);
    // 촬영 시각과 좌표는 사진 안에 적혀 있다 — 파일에서 바로 읽어 먼저 줄을 세운다.
    const picked = await Promise.all(taking.map(photoFromFile));
    // 고르는 순서와 상관없이 촬영 시각순으로 줄을 세운다 — 기록도 이 순서로 한다.
    setItems((old) => byTakenAt([...old, ...picked]));
    // 좌표를 지명으로 바꾸는 일만 시간이 걸린다 — 도착하는 사진부터 한 장씩 채운다.
    await Promise.all(
      picked.map(async (photo) => {
        if (!photo.coords) return;
        const named = await withPlace(photo);
        setItems((old) => old.map((item) => (item.src === photo.src ? named : item)));
      }),
    );
    setReading(false);
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
          {folder
            ? `다운로드 폴더부터 열려요 · 최대 ${MAX_PHOTOS}장`
            : `JPG, PNG, WebP · 최대 ${MAX_PHOTOS}장`}
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

      {(items.length > 0 || reading) && (
        <div className="mt-5 flex flex-col gap-1 text-xs text-body">
          <p>
            {reading
              ? "사진에 적힌 촬영 날짜와 장소를 읽고 있어요…"
              : "사진에 적힌 촬영 날짜와 장소를 읽어 이른 순서로 정렬했어요. 이 순서대로 기록을 남기게 돼요."}
          </p>
          {!reading && guessed > 0 && (
            <p className="text-body-mid">
              {guessed}장은 촬영 정보가 없어 파일에 적힌 시각으로 정리했어요. 날짜는 나중에 고칠 수
              있어요.
            </p>
          )}
          {/* 날짜를 비워 둔 앨범이면, 이 사진들로 기간이 어떻게 채워지는지 미리 보여준다. */}
          {!reading && (period.auto.start || period.auto.end) && (
            <p className="text-body-mid">
              앨범 기간도 사진 날짜에 맞춰 <b className="font-semibold text-body">{formatAlbumPeriod(period)}</b>
              로 채워져요.
            </p>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {items.map((photo, i) => (
            <div key={photo.src} className="flex flex-col gap-1">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
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
              </div>
              {/* 읽어 온 촬영 정보를 바로 확인시켜 준다 — 앨범 상세에도 이 값이 그대로 간다.
                  해가 다른 사진이 섞일 수 있어 날짜는 연도까지 적고, 장소는 아랫줄에 둔다. */}
              <small className="flex flex-col px-0.5 text-[10.5px] leading-tight text-body-mid">
                <span className="truncate">{formatDate(photo.takenAt)}</span>
                <span className="truncate">{photo.shortPlace}</span>
              </small>
            </div>
          ))}
        </div>
      )}

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!items.length || reading}
        onClick={() => {
          addPhotos(album.id, items);
          notify(`사진 ${items.length}장을 촬영 시간순으로 정리했어요`);
          // 정리가 끝나면 가장 오래된 사진부터 기록을 남긴다.
          go("interview");
        }}
      >
        {reading
          ? "촬영 정보를 읽고 있어요…"
          : items.length
            ? `사진 ${items.length}장 추가하고 기록 시작`
            : "사진을 먼저 골라주세요"}
      </Button>
    </>
  );
}
