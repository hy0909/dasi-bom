import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CharacterAvatar } from "@/components/character-avatar";
import { Wordmark } from "@/components/wordmark";
import { useSession } from "@/lib/auth";
import type { Go } from "@/types";

export function Topbar({
  back,
  title,
  action,
  go,
}: {
  back?: () => void;
  title?: string;
  action?: ReactNode;
  go?: Go;
}) {
  const session = useSession();

  return (
    <header className="relative z-10 flex h-14 items-center justify-between">
      {back ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="-ml-2"
          onClick={back}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5" />
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => go?.("home")}
          aria-label="다시, 봄 홈"
          className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Wordmark />
        </button>
      )}
      {title && (
        <strong className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold whitespace-nowrap">
          {title}
        </strong>
      )}
      {action ??
        (!back ? (
          <button
            type="button"
            onClick={() => go?.("profile")}
            aria-label="프로필 열기"
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <CharacterAvatar index={session?.tone} color={session?.color} className="size-9" />
          </button>
        ) : (
          <span className="size-9" />
        ))}
    </header>
  );
}
