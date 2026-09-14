import { useEffect, useState } from "react";
import { Copy, MessageSquare, Share2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { Eyebrow } from "@/components/eyebrow";
import { SectionHeading } from "@/components/section-heading";
import { InitialsAvatar } from "@/components/initials-avatar";
import { ListRow } from "@/components/list-row";
import { photos } from "@/data/photos";
import { copyText } from "@/lib/clipboard";
import type { Go, Notify } from "@/types";

const participants: [string, string, string, "완료" | "참여 중" | "초대됨"][] = [
  ["엄", "엄마", "답변 4개", "완료"],
  ["아", "아버지", "답변 2개", "참여 중"],
  ["민", "동생 민준", "아직 답변 없음", "초대됨"],
];

const statusVariant = { 완료: "ink", "참여 중": "primary", 초대됨: "default" } as const;

export function InviteScreen({
  go,
  back,
  notify,
}: {
  go: Go;
  back: () => void;
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
      <Topbar back={back} title="가족 초대하기" />

      <section className="mt-6 flex flex-col gap-3">
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
        <Eyebrow>함께 기록하면 더 선명해져요</Eyebrow>
        <h1 className="font-heading text-display-lg font-bold">
          가족의 목소리로
          <br />빈 이야기를 채워주세요
        </h1>
        <p className="text-base leading-relaxed text-body">
          링크를 받은 가족은 회원가입 없이
          <br />
          바로 사진을 보고 답할 수 있어요.
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

      <div className="mt-3 grid grid-cols-3 gap-3">
        <ShareButton icon={<Share2 className="size-5" />} label="공유하기" onClick={share} />
        <ShareButton
          icon={<MessageSquare className="size-5" />}
          label="문자로 보내기"
          onClick={() => {
            window.location.href = `sms:?&body=${encodeURIComponent(`2023년 유럽여행 앨범에 초대해요 ${link}`)}`;
          }}
        />
        <ShareButton icon={<Smartphone className="size-5" />} label="초대 화면 체험" onClick={() => go("guest")} />
      </div>

      <section className="mt-9 flex flex-col gap-2">
        <SectionHeading
          title={<span className="text-lg">함께하는 가족 3명</span>}
          description="답변이 도착하면 알려드릴게요"
        />
        <div className="flex flex-col divide-y divide-border">
          {participants.map(([initial, name, count, status], i) => (
            <ListRow
              key={name}
              onClick={() => notify(`${name} · ${count}`)}
              leading={<InitialsAvatar name={initial} tone={i} size="lg" />}
              title={name}
              description={count}
              trailing={<Badge variant={statusVariant[status]}>{status}</Badge>}
            />
          ))}
        </div>
      </section>

      <BottomNav go={go} active="invite" />
    </>
  );
}

function ShareButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button
      variant="soft"
      onClick={onClick}
      className="h-auto flex-col gap-2 rounded-xl py-4 text-xs font-semibold [&_svg:not([class*='size-'])]:size-5"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-canvas text-ink">{icon}</span>
      {label}
    </Button>
  );
}
