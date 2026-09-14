import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CHARACTERS, CharacterAvatar } from "@/components/character-avatar";
import { cn } from "@/lib/utils";

/**
 * 프로필 캐릭터 고르기 모달.
 * 모달 안의 선택은 임시값이고, '이 캐릭터로 할게요'를 눌러야 부모에게 넘어간다.
 * 실제 저장은 부모 화면의 저장 버튼에서 일어난다.
 */
export function CharacterPicker({
  open,
  onOpenChange,
  value,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number;
  onConfirm: (index: number) => void;
}) {
  const [picked, setPicked] = useState(value);

  // 모달을 다시 열면 현재 선택에서 시작한다.
  useEffect(() => {
    if (open) setPicked(value);
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-40px,380px)] gap-6 rounded-xl bg-canvas p-6">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="font-heading text-display-sm font-bold">
            프로필 캐릭터
          </DialogTitle>
          <DialogDescription className="text-sm text-body">
            가족에게 보일 캐릭터를 하나 골라주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="프로필 캐릭터">
          {CHARACTERS.map((character, i) => (
            <button
              key={character.id}
              type="button"
              role="radio"
              aria-checked={picked === i}
              onClick={() => setPicked(i)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                picked === i ? "border-ink bg-muted" : "border-border hover:bg-muted/60",
              )}
            >
              <CharacterAvatar index={i} size="lg" />
              <span className="text-xs font-semibold">{character.label}</span>
              {picked === i && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-canvas">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
              )}
            </button>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              onConfirm(picked);
              onOpenChange(false);
            }}
          >
            이 캐릭터로 할게요
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
