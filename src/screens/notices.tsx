import { Sparkles } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { ListRow } from "@/components/list-row";
import { CharacterAvatar } from "@/components/character-avatar";
import type { Go } from "@/types";

export function NoticesScreen({ go }: { go: Go }) {
  return (
    <>
      {/* 탭 최상위 화면 — 상단 바 없이 제목을 홈의 워드마크와 같은 높이에서 시작한다. */}
      <h1 className="mt-2.5 font-heading text-display-lg font-bold">알림</h1>
      <section className="mt-6 flex flex-col">
        <ListRow
          onClick={() => go("detail")}
          leading={<CharacterAvatar index={0} color={5} size="lg" />}
          title="엄마가 새 목소리를 남겼어요"
          description="‘파리에 도착한 첫날’ · 방금 전"
          trailing={<span className="size-2 rounded-full bg-ink" aria-label="새 알림" />}
        />
        {/* 앨범 단위 알림이라 앨범 상세로 보낸다 — 사진 한 장이 아니라 앨범이 다 채워진 경우 */}
        <ListRow
          onClick={() => go("detail")}
          leading={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-canvas">
              <Sparkles className="size-5" />
            </span>
          }
          title="새 앨범이 완성됐어요"
          description="‘2023년 유럽여행’ · 2시간 전"
          chevron
        />
      </section>

      <BottomNav go={go} active="notices" />
    </>
  );
}
