import { useState } from "react";
import { Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/topbar";
import type { Go, Notify } from "@/types";

export function UploadScreen({ go, notify }: { go: Go; notify: Notify }) {
  const [items, setItems] = useState<string[]>([]);

  function add(files: FileList | null) {
    if (!files) return;
    setItems((old) => [
      ...old,
      ...Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map(URL.createObjectURL),
    ]);
  }

  return (
    <>
      <Topbar back={() => go("detail")} title="사진 추가하기" />

      <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-mute bg-muted/60 px-6 py-12 text-center transition-colors hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40">
        <span className="mb-1 flex size-14 items-center justify-center rounded-full bg-canvas text-ink">
          <Images className="size-6" />
        </span>
        <b className="text-[17px] font-semibold">사진을 선택해주세요</b>
        <small className="text-sm text-body-mid">JPG, PNG, WebP · 여러 장 선택 가능</small>
        <input
          className="visually-hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => add(e.target.files)}
        />
      </label>

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {items.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img src={src} alt={`선택한 사진 ${i + 1}`} className="size-full object-cover" />
              <Button
                variant="secondary"
                size="icon-xs"
                className="absolute top-1.5 right-1.5 rounded-full"
                onClick={() => setItems(items.filter((_, n) => n !== i))}
                aria-label="사진 삭제"
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
          notify(`${items.length}장의 사진을 추가했어요`);
          go("detail");
        }}
      >
        {items.length ? `사진 ${items.length}장 업로드 완료` : "사진 업로드 완료"}
      </Button>
    </>
  );
}
