import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** AI 질문 카드 — 흰 바탕에 연한 테두리, 글자는 먹색. 포인트색은 아이콘 블록과 'Q.' 에만 남는다. */
export function QuestionCard({
  eyebrow,
  question,
  children,
}: {
  eyebrow: ReactNode;
  question: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card variant="plain" className="mt-5 bg-canvas shadow-none ring-1 ring-border">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-ink">
            <Sparkles className="size-4" />
          </span>
          <p className="text-sm font-medium text-ink-mid">{eyebrow}</p>
        </div>
        {/* AI 질문은 항상 ‘Q.’ 로 시작한다 — 기록 글과 한눈에 구분된다. */}
        <h1 className="font-heading text-[18px] leading-[1.45] font-bold text-ink">
          <span className="mr-1 text-primary">Q.</span>
          {question}
        </h1>
        {children}
      </CardContent>
    </Card>
  );
}
