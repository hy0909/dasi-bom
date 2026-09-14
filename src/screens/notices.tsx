import { Sparkles } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { ListRow } from "@/components/list-row";
import { InitialsAvatar } from "@/components/initials-avatar";
import type { Go } from "@/types";

export function NoticesScreen({ go }: { go: Go }) {
  return (
    <>
      {/* 탭 최상위 화면이라 상단 바가 없다 — 돌아갈 상위 화면이 없다. */}
      <h1 className="mt-8 font-heading text-display-lg font-bold">알림</h1>
      <section className="mt-6 flex flex-col">
        <ListRow
          onClick={() => go("detail")}
          leading={<InitialsAvatar name="엄" tone={1} size="lg" />}
          title="엄마가 새 목소리를 남겼어요"
          description="‘파리에 도착한 첫날’ · 방금 전"
          trailing={<span className="size-2 rounded-full bg-primary" aria-label="새 알림" />}
        />
        <ListRow
          onClick={() => go("story")}
          leading={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-canvas">
              <Sparkles className="size-5" />
            </span>
          }
          title="새로운 사진 이야기가 완성됐어요"
          description="‘다 함께한 저녁 식사’ · 2시간 전"
          chevron
        />
      </section>

      <BottomNav go={go} active="notices" />
    </>
  );
}
