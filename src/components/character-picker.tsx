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
import { AVATAR_COLORS, CHARACTERS, CharacterAvatar } from "@/components/character-avatar";
import { cn } from "@/lib/utils";

/**
 * 프로필 캐릭터 + 배경색 고르기 모달.
 * 모달 안의 선택은 임시값이고, '이 프로필로 할게요'를 눌러야 부모에게 넘어간다.
 * 실제 저장은 부모 화면의 저장 버튼에서 일어난다.
 */
export function CharacterPicker({
  open,
  onOpenChange,
  character,
  color,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: number;
  color: number;
  onConfirm: (next: { character: number; color: number }) => void;
}) {
  const [pickedCharacter, setPickedCharacter] = useState(character);
  const [pickedColor, setPickedColor] = useState(color);

  // 모달을 다시 열면 현재 선택에서 시작한다.
  useEffect(() => {
    if (open) {
      setPickedCharacter(character);
      setPickedColor(color);
    }
  }, [open, character, color]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[min(100vw-40px,380px)] gap-5 overflow-y-auto rounded-xl bg-canvas p-6">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="font-heading text-display-sm font-bold">프로필</DialogTitle>
          <DialogDescription className="text-sm text-body">
            가족에게 보일 캐릭터와 배경색을 골라주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <CharacterAvatar index={pickedCharacter} color={pickedColor} size="xl" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-body">캐릭터</span>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="프로필 캐릭터">
            {CHARACTERS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={pickedCharacter === i}
                onClick={() => setPickedCharacter(i)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  pickedCharacter === i ? "border-ink bg-muted" : "border-border hover:bg-muted/60",
                )}
              >
                <CharacterAvatar index={i} color={pickedColor} />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-body">배경색</span>
          <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-label="프로필 배경색">
            {AVATAR_COLORS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={pickedColor === i}
                aria-label={item.label}
                onClick={() => setPickedColor(i)}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-full border transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  pickedColor === i ? "border-ink" : "border-border hover:scale-105",
                )}
                style={{ backgroundColor: item.value }}
              >
                {pickedColor === i && <Check className="size-3.5 text-ink" strokeWidth={3} />}
              </button>
            ))}
          </div>
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
              onConfirm({ character: pickedCharacter, color: pickedColor });
              onOpenChange(false);
            }}
          >
            이 프로필로 할게요
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
