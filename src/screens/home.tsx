import { useState } from "react";
import { ArrowRight, ChevronDown, Ellipsis, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import { Fab } from "@/components/fab";
import { SectionHeading } from "@/components/section-heading";
import { photos } from "@/data/photos";
import type { Go, Notify } from "@/types";

export function HomeScreen({ go, title, notify }: { go: Go; title: string; notify: Notify }) {
  const [recent, setRecent] = useState(true);
  return (
    <>
      <Topbar go={go} />

      <div className="mt-7">
        <h1 className="font-heading text-display-xl font-bold">
          함께 기억하고 싶은
          <br />
          순간이 있나요?
        </h1>
      </div>

      {/* 새 앨범 CTA — canvas 표면 + 소프트 섀도, 오렌지는 아이콘에만 */}
      <Card
        variant="plain"
        size="sm"
        role="button"
        tabIndex={0}
        onClick={() => go("create")}
        onKeyDown={(e) => e.key === "Enter" && go("create")}
        className="mt-7 cursor-pointer shadow-none ring-1 ring-border transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      >
        <CardContent className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-canvas">
            <Plus className="size-6" strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[17px] font-semibold text-ink">새 앨범 만들기</b>
            <small className="block text-sm text-body">사진 한 장에서 시작해보세요</small>
          </span>
          <ArrowRight className="size-5 text-ink" />
        </CardContent>
      </Card>

      <SectionHeading
        className="mt-9"
        title="내 앨범"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="-mr-2"
            onClick={() => {
              setRecent(!recent);
              notify(recent ? "오래된 앨범부터 정렬했어요" : "최근 수정한 앨범부터 정렬했어요");
            }}
          >
            {recent ? "최근 수정순" : "오래된 순"}
            <ChevronDown className="size-4" />
          </Button>
        }
      />

      <RecordCard title={title} go={go} notify={notify} />

      <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink">
          <Sparkles className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-body">
          <b className="block font-semibold text-ink">오늘의 기록 팁</b>
          사진 속 표정보다 그날의 기분을 먼저 물어보세요.
        </p>
      </div>

      <Fab aboveNav onClick={() => go("create")} aria-label="새 앨범 만들기">
        <Plus className="size-6" strokeWidth={2.5} />
      </Fab>
      <BottomNav go={go} active="home" />
    </>
  );
}

function RecordCard({ title, go, notify }: { title: string; go: Go; notify: Notify }) {
  return (
    <Card
      className="mt-4 cursor-pointer transition-shadow hover:shadow-card focus-visible:ring-3 focus-visible:ring-ring/40 outline-none"
      role="button"
      tabIndex={0}
      onClick={() => go("detail")}
      onKeyDown={(e) => e.key === "Enter" && go("detail")}
    >
      <div className="relative -mt-(--card-spacing) aspect-[16/10] overflow-hidden">
        <img src={photos[0].src} alt="해질 녘 에펠탑을 함께 바라보는 가족" className="size-full object-cover" />
        <Badge variant="glass" className="absolute top-3 left-3">
          이야기 수집 중
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-display-sm font-bold">{title}</h3>
            <p className="mt-1 text-sm text-body">2023년 7월 10일 - 7월 17일</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-mt-1 -mr-2"
                aria-label="앨범 더보기"
                onClick={(e) => e.stopPropagation()}
              >
                <Ellipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => notify("앨범 이름 수정 화면을 준비했어요")}>
                이름 수정
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => go("invite")}>공유</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => notify("삭제는 확인 후 진행돼요")}>
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Progress value={70} />
        <div className="flex items-center justify-between text-sm text-body">
          <span>
            <b className="font-semibold text-ink">70%</b> 완성
          </span>
          <span>사진 3 · 목소리 4</span>
        </div>
      </CardContent>
    </Card>
  );
}
