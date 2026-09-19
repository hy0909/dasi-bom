import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlbumCover } from "@/components/album-cover";
import { isInvitePin } from "@/data/album";
import type { AlbumCardData } from "@/data/albums";
import type { Notify } from "@/types";

/**
 * 초대 링크로 들어온 사람이 처음 만나는 잠금 화면.
 * 링크만으로는 앨범이 열리지 않는다 — 초대한 사람이 링크와 함께 알려 준 네 자리를 맞혀야 다음으로 간다.
 */
export function GuestPin({
  album,
  onUnlock,
  notify,
}: {
  album: AlbumCardData;
  onUnlock: () => void;
  notify: Notify;
}) {
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (pin.length < 4) return;
    if (!isInvitePin(album, pin)) {
      // 틀린 번호는 지우고 다시 받는다 — 어디가 틀렸는지 알려 줄 것은 없다.
      setWrong(true);
      setPin("");
      field.current?.focus();
      notify("비밀번호가 맞지 않아요");
      return;
    }
    onUnlock();
  }

  return (
    <section className="flex min-h-[80dvh] flex-col justify-center py-10">
      <div className="flex flex-col items-center text-center">
        <AlbumCover album={album} className="w-28" />
        <p className="mt-6 text-sm text-body">초대받은 앨범</p>
        <h1 className="mt-1 font-heading text-display-md font-bold">{album.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-body">
          링크를 보낸 가족에게 받은
          <br />
          네 자리 비밀번호를 적어주세요.
        </p>
      </div>

      <form className="mt-8 flex flex-col gap-3" onSubmit={submit}>
        <Input
          ref={field}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          aria-label="초대 비밀번호 네 자리"
          aria-invalid={wrong}
          value={pin}
          onChange={(e) => {
            // 숫자만, 네 자리까지
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setWrong(false);
          }}
          placeholder="0000"
          className="h-14 text-center text-2xl font-semibold tracking-[0.5em] tabular-nums"
        />
        {wrong && (
          <p className="text-center text-sm text-destructive">
            비밀번호가 맞지 않아요. 다시 확인해주세요.
          </p>
        )}
        <Button size="lg" className="mt-1 w-full" disabled={pin.length < 4}>
          앨범 열기
        </Button>
        <p className="mt-1 text-center text-xs text-body-mid">
          비밀번호는 초대한 가족의 초대 화면에서 링크와 함께 볼 수 있어요.
        </p>
      </form>
    </section>
  );
}
