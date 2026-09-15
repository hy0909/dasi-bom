import { useEffect, useState } from "react";
import { Copy, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { SectionHeading } from "@/components/section-heading";
import { CharacterAvatar } from "@/components/character-avatar";
import { participants } from "@/data/family";
import { photos } from "@/data/photos";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import type { Go, Notify } from "@/types";

const statusVariant = { "참여 중": "primary", 초대됨: "default" } as const;

export function InviteScreen({
  go,
  back,
  notify,
}: {
  go: Go;
  /** 앨범 상세처럼 상위 화면에서 들어온 경우에만 전달된다. */
  back?: () => void;
  notify: Notify;
}) {
  const [link, setLink] = useState("초대 링크 준비 중…");
  useEffect(() => setLink(`${window.location.origin}${window.location.pathname}?invite=EU23`), []);

  async function copy() {
    await copyText(link);
    notify("실제 가족 참여 링크를 복사했어요");
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "2023년 유럽여행에 초대해요",
          text: "사진을 보고 떠오르는 이야기를 들려주세요.",
          url: link,
        });
      } catch {
        return;
      }
    } else await copy();
  }

  return (
    <>
      {/* 탭으로 들어오면 상단 바가 없고, 앨범에서 들어오면 돌아갈 곳이 있어 상단 바를 둔다. */}
      {back && <Topbar back={back} title="초대" />}

      <section className={cn("flex flex-col gap-3", back ? "mt-4" : "mt-8")}>
        <div className="mb-2 flex -space-x-4">
          {photos.map((p, i) => (
            <img
              key={p.title}
              src={p.src}
              alt=""
              className="size-16 rounded-lg object-cover ring-[3px] ring-canvas"
              style={{ transform: `rotate(${(i - 1) * 4}deg)`, zIndex: 3 - i }}
            />
          ))}
        </div>
        <h1 className="font-heading text-display-lg font-bold">
          가족의 목소리로
          <br />빈 이야기를 채워주세요
        </h1>
        <p className="text-base leading-relaxed text-body">
          링크를 통해 회원가입없이
          <br />
          사진을 추가할 수 있어요.
        </p>
      </section>

      {/* 초대 링크 — pricing-card 크롬 */}
      <Card variant="outline" size="sm" className="mt-6">
        <CardContent className="flex flex-col gap-3">
          <small className="text-xs font-semibold text-body">가족 참여 링크</small>
          <div className="flex items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{link.replace("https://", "")}</span>
            <Button variant="secondary" size="sm" onClick={copy}>
              <Copy className="size-3.5" />
              복사
            </Button>
          </div>
          <p className="text-xs text-body-mid">이 링크는 2026년 9월 28일까지 사용할 수 있어요.</p>
        </CardContent>
      </Card>

      {/* 이 화면의 유일한 주요 동작 — 오렌지 CTA 하나로 둔다. */}
      <Button size="lg" className="mt-3 w-full" onClick={share}>
        <Share2 className="size-5" />
        공유하기
      </Button>

      <section className="mt-9 flex flex-col gap-2">
        <SectionHeading
          title={<span className="text-lg">함께하는 가족 {participants.length}명</span>}
          description="답변이 도착하면 알려드릴게요"
        />
        <div className="flex flex-col">
          {/* 행 자체를 버튼으로 두지 않는다 — '다시 초대'가 행 안의 버튼이라 중첩이 된다. */}
          {participants.map(({ character, name, note, status }) => (
            <div key={name} className="flex w-full items-center gap-3 px-1 py-3">
              <CharacterAvatar index={character} size="lg" />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[15px] font-semibold">{name}</b>
                <small className="block truncate text-[13px] text-body-mid">{note}</small>
              </span>
              {status === "다시 초대" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => notify(`${name}에게 초대를 다시 보냈어요`)}
                >
                  <RotateCcw className="size-3.5" />
                  다시 초대
                </Button>
              ) : (
                <Badge variant={statusVariant[status]}>{status}</Badge>
              )}
            </div>
          ))}
        </div>
      </section>

      <BottomNav go={go} active="invite" />
    </>
  );
}

