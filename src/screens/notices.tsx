import { Sparkles } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { ListRow } from "@/components/list-row";
import { InitialsAvatar } from "@/components/initials-avatar";
import type { Go } from "@/types";

export function NoticesScreen({ go, back }: { go: Go; back: () => void }) {
  return (
    <>
      <Topbar back={back} title="알림" />
      <section className="mt-2 flex flex-col divide-y divide-border">
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
